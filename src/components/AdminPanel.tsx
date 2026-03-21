import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  ShieldCheck, Check, XCircle, Loader2, AlertCircle, Clock,
  MapPin, Phone, Globe, Mail, Eye, Calendar
} from 'lucide-react';
import { auth, db, collection, query, where, onSnapshot } from '../firebase';

interface AdminPanelProps {
  user: any;
}

export default function AdminPanel({ user }: AdminPanelProps) {
  const [builders, setBuilders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('pending_approval');

  useEffect(() => {
    const q = query(collection(db, 'builders'), where('status', '==', filter));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setBuilders(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [filter]);

  const handleAction = async (builderId: string, action: 'approve' | 'reject') => {
    setProcessing(builderId);
    setError(null);

    try {
      const token = await auth.currentUser?.getIdToken();
      const response = await fetch('/api/admin/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ builderId, action }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || `Failed to ${action} builder`);
      }
    } catch (err: any) {
      setError(err.message || `Failed to ${action} builder`);
    } finally {
      setProcessing(null);
    }
  };

  const filters = [
    { value: 'pending_approval', label: 'Pending Approval', icon: Clock },
    { value: 'active', label: 'Active', icon: Check },
    { value: 'suspended', label: 'Suspended', icon: AlertCircle },
    { value: 'rejected', label: 'Rejected', icon: XCircle },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-brand-primary rounded-2xl flex items-center justify-center text-white">
          <ShieldCheck size={24} />
        </div>
        <div>
          <h1 className="text-4xl font-serif italic text-stone-900">Admin Panel</h1>
          <p className="text-stone-600">Manage builder listings and approvals</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl flex items-center gap-3">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => { setFilter(f.value); setLoading(true); }}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
              filter === f.value
                ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20'
                : 'bg-white text-stone-600 hover:bg-stone-50 border border-stone-200'
            }`}
          >
            <f.icon size={16} />
            {f.label}
          </button>
        ))}
      </div>

      {/* Builder List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-brand-primary" size={32} />
        </div>
      ) : builders.length === 0 ? (
        <div className="py-20 text-center">
          <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Eye size={28} className="text-stone-400" />
          </div>
          <h3 className="text-xl font-bold text-stone-900">No builders found</h3>
          <p className="text-stone-500 mt-2">No builders with status "{filter.replace('_', ' ')}"</p>
        </div>
      ) : (
        <div className="space-y-4">
          {builders.map((builder) => (
            <motion.div
              key={builder.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-stone-200 p-6 flex flex-col md:flex-row md:items-center gap-6"
            >
              {/* Builder Info */}
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold text-stone-900">{builder.name}</h3>
                  <span className="px-3 py-1 bg-stone-100 text-stone-600 rounded-full text-xs font-bold uppercase">
                    {builder.plan}
                  </span>
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-stone-600">
                  {builder.location && (
                    <span className="flex items-center gap-1.5">
                      <MapPin size={14} className="text-stone-400" />
                      {builder.location}
                    </span>
                  )}
                  {builder.phone && (
                    <span className="flex items-center gap-1.5">
                      <Phone size={14} className="text-stone-400" />
                      {builder.phone}
                    </span>
                  )}
                  {builder.email && (
                    <span className="flex items-center gap-1.5">
                      <Mail size={14} className="text-stone-400" />
                      {builder.email}
                    </span>
                  )}
                  {builder.website && (
                    <a href={builder.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-brand-primary hover:underline">
                      <Globe size={14} />
                      Website
                    </a>
                  )}
                </div>

                {builder.description && (
                  <p className="text-stone-500 text-sm line-clamp-2">{builder.description}</p>
                )}

                {builder.specialties?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {builder.specialties.map((spec: string, i: number) => (
                      <span key={i} className="px-3 py-1 bg-stone-50 text-stone-600 rounded-lg text-xs font-medium border border-stone-100">
                        {spec}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-2 text-xs text-stone-400">
                  <Calendar size={12} />
                  Applied: {builder.createdAt?.toDate?.()?.toLocaleDateString() || 'Unknown'}
                </div>
              </div>

              {/* Actions */}
              {filter === 'pending_approval' && (
                <div className="flex gap-3 shrink-0">
                  <button
                    onClick={() => handleAction(builder.id, 'approve')}
                    disabled={processing === builder.id}
                    className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all flex items-center gap-2 text-sm"
                  >
                    {processing === builder.id ? (
                      <Loader2 className="animate-spin" size={16} />
                    ) : (
                      <Check size={16} />
                    )}
                    Approve
                  </button>
                  <button
                    onClick={() => handleAction(builder.id, 'reject')}
                    disabled={processing === builder.id}
                    className="px-6 py-3 bg-red-100 text-red-600 rounded-xl font-bold hover:bg-red-200 transition-all flex items-center gap-2 text-sm"
                  >
                    <XCircle size={16} />
                    Reject
                  </button>
                </div>
              )}

              {filter === 'suspended' && (
                <button
                  onClick={() => handleAction(builder.id, 'approve')}
                  disabled={processing === builder.id}
                  className="px-6 py-3 bg-brand-primary text-white rounded-xl font-bold hover:bg-brand-primary/90 transition-all flex items-center gap-2 text-sm shrink-0"
                >
                  {processing === builder.id ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <Check size={16} />
                  )}
                  Reactivate
                </button>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
