import React from 'react';
import { motion } from 'motion/react';
import { MapPin, CheckCircle2 } from 'lucide-react';

export default function USAMap() {
  return (
    <section className="py-24 bg-stone-900 rounded-[3rem] overflow-hidden relative">
      {/* Background patterns */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-primary rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-accent rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-accent text-white rounded-full text-sm font-bold shadow-lg shadow-brand-accent/30"
            >
              <MapPin size={16} />
              National Network
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-6xl font-serif italic text-white leading-tight"
            >
              Coverage in All <br />
              <span className="text-brand-primary">50 States.</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-xl text-stone-400 leading-relaxed max-w-lg"
            >
              Whether you're building in the heart of Texas or the mountains of Montana, our network of specialized barndominium contractors has you covered.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-2 gap-6 pt-4"
            >
              <div className="flex items-center gap-3 text-white">
                <CheckCircle2 className="text-brand-primary" size={20} />
                <span className="font-bold">Verified Builders</span>
              </div>
              <div className="flex items-center gap-3 text-white">
                <CheckCircle2 className="text-brand-primary" size={20} />
                <span className="font-bold">Local Expertise</span>
              </div>
              <div className="flex items-center gap-3 text-white">
                <CheckCircle2 className="text-brand-primary" size={20} />
                <span className="font-bold">50 State Coverage</span>
              </div>
              <div className="flex items-center gap-3 text-white">
                <CheckCircle2 className="text-brand-primary" size={20} />
                <span className="font-bold">Financing Support</span>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative aspect-[16/9] w-full bg-stone-800/50 rounded-2xl overflow-hidden"
          >
            {/* User Requested US Map Image */}
            <img 
              src="https://t3.ftcdn.net/jpg/00/11/44/08/360_F_11440825_gzv1OtevCmrEzj6j1PEUumLeIdnrkngG.jpg" 
              alt="US Map with State Borders" 
              className="w-full h-full object-cover mix-blend-luminosity opacity-90"
              referrerPolicy="no-referrer"
            />
            
            {/* Overlay Pins using absolute percentages for accuracy on this specific map projection */}
            <div className="absolute inset-0 pointer-events-none">
              {[
                { x: '10%', y: '12%', label: "WA" },
                { x: '7%', y: '55%', label: "CA" },
                { x: '16%', y: '70%', label: "AZ" },
                { x: '32%', y: '22%', label: "MT" },
                { x: '36%', y: '45%', label: "CO" },
                { x: '48%', y: '72%', label: "TX" },
                { x: '63%', y: '32%', label: "IL" },
                { x: '80%', y: '22%', label: "NY" },
                { x: '86%', y: '42%', label: "NC" },
                { x: '83%', y: '78%', label: "FL" },
                { x: '76%', y: '65%', label: "GA" },
                { x: '58%', y: '52%', label: "MO" },
                { x: '70%', y: '28%', label: "OH" },
                { x: '22%', y: '38%', label: "NV" },
                { x: '45%', y: '35%', label: "NE" },
                { x: '68%', y: '58%', label: "TN" },
              ].map((pin, i) => (
                <motion.div
                  key={i}
                  style={{ left: pin.x, top: pin.y }}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + (i * 0.05), type: 'spring' }}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                >
                  <div className="relative">
                    <div className="w-2.5 h-2.5 bg-brand-primary rounded-full shadow-[0_0_12px_rgba(242,125,38,0.8)]" />
                    <motion.div
                      className="absolute inset-0 w-2.5 h-2.5 border-2 border-brand-primary rounded-full"
                      initial={{ scale: 1, opacity: 0.8 }}
                      animate={{ scale: 4, opacity: 0 }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Floating Badge */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 1 }}
              className="absolute -bottom-4 -right-4 bg-white p-6 rounded-2xl shadow-2xl border border-stone-100"
            >
              <div className="flex items-center gap-4">
                <div className="text-4xl font-serif italic text-brand-primary">50</div>
                <div className="text-xs font-bold text-stone-500 uppercase tracking-widest leading-tight">
                  States <br /> Covered
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
