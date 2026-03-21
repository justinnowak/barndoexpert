import React from 'react';
import { MapPin, Star, Phone, Globe, Mail, ShieldCheck, ArrowLeft, CheckCircle2, Clock, Award, Camera, MessageSquare, Share2, Heart } from 'lucide-react';
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
  galleryImages?: string[];
}

interface BuilderProfileProps {
  builder: Builder;
  onBack: () => void;
}

export default function BuilderProfile({ builder, onBack }: BuilderProfileProps) {
  const defaultImages = [
    "https://texascompletebarndosolutions.com/wp-content/uploads/2025/12/3D-rendered-barndominium-design-for-client-in-central-Texas.webp",
    "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1500076656116-558758c991c1?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1449156003053-c30670b98832?auto=format&fit=crop&w=800&q=80"
  ];

  // Use real gallery images if available, otherwise fall back to defaults
  const galleryImages = builder.galleryImages?.length ? builder.galleryImages : defaultImages;

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20">
      {/* Navigation & Actions */}
      <div className="flex items-center justify-between">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-stone-500 hover:text-stone-900 transition-colors font-medium"
        >
          <ArrowLeft size={20} />
          Back to Directory
        </button>
        <div className="flex gap-3">
          <button className="p-2 text-stone-400 hover:text-stone-900 transition-colors border border-stone-200 rounded-full">
            <Share2 size={20} />
          </button>
          <button className="p-2 text-stone-400 hover:text-red-500 transition-colors border border-stone-200 rounded-full">
            <Heart size={20} />
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {builder.isVerified && (
                <div className="inline-flex items-center gap-1 px-3 py-1 bg-brand-primary/10 text-brand-primary rounded-full text-xs font-bold uppercase tracking-wider">
                  <ShieldCheck size={14} />
                  Verified Specialist
                </div>
              )}
              <div className="inline-flex items-center gap-1 px-3 py-1 bg-stone-100 text-stone-600 rounded-full text-xs font-bold uppercase tracking-wider">
                <Award size={14} />
                Top Rated 2026
              </div>
            </div>
            <h1 className="text-6xl font-serif italic text-stone-900">{builder.name}</h1>
            <div className="flex flex-wrap items-center gap-6 text-stone-500">
              <div className="flex items-center gap-1.5">
                <MapPin size={18} className="text-brand-primary" />
                <span className="font-medium">{builder.location}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Star size={18} className="text-amber-500 fill-amber-500" />
                <span className="font-bold text-stone-900">{builder.rating || 'New'}</span>
                <span>({builder.reviews || 0} reviews)</span>
              </div>
            </div>
          </div>

          <div className="aspect-[21/9] rounded-3xl overflow-hidden shadow-2xl">
            <img 
              src={builder.image || galleryImages[0]} 
              alt={builder.name} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="space-y-6">
            <h2 className="text-3xl font-serif italic text-stone-900">About the Builder</h2>
            <p className="text-lg text-stone-600 leading-relaxed">
              {builder.description || "Leading the way in barndominium construction, we bring decades of expertise to every project. Our commitment to quality, transparency, and innovative design ensures your dream home becomes a reality."}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              {builder.specialties?.map((specialty, i) => (
                <div key={i} className="flex items-center gap-3 p-4 bg-stone-50 rounded-2xl border border-stone-100">
                  <CheckCircle2 className="text-emerald-600" size={20} />
                  <span className="font-bold text-stone-900">{specialty}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar / Contact Card */}
        <div className="space-y-8">
          <div className="bg-white rounded-[2.5rem] p-8 border border-stone-200 shadow-xl sticky top-8">
            <h3 className="text-2xl font-serif italic text-stone-900 mb-6">Contact Builder</h3>
            <div className="space-y-6">
              <a 
                href={`tel:${builder.phone}`}
                className="flex items-center gap-4 p-4 bg-stone-50 rounded-2xl border border-stone-100 hover:border-brand-primary transition-all group"
              >
                <div className="w-12 h-12 bg-brand-primary/10 text-brand-primary rounded-xl flex items-center justify-center group-hover:bg-brand-primary group-hover:text-white transition-colors">
                  <Phone size={24} />
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-400 uppercase tracking-widest">Phone</div>
                  <div className="font-bold text-stone-900">{builder.phone}</div>
                </div>
              </a>

              {builder.email && (
                <a 
                  href={`mailto:${builder.email}`}
                  className="flex items-center gap-4 p-4 bg-stone-50 rounded-2xl border border-stone-100 hover:border-brand-primary transition-all group"
                >
                  <div className="w-12 h-12 bg-brand-primary/10 text-brand-primary rounded-xl flex items-center justify-center group-hover:bg-brand-primary group-hover:text-white transition-colors">
                    <Mail size={24} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-stone-400 uppercase tracking-widest">Email</div>
                    <div className="font-bold text-stone-900 truncate max-w-[180px]">{builder.email}</div>
                  </div>
                </a>
              )}

              {builder.website && (
                <a 
                  href={builder.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 bg-stone-50 rounded-2xl border border-stone-100 hover:border-brand-primary transition-all group"
                >
                  <div className="w-12 h-12 bg-brand-primary/10 text-brand-primary rounded-xl flex items-center justify-center group-hover:bg-brand-primary group-hover:text-white transition-colors">
                    <Globe size={24} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-stone-400 uppercase tracking-widest">Website</div>
                    <div className="font-bold text-stone-900">Visit Site</div>
                  </div>
                </a>
              )}

              <button className="w-full py-5 bg-brand-primary text-white rounded-2xl font-bold hover:bg-brand-primary/90 transition-all shadow-xl shadow-brand-primary/20 flex items-center justify-center gap-3">
                <MessageSquare size={20} />
                Send Message
              </button>

              <div className="pt-6 border-t border-stone-100 flex items-center justify-between text-stone-400 text-sm">
                <div className="flex items-center gap-1.5">
                  <Clock size={14} />
                  Responds in ~2h
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck size={14} />
                  Secure
                </div>
              </div>
            </div>
          </div>

          <div className="bg-stone-900 rounded-[2.5rem] p-8 text-white space-y-4">
            <h4 className="text-xl font-serif italic">Why this builder?</h4>
            <ul className="space-y-3 text-sm text-stone-400">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-brand-primary rounded-full mt-1.5 shrink-0" />
                Verified license and insurance
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-brand-primary rounded-full mt-1.5 shrink-0" />
                Specialized in steel-frame construction
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-brand-primary rounded-full mt-1.5 shrink-0" />
                Proven track record with 50+ builds
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Project Gallery */}
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-4xl font-serif italic text-stone-900">Project Gallery</h2>
          <button className="flex items-center gap-2 text-brand-primary font-bold hover:underline">
            <Camera size={20} />
            View All Projects
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {galleryImages.map((img, i) => (
            <motion.div 
              key={i}
              whileHover={{ scale: 1.02 }}
              className="aspect-square rounded-2xl overflow-hidden bg-stone-100 border border-stone-200"
            >
              <img 
                src={img} 
                alt={`Project ${i + 1}`} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Reviews Section */}
      <div className="space-y-8">
        <h2 className="text-4xl font-serif italic text-stone-900">Client Reviews</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="p-8 bg-white rounded-3xl border border-stone-200 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-stone-100 rounded-full" />
                  <div>
                    <div className="font-bold text-stone-900">John D.</div>
                    <div className="text-xs text-stone-400">Verified Homeowner</div>
                  </div>
                </div>
                <div className="flex text-amber-500">
                  {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                </div>
              </div>
              <p className="text-stone-600 italic leading-relaxed">
                "Working with {builder.name} was an absolute pleasure. They took our vision and turned it into a stunning barndominium that exceeded all our expectations. The attention to detail is unmatched."
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
