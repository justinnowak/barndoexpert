import React from 'react';
import { ArrowRight, CheckCircle2, DollarSign, Hammer, ShieldCheck, MessageSquare } from 'lucide-react';
import { motion } from 'motion/react';
import USAMap from './USAMap';

interface HomeProps {
  onStartChat: () => void;
  onFindBuilder: () => void;
}

export default function Home({ onStartChat, onFindBuilder }: HomeProps) {
  return (
    <div className="space-y-24">
      {/* Hero Section */}
      <section className="relative flex flex-col lg:flex-row items-center gap-12">
        <div className="flex-1 space-y-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-brand-primary/10 text-brand-primary rounded-full text-sm font-bold"
          >
            <ShieldCheck size={16} />
            The Only Barndominium-Specific Resource
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-7xl font-serif italic leading-[1.1] text-stone-900"
          >
            Build Your Dream <br />
            <span className="text-brand-primary">Barndominium.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-stone-600 max-w-xl leading-relaxed"
          >
            The industry's primary resource for barndominium construction, financing, and design. Connect with the only network dedicated exclusively to specialized builders.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 pt-4"
          >
            <button 
              onClick={onStartChat}
              className="px-8 py-4 bg-brand-primary text-white rounded-full font-bold hover:bg-brand-primary/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-primary/20 group"
            >
              Ask Our AI Expert
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={onFindBuilder}
              className="px-8 py-4 bg-white text-stone-900 border border-stone-200 rounded-full font-bold hover:bg-stone-50 transition-all flex items-center justify-center gap-2"
            >
              Find Local Builders
            </button>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="flex-1 relative"
        >
          <div className="relative rounded-[2rem] overflow-hidden shadow-2xl aspect-[4/3]">
            <img 
              src="https://texascompletebarndosolutions.com/wp-content/uploads/2025/12/Luxury-barndominium-exterior-design-made-for-a-client-1.webp" 
              alt="Modern Barndominium" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-900/40 to-transparent" />
          </div>
          {/* Floating Stats */}
          <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-xl border border-stone-100 hidden md:block">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <p className="text-2xl font-bold text-stone-900">500+</p>
                <p className="text-xs text-stone-500 uppercase tracking-wider font-bold">Verified Builders</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="space-y-4">
          <div className="w-14 h-14 bg-white rounded-2xl shadow-md flex items-center justify-center text-brand-primary">
            <MessageSquare size={28} />
          </div>
          <h3 className="text-2xl font-serif italic text-stone-900">Interactive AI Guide</h3>
          <p className="text-stone-600 leading-relaxed">
            Our AI expert is trained on thousands of barndominium projects to answer your specific questions about insulation, framing, and costs.
          </p>
        </div>
        <div className="space-y-4">
          <div className="w-14 h-14 bg-white rounded-2xl shadow-md flex items-center justify-center text-brand-primary">
            <DollarSign size={28} />
          </div>
          <h3 className="text-2xl font-serif italic text-stone-900">Financing Simplified</h3>
          <p className="text-stone-600 leading-relaxed">
            Learn about construction-to-permanent loans and how to get your barndo project appraised correctly for the bank.
          </p>
        </div>
        <div className="space-y-4">
          <div className="w-14 h-14 bg-white rounded-2xl shadow-md flex items-center justify-center text-brand-primary">
            <Hammer size={28} />
          </div>
          <h3 className="text-2xl font-serif italic text-stone-900">Expert Builders</h3>
          <p className="text-stone-600 leading-relaxed">
            Skip the guesswork. We list builders who have a proven track record of delivering high-quality metal building homes.
          </p>
        </div>
      </section>

      {/* National Coverage Map */}
      <USAMap />

      {/* CTA Section */}
      <section className="bg-brand-primary rounded-[3rem] p-12 md:p-20 text-center space-y-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-brand-accent rounded-full blur-3xl" />
        </div>
        
        <h2 className="text-4xl md:text-5xl font-serif italic text-white relative z-10">
          Ready to start your <br /> barndominium journey?
        </h2>
        <p className="text-white/80 text-lg max-w-2xl mx-auto relative z-10">
          Whether you're just dreaming or ready to break ground, BarndoExpert is here to guide you every step of the way.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
          <button 
            onClick={onStartChat}
            className="px-10 py-4 bg-white text-brand-primary rounded-full font-bold hover:bg-stone-50 transition-all shadow-xl"
          >
            Chat with AI Now
          </button>
          <button 
            onClick={onFindBuilder}
            className="px-10 py-4 bg-brand-primary/20 text-white rounded-full font-bold hover:bg-brand-primary/30 transition-all border border-white/20"
          >
            Browse Builders
          </button>
        </div>
      </section>
    </div>
  );
}
