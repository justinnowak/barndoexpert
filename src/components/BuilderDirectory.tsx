import React, { useState, useEffect } from 'react';
import { Search, MapPin, Star, Phone, ExternalLink, ShieldCheck, Loader2, MessageSquare } from 'lucide-react';
import { motion } from 'motion/react';

interface Builder {
  id: string;
  name: string;
  email?: string;
  location: string;
  address?: string;
  website?: string;
  description?: string;
  rating?: number;
  reviews?: number;
  specialties?: string[];
  phone: string;
  isVerified?: boolean;
  image?: string;
}

interface BuilderDirectoryProps {
  onSignup: () => void;
  onSelectBuilder: (builder: Builder) => void;
  user?: any;
}

export default function BuilderDirectory({ onSignup, onSelectBuilder, user }: BuilderDirectoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [builders, setBuilders] = useState<Builder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const trackClick = async (builderId: string, type: 'website' | 'email' | 'call') => {
    try {
      await fetch('/api/builders/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ builderId, type }),
      });
    } catch {}
  };

  useEffect(() => {
    fetch('/api/builders')
      .then(r => r.json())
      .then(data => { setBuilders(data); setIsLoading(false); })
      .catch(() => setIsLoading(false));
  }, []);

  const filteredBuilders = builders.filter(b =>
    b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h2 className="text-5xl font-serif italic text-stone-900">Builder Directory</h2>
          <p className="text-stone-600">Find verified barndominium specialists in your area.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
            <input
              type="text"
              placeholder="Search by name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-stone-200 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-emerald-600" size={48} />
          </div>
        ) : filteredBuilders.length > 0 ? (
          filteredBuilders.map((builder) => (
            <motion.div
              key={builder.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              onClick={() => onSelectBuilder(builder)}
              className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={builder.image || `https://storage.googleapis.com/mle-sams-bucket/ais-dev-6gbeckohfmfsol6ha4pjhe-538145166341/1742564166297-image1.png`}
                  alt={builder.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                {builder.isVerified && (
                  <div className="absolute top-4 right-4 bg-brand-primary text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 shadow-lg">
                    <ShieldCheck size={14} />
                    Verified
                  </div>
                )}
              </div>

              <div className="p-5 space-y-4">
                <div>
                  <h3 className="text-xl font-semibold text-stone-900">{builder.name}</h3>
                  <div className="flex items-center text-stone-500 text-sm mt-1">
                    <MapPin size={14} className="mr-1" />
                    {builder.location}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center text-amber-500">
                    <Star size={16} fill="currentColor" className="mr-1" />
                    <span className="font-bold text-stone-900">{builder.rating || 'New'}</span>
                  </div>
                  <span className="text-stone-400 text-sm">{builder.reviews || 0} reviews</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {builder.specialties?.map(s => (
                    <span key={s} className="px-2 py-1 bg-stone-100 text-stone-600 text-xs rounded-md">
                      {s}
                    </span>
                  ))}
                </div>

                {builder.description && (
                  <p className="text-stone-500 text-sm line-clamp-2 italic">
                    "{builder.description}"
                  </p>
                )}

                <div className="pt-4 border-t border-stone-100 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <a
                      href={`tel:${builder.phone}`}
                      onClick={() => trackClick(builder.id, 'call')}
                      className="flex items-center text-brand-primary font-medium hover:text-brand-primary/80 transition-colors"
                    >
                      <Phone size={16} className="mr-2" />
                      Call Now
                    </a>
                    {builder.website ? (
                      <a
                        href={builder.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => trackClick(builder.id, 'website')}
                        className="p-2 text-stone-400 hover:text-brand-primary transition-colors"
                        title="Visit Website"
                      >
                        <ExternalLink size={20} />
                      </a>
                    ) : (
                      <button className="p-2 text-stone-300 cursor-not-allowed" disabled>
                        <ExternalLink size={20} />
                      </button>
                    )}
                  </div>
                  {builder.email && (
                    <a
                      href={`mailto:${builder.email}`}
                      onClick={() => trackClick(builder.id, 'email')}
                      className="flex items-center text-stone-500 hover:text-stone-900 transition-colors text-sm"
                    >
                      <MessageSquare size={14} className="mr-2" />
                      {builder.email}
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full text-center py-20 bg-white rounded-3xl border border-dashed border-stone-200">
            <p className="text-stone-500">No builders found matching your search.</p>
          </div>
        )}
      </div>

      <div className="bg-stone-900 text-white rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="max-w-md">
          <h3 className="text-2xl font-serif italic mb-2">Are you a builder?</h3>
          <p className="text-stone-400">Join our directory and reach thousands of homeowners looking for barndominium specialists.</p>
        </div>
        <button
          onClick={onSignup}
          className="px-8 py-4 bg-emerald-600 text-white rounded-full font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-900/20"
        >
          List Your Business
        </button>
      </div>
    </div>
  );
}
