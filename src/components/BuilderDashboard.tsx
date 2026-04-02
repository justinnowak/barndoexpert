import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  LayoutDashboard, BarChart3, Edit3, ImagePlus, CreditCard,
  Eye, MousePointer2, Mail, PhoneCall, TrendingUp, Save, Loader2,
  AlertCircle, Check, Clock, XCircle, ExternalLink,
  Camera
} from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';

interface BuilderDashboardProps {
  user: any;
}

type DashboardTab = 'overview' | 'edit' | 'photos' | 'billing';

export default function BuilderDashboard({ user }: BuilderDashboardProps) {
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [builderDoc, setBuilderDoc] = useState<any>(null);
  const [builderId, setBuilderId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { getToken } = useAuth();

  // Edit form state
  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    website: '',
    description: '',
    specialties: '',
    location: '',
    address: '',
  });

  // Analytics state
  const [analytics, setAnalytics] = useState({
    profileViews: 0,
    websiteClicks: 0,
    emailClicks: 0,
    phoneCalls: 0,
    chartData: [] as any[],
  });

  // Load builder doc
  useEffect(() => {
    if (!user?.uid) return;
    const load = async () => {
      try {
        const token = await getToken();
        const res = await fetch('/api/builders/me', { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) { setLoading(false); return; }
        const data = await res.json();
        setBuilderDoc(data);
        setBuilderId(data.id);
        setEditForm({
          name: data.name || '',
          phone: data.phone || '',
          website: data.website || '',
          description: data.description || '',
          specialties: (data.specialties || []).join(', '),
          location: data.location || '',
          address: data.address || '',
        });
      } catch (err) {
        console.error('Failed to load builder:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, getToken]);

  // Load analytics
  useEffect(() => {
    if (!builderId) return;

    const loadAnalytics = async () => {
      try {
        const token = await getToken();
        const res = await fetch('/api/builders/analytics', { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) return;
        const data = await res.json();
        setAnalytics(data);
      } catch (err) {
        console.error('Failed to load analytics:', err);
      }
    };

    loadAnalytics();
  }, [builderId, getToken]);

  // Save edited listing
  const handleSave = async () => {
    if (!builderId) return;
    setSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      const token = await getToken();
      const res = await fetch('/api/builders/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: editForm.name,
          phone: editForm.phone,
          website: editForm.website,
          description: editForm.description,
          specialties: editForm.specialties.split(',').map(s => s.trim()).filter(s => s),
          location: editForm.location,
          address: editForm.address,
        }),
      });
      if (!res.ok) throw new Error('Failed to save changes');
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setError('Failed to save changes. Please try again.');
      console.error('Save error:', err);
    } finally {
      setSaving(false);
    }
  };

  // Open Stripe billing portal
  const handleManageBilling = async () => {
    try {
      const token = await getToken();
      const response = await fetch('/api/stripe/create-portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to open billing portal');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to open billing portal.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-brand-primary" size={32} />
          <p className="text-stone-500 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!builderDoc) {
    return (
      <div className="max-w-lg mx-auto py-20 text-center space-y-6">
        <AlertCircle size={48} className="text-stone-400 mx-auto" />
        <h2 className="text-3xl font-serif italic text-stone-900">No Builder Listing Found</h2>
        <p className="text-stone-600">You don't have a builder listing yet. Sign up to create one.</p>
      </div>
    );
  }

  const statusConfig: Record<string, { color: string; icon: any; label: string; message: string }> = {
    pending_payment: {
      color: 'bg-amber-50 border-amber-200 text-amber-800',
      icon: Clock,
      label: 'Payment Pending',
      message: 'Complete your payment to proceed with your listing.',
    },
    pending_approval: {
      color: 'bg-blue-50 border-blue-200 text-blue-800',
      icon: Clock,
      label: 'Pending Approval',
      message: 'Your payment was received. Our team is reviewing your listing.',
    },
    active: {
      color: 'bg-emerald-50 border-emerald-200 text-emerald-800',
      icon: Check,
      label: 'Active',
      message: 'Your listing is live and visible to homeowners.',
    },
    suspended: {
      color: 'bg-red-50 border-red-200 text-red-800',
      icon: XCircle,
      label: 'Suspended',
      message: 'Your listing has been suspended. Please check your billing.',
    },
    rejected: {
      color: 'bg-red-50 border-red-200 text-red-800',
      icon: XCircle,
      label: 'Rejected',
      message: 'Your listing application was not approved. Please contact support.',
    },
  };

  const status = statusConfig[builderDoc.status] || statusConfig.pending_payment;
  const StatusIcon = status.icon;

  const tabs = [
    { id: 'overview' as DashboardTab, label: 'Overview', icon: BarChart3 },
    { id: 'edit' as DashboardTab, label: 'Edit Listing', icon: Edit3 },
    { id: 'photos' as DashboardTab, label: 'Photos', icon: ImagePlus },
    { id: 'billing' as DashboardTab, label: 'Billing', icon: CreditCard },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-serif italic text-stone-900">Builder Dashboard</h1>
          <p className="text-stone-600 mt-1">{builderDoc.name}</p>
        </div>
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-bold ${status.color}`}>
          <StatusIcon size={16} />
          {status.label}
        </div>
      </div>

      {/* Status Banner */}
      {builderDoc.status !== 'active' && (
        <div className={`p-4 rounded-2xl border ${status.color} flex items-center gap-3`}>
          <StatusIcon size={20} />
          <span className="text-sm font-medium">{status.message}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl flex items-center gap-3">
          <AlertCircle size={20} />
          {error}
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">
            <XCircle size={18} />
          </button>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20'
                : 'bg-white text-stone-600 hover:bg-stone-50 border border-stone-200'
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-2xl border border-stone-200 space-y-3">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                  <Eye size={20} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-stone-900">{analytics.profileViews.toLocaleString()}</div>
                  <div className="text-xs font-bold text-stone-400 uppercase tracking-wider">Profile Views</div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-stone-200 space-y-3">
                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                  <MousePointer2 size={20} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-stone-900">{analytics.websiteClicks.toLocaleString()}</div>
                  <div className="text-xs font-bold text-stone-400 uppercase tracking-wider">Website Clicks</div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-stone-200 space-y-3">
                <div className="w-10 h-10 bg-brand-accent/10 text-brand-accent rounded-xl flex items-center justify-center">
                  <Mail size={20} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-stone-900">{analytics.emailClicks.toLocaleString()}</div>
                  <div className="text-xs font-bold text-stone-400 uppercase tracking-wider">Email Clicks</div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-stone-200 space-y-3">
                <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                  <PhoneCall size={20} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-stone-900">{analytics.phoneCalls.toLocaleString()}</div>
                  <div className="text-xs font-bold text-stone-400 uppercase tracking-wider">Phone Calls</div>
                </div>
              </div>
            </div>

            {/* Analytics Chart */}
            <div className="bg-white rounded-2xl border border-stone-200 p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-stone-900">Activity (Last 30 Days)</h3>
              </div>
              {analytics.chartData.length > 0 ? (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics.chartData}>
                      <defs>
                        <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#1a365d" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#1a365d" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#d97706" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#d97706" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#a8a29e', fontSize: 12 }} />
                      <YAxis hide />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                      <Area type="monotone" dataKey="views" stroke="#1a365d" strokeWidth={2} fillOpacity={1} fill="url(#colorViews)" name="Views" />
                      <Area type="monotone" dataKey="clicks" stroke="#d97706" strokeWidth={2} fillOpacity={1} fill="url(#colorClicks)" name="Clicks" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[200px] flex items-center justify-center text-stone-400">
                  <div className="text-center space-y-2">
                    <BarChart3 size={40} className="mx-auto opacity-50" />
                    <p className="font-medium">No analytics data yet</p>
                    <p className="text-sm">Data will appear here as homeowners interact with your listing.</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Edit Listing Tab */}
        {activeTab === 'edit' && (
          <div className="bg-white rounded-2xl border border-stone-200 p-8">
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-stone-900">Edit Your Listing</h3>
              <p className="text-stone-600 text-sm mt-1">Update your business information visible to homeowners.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-stone-700 uppercase tracking-wider">Business Name</label>
                <input
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-stone-700 uppercase tracking-wider">Phone Number</label>
                <input
                  value={editForm.phone}
                  onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-stone-700 uppercase tracking-wider">Website URL</label>
                <input
                  value={editForm.website}
                  onChange={(e) => setEditForm(prev => ({ ...prev, website: e.target.value }))}
                  placeholder="https://yourwebsite.com"
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-stone-700 uppercase tracking-wider">Service Area</label>
                <input
                  value={editForm.location}
                  onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-stone-700 uppercase tracking-wider">Physical Address</label>
                <input
                  value={editForm.address}
                  onChange={(e) => setEditForm(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-stone-700 uppercase tracking-wider">Specialties (comma separated)</label>
                <input
                  value={editForm.specialties}
                  onChange={(e) => setEditForm(prev => ({ ...prev, specialties: e.target.value }))}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-bold text-stone-700 uppercase tracking-wider">Business Description</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none resize-none"
                />
              </div>

              <div className="md:col-span-2 flex items-center gap-4 pt-4">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-8 py-3 bg-brand-primary text-white rounded-xl font-bold hover:bg-brand-primary/90 transition-all flex items-center gap-2 shadow-lg"
                >
                  {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                {saveSuccess && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-emerald-600 font-bold flex items-center gap-2"
                  >
                    <Check size={18} /> Changes saved!
                  </motion.span>
                )}
              </div>
            </div>

            {/* Non-editable fields */}
            <div className="mt-8 pt-8 border-t border-stone-100">
              <h4 className="text-sm font-bold text-stone-400 uppercase tracking-wider mb-4">Account Details (Contact support to change)</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-stone-50 rounded-xl">
                  <div className="text-xs font-bold text-stone-400 uppercase tracking-wider">Email</div>
                  <div className="text-stone-900 font-medium mt-1">{builderDoc.email}</div>
                </div>
                <div className="p-4 bg-stone-50 rounded-xl">
                  <div className="text-xs font-bold text-stone-400 uppercase tracking-wider">Plan</div>
                  <div className="text-stone-900 font-medium mt-1 capitalize">{builderDoc.plan}</div>
                </div>
                <div className="p-4 bg-stone-50 rounded-xl">
                  <div className="text-xs font-bold text-stone-400 uppercase tracking-wider">Status</div>
                  <div className="text-stone-900 font-medium mt-1 capitalize">{builderDoc.status?.replace('_', ' ')}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Photos Tab */}
        {activeTab === 'photos' && (
          <div className="space-y-8">
            {/* Profile Photo */}
            <div className="bg-white rounded-2xl border border-stone-200 p-8">
              <h3 className="text-xl font-bold text-stone-900 mb-4">Profile Photo</h3>
              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-2xl overflow-hidden bg-stone-100 border-2 border-stone-200 relative">
                  {builderDoc.image ? (
                    <img src={builderDoc.image} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-400">
                      <Camera size={32} />
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-stone-500 text-sm">Photo uploads coming soon.</p>
                </div>
              </div>
            </div>

            {/* Gallery Photos */}
            <div className="bg-white rounded-2xl border border-stone-200 p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-stone-900">Gallery Photos</h3>
                  <p className="text-stone-500 text-sm mt-1">
                    {(builderDoc.galleryImages?.length || 0)} / {builderDoc.plan === 'professional' ? 50 : 5} photos used
                    <span className="text-stone-400"> ({builderDoc.plan || 'Basic'} plan)</span>
                  </p>
                </div>
              </div>

              {builderDoc.galleryImages?.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {builderDoc.galleryImages.map((url: string, index: number) => (
                    <div key={index} className="relative aspect-square rounded-xl overflow-hidden bg-stone-100">
                      <img src={url} alt={`Gallery ${index + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center border-2 border-dashed border-stone-200 rounded-2xl">
                  <ImagePlus size={40} className="mx-auto text-stone-300 mb-4" />
                  <p className="text-stone-500 font-medium">No gallery photos yet</p>
                  <p className="text-stone-400 text-sm mt-1">Photo uploads coming soon.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Billing Tab */}
        {activeTab === 'billing' && (
          <div className="bg-white rounded-2xl border border-stone-200 p-8 space-y-8">
            <h3 className="text-2xl font-bold text-stone-900">Billing & Subscription</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-stone-50 rounded-2xl border border-stone-100">
                <div className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Current Plan</div>
                <div className="text-2xl font-bold text-stone-900 capitalize">{builderDoc.plan || 'Basic'}</div>
                <div className="text-stone-500 text-sm mt-1">
                  {builderDoc.plan === 'professional' ? '$29' : '$19'}/month
                </div>
              </div>

              <div className="p-6 bg-stone-50 rounded-2xl border border-stone-100">
                <div className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Subscription Status</div>
                <div className={`text-lg font-bold capitalize ${
                  builderDoc.subscriptionStatus === 'active' ? 'text-emerald-600' :
                  builderDoc.subscriptionStatus === 'past_due' ? 'text-amber-600' :
                  'text-red-600'
                }`}>
                  {builderDoc.subscriptionStatus?.replace('_', ' ') || 'N/A'}
                </div>
              </div>

              <div className="p-6 bg-stone-50 rounded-2xl border border-stone-100">
                <div className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Member Since</div>
                <div className="text-lg font-bold text-stone-900">
                  {builderDoc.createdAt ? new Date(builderDoc.createdAt).toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric',
                  }) : 'N/A'}
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={handleManageBilling}
                className="px-8 py-3 bg-brand-primary text-white rounded-xl font-bold hover:bg-brand-primary/90 transition-all flex items-center gap-2"
              >
                <ExternalLink size={18} />
                Manage Billing on Stripe
              </button>
              <p className="text-stone-400 text-sm mt-3">
                Update your payment method, view invoices, or change your subscription plan.
              </p>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
