import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Calculator, Home, Warehouse, Fence, Wrench, DollarSign, MapPin, ArrowRight } from 'lucide-react';

// State pricing data from the Barndominium Turnkey Pricing Report
const STATE_PRICING: Record<string, { living: [number, number]; shop: [number, number]; porch: [number, number]; tier: string }> = {
  'Alabama':          { living: [130, 150], shop: [38, 56], porch: [28, 42], tier: 'Low–Mid' },
  'Arizona':          { living: [175, 195], shop: [44, 62], porch: [30, 50], tier: 'Mid' },
  'Arkansas':         { living: [140, 160], shop: [38, 58], porch: [25, 42], tier: 'Low' },
  'California':       { living: [260, 280], shop: [65, 95], porch: [50, 75], tier: 'High' },
  'Colorado':         { living: [210, 230], shop: [52, 75], porch: [40, 60], tier: 'High' },
  'Connecticut':      { living: [270, 290], shop: [65, 95], porch: [48, 75], tier: 'High' },
  'Florida':          { living: [200, 220], shop: [45, 65], porch: [35, 55], tier: 'Mid' },
  'Georgia':          { living: [170, 190], shop: [42, 60], porch: [30, 48], tier: 'Mid' },
  'Idaho':            { living: [180, 200], shop: [44, 65], porch: [32, 50], tier: 'Mid' },
  'Illinois':         { living: [180, 200], shop: [42, 60], porch: [30, 45], tier: 'Mid' },
  'Indiana':          { living: [180, 200], shop: [40, 60], porch: [30, 45], tier: 'Mid' },
  'Iowa':             { living: [150, 170], shop: [38, 58], porch: [27, 42], tier: 'Low–Mid' },
  'Kansas':           { living: [150, 170], shop: [38, 58], porch: [27, 42], tier: 'Low–Mid' },
  'Kentucky':         { living: [180, 200], shop: [40, 55], porch: [35, 45], tier: 'Mid' },
  'Louisiana':        { living: [145, 165], shop: [40, 60], porch: [28, 45], tier: 'Low–Mid' },
  'Maine':            { living: [270, 290], shop: [65, 95], porch: [48, 75], tier: 'High' },
  'Massachusetts':    { living: [270, 290], shop: [65, 95], porch: [48, 75], tier: 'High' },
  'Michigan':         { living: [175, 195], shop: [42, 62], porch: [30, 48], tier: 'Mid' },
  'Minnesota':        { living: [175, 195], shop: [42, 62], porch: [30, 48], tier: 'Mid' },
  'Mississippi':      { living: [130, 150], shop: [35, 55], porch: [22, 40], tier: 'Low' },
  'Missouri':         { living: [155, 175], shop: [40, 58], porch: [28, 42], tier: 'Low–Mid' },
  'Montana':          { living: [180, 200], shop: [44, 65], porch: [32, 50], tier: 'Mid' },
  'Nebraska':         { living: [150, 170], shop: [38, 58], porch: [27, 42], tier: 'Low–Mid' },
  'New Hampshire':    { living: [270, 290], shop: [65, 95], porch: [48, 75], tier: 'High' },
  'New Mexico':       { living: [175, 195], shop: [44, 62], porch: [30, 50], tier: 'Mid' },
  'New York':         { living: [260, 280], shop: [65, 95], porch: [48, 72], tier: 'High' },
  'North Carolina':   { living: [165, 185], shop: [42, 60], porch: [32, 48], tier: 'Mid' },
  'Ohio':             { living: [180, 200], shop: [40, 60], porch: [30, 45], tier: 'Mid' },
  'Oklahoma':         { living: [150, 170], shop: [40, 60], porch: [25, 45], tier: 'Low' },
  'Oregon':           { living: [230, 250], shop: [55, 80], porch: [42, 65], tier: 'High' },
  'Pennsylvania':     { living: [190, 210], shop: [48, 68], porch: [35, 52], tier: 'Mid' },
  'South Carolina':   { living: [160, 180], shop: [40, 58], porch: [30, 46], tier: 'Mid' },
  'Tennessee':        { living: [180, 200], shop: [40, 55], porch: [35, 45], tier: 'Low–Mid' },
  'Texas':            { living: [160, 180], shop: [45, 65], porch: [35, 50], tier: 'Low–Mid' },
  'Vermont':          { living: [270, 290], shop: [65, 95], porch: [48, 75], tier: 'High' },
  'Virginia':         { living: [175, 195], shop: [44, 62], porch: [32, 48], tier: 'Mid' },
  'Washington':       { living: [230, 250], shop: [55, 80], porch: [42, 65], tier: 'High' },
  'Wisconsin':        { living: [175, 195], shop: [42, 62], porch: [30, 48], tier: 'Mid' },
  'Wyoming':          { living: [180, 200], shop: [44, 65], porch: [32, 50], tier: 'Mid' },
};

type BuildType = 'full_finish' | 'shell_only' | 'shell_foundation';

interface CostCalculatorProps {
  onStartChat: () => void;
  onFindBuilder: () => void;
}

export default function CostCalculator({ onStartChat, onFindBuilder }: CostCalculatorProps) {
  const [buildType, setBuildType] = useState<BuildType>('full_finish');
  const [state, setState] = useState('Texas');
  const [livingSqft, setLivingSqft] = useState('');
  const [shopSqft, setShopSqft] = useState('');
  const [porchSqft, setPorchSqft] = useState('');
  const [includeSeptic, setIncludeSeptic] = useState(false);
  const [includeWell, setIncludeWell] = useState(false);
  const [includeLandClearing, setIncludeLandClearing] = useState(false);

  const pricing = STATE_PRICING[state];

  const costs = useMemo(() => {
    const living = parseInt(livingSqft) || 0;
    const shop = parseInt(shopSqft) || 0;
    const porch = parseInt(porchSqft) || 0;

    let livingMin = 0, livingMax = 0;
    let shopMin = 0, shopMax = 0;
    let porchMin = 0, porchMax = 0;

    if (buildType === 'full_finish') {
      livingMin = living * pricing.living[0];
      livingMax = living * pricing.living[1];
      shopMin = shop * pricing.shop[0];
      shopMax = shop * pricing.shop[1];
      porchMin = porch * pricing.porch[0];
      porchMax = porch * pricing.porch[1];
    } else if (buildType === 'shell_only') {
      // Shell only: $30-$55/sf nationally
      livingMin = living * 30;
      livingMax = living * 55;
      shopMin = shop * 30;
      shopMax = shop * 55;
      porchMin = porch * pricing.porch[0];
      porchMax = porch * pricing.porch[1];
    } else {
      // Shell + Foundation + Erection: ~$70/sf
      livingMin = living * 65;
      livingMax = living * 75;
      shopMin = shop * 60;
      shopMax = shop * 70;
      porchMin = porch * pricing.porch[0];
      porchMax = porch * pricing.porch[1];
    }

    let addOnsMin = 0, addOnsMax = 0;
    if (includeSeptic) { addOnsMin += 5000; addOnsMax += 15000; }
    if (includeWell) { addOnsMin += 8000; addOnsMax += 15000; }
    if (includeLandClearing) { addOnsMin += 1200; addOnsMax += 8000; }

    const totalMin = livingMin + shopMin + porchMin + addOnsMin;
    const totalMax = livingMax + shopMax + porchMax + addOnsMax;

    return {
      living: { min: livingMin, max: livingMax },
      shop: { min: shopMin, max: shopMax },
      porch: { min: porchMin, max: porchMax },
      addOns: { min: addOnsMin, max: addOnsMax },
      total: { min: totalMin, max: totalMax },
    };
  }, [buildType, state, livingSqft, shopSqft, porchSqft, includeSeptic, includeWell, includeLandClearing, pricing]);

  const fmt = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

  const buildTypes = [
    { id: 'full_finish' as BuildType, label: 'Full Finish', desc: 'Complete interior & exterior', price: null },
    { id: 'shell_only' as BuildType, label: 'Shell Only', desc: 'Structure, roof, siding only', price: '$30–$55/sf' },
    { id: 'shell_foundation' as BuildType, label: 'Shell + Foundation + Erection', desc: 'Shell with concrete & assembly', price: '$65–$75/sf' },
  ];

  const stateNames = Object.keys(STATE_PRICING).sort();

  return (
    <div className="max-w-3xl mx-auto space-y-12">
      {/* Header */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-accent text-white rounded-full text-sm font-bold"
        >
          <Calculator size={16} />
          Instant Estimate
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-6xl font-serif italic text-stone-900"
        >
          Barndominium <br />
          <span className="text-brand-primary">Cost Calculator</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg text-stone-600 max-w-xl mx-auto"
        >
          Get an instant turnkey cost estimate based on real builder pricing data from across the United States.
        </motion.p>
      </div>

      {/* Build Type */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-3xl border border-stone-200 p-8 shadow-sm space-y-6"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-primary/10 text-brand-primary rounded-xl flex items-center justify-center">
            <Warehouse size={20} />
          </div>
          <h2 className="text-xl font-bold text-stone-900">Build Type</h2>
        </div>

        <div className="space-y-3">
          {buildTypes.map((bt) => (
            <button
              key={bt.id}
              onClick={() => setBuildType(bt.id)}
              className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                buildType === bt.id
                  ? 'border-brand-primary bg-brand-primary/5 ring-2 ring-brand-primary/20'
                  : 'border-stone-200 hover:border-stone-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  buildType === bt.id ? 'border-brand-primary' : 'border-stone-300'
                }`}>
                  {buildType === bt.id && <div className="w-2.5 h-2.5 bg-brand-primary rounded-full" />}
                </div>
                <div className="text-left">
                  <span className="font-bold text-stone-900">{bt.label}</span>
                  <span className="text-stone-500 text-sm ml-2">{bt.desc}</span>
                </div>
              </div>
              {bt.price && (
                <span className="text-brand-accent font-bold text-sm">{bt.price}</span>
              )}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Living Space */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-3xl border border-stone-200 p-8 shadow-sm space-y-6"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center">
            <Home size={20} />
          </div>
          <h2 className="text-xl font-bold text-stone-900">Living Space</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-stone-700 uppercase tracking-wider">Square Footage</label>
            <input
              type="number"
              value={livingSqft}
              onChange={(e) => setLivingSqft(e.target.value)}
              placeholder="e.g., 2000"
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin size={14} /> State (Cost per Sq Ft)
            </label>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none appearance-none"
            >
              {stateNames.map((s) => (
                <option key={s} value={s}>
                  {s} (${STATE_PRICING[s].living[0]}–${STATE_PRICING[s].living[1]})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl border border-stone-100">
          <span className="text-stone-600 font-medium">Living Space Cost Range:</span>
          <span className="font-bold text-brand-primary text-lg">
            {costs.living.min > 0 ? `${fmt(costs.living.min)} – ${fmt(costs.living.max)}` : '$0'}
          </span>
        </div>
      </motion.div>

      {/* Shop / Garage Space */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-3xl border border-stone-200 p-8 shadow-sm space-y-6"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
            <Warehouse size={20} />
          </div>
          <h2 className="text-xl font-bold text-stone-900">Shop / Garage Space</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-stone-700 uppercase tracking-wider">Square Footage</label>
            <input
              type="number"
              value={shopSqft}
              onChange={(e) => setShopSqft(e.target.value)}
              placeholder="e.g., 800"
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-stone-700 uppercase tracking-wider">Cost Range per Sq Ft</label>
            <div className="px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-700 font-medium">
              ${pricing.shop[0]}–${pricing.shop[1]}/sf
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl border border-stone-100">
          <span className="text-stone-600 font-medium">Shop / Garage Cost:</span>
          <span className="font-bold text-purple-600 text-lg">
            {costs.shop.min > 0 ? `${fmt(costs.shop.min)} – ${fmt(costs.shop.max)}` : '$0'}
          </span>
        </div>
      </motion.div>

      {/* Covered Porch */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-3xl border border-stone-200 p-8 shadow-sm space-y-6"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
            <Fence size={20} />
          </div>
          <h2 className="text-xl font-bold text-stone-900">Covered Porch</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-stone-700 uppercase tracking-wider">Square Footage</label>
            <input
              type="number"
              value={porchSqft}
              onChange={(e) => setPorchSqft(e.target.value)}
              placeholder="e.g., 400"
              className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-stone-700 uppercase tracking-wider">Cost Range per Sq Ft</label>
            <div className="px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-700 font-medium">
              ${pricing.porch[0]}–${pricing.porch[1]}/sf
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl border border-stone-100">
          <span className="text-stone-600 font-medium">Covered Porch Cost:</span>
          <span className="font-bold text-emerald-600 text-lg">
            {costs.porch.min > 0 ? `${fmt(costs.porch.min)} – ${fmt(costs.porch.max)}` : '$0'}
          </span>
        </div>
      </motion.div>

      {/* Additional Services */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white rounded-3xl border border-stone-200 p-8 shadow-sm space-y-6"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-accent/10 text-brand-accent rounded-xl flex items-center justify-center">
            <Wrench size={20} />
          </div>
          <h2 className="text-xl font-bold text-stone-900">Additional Services</h2>
        </div>

        <div className="space-y-3">
          <label className="flex items-center justify-between p-4 rounded-2xl border border-stone-200 hover:border-stone-300 cursor-pointer transition-all">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={includeSeptic}
                onChange={(e) => setIncludeSeptic(e.target.checked)}
                className="w-5 h-5 rounded border-stone-300 text-brand-primary focus:ring-brand-primary/20"
              />
              <span className="font-medium text-stone-900">Include Septic Installation?</span>
            </div>
            <span className="text-brand-accent font-bold">$5,000 – $15,000</span>
          </label>

          <label className="flex items-center justify-between p-4 rounded-2xl border border-stone-200 hover:border-stone-300 cursor-pointer transition-all">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={includeWell}
                onChange={(e) => setIncludeWell(e.target.checked)}
                className="w-5 h-5 rounded border-stone-300 text-brand-primary focus:ring-brand-primary/20"
              />
              <span className="font-medium text-stone-900">Include Well Drilling?</span>
            </div>
            <span className="text-brand-accent font-bold">$8,000 – $15,000</span>
          </label>

          <label className="flex items-center justify-between p-4 rounded-2xl border border-stone-200 hover:border-stone-300 cursor-pointer transition-all">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={includeLandClearing}
                onChange={(e) => setIncludeLandClearing(e.target.checked)}
                className="w-5 h-5 rounded border-stone-300 text-brand-primary focus:ring-brand-primary/20"
              />
              <span className="font-medium text-stone-900">Include Land Clearing?</span>
            </div>
            <span className="text-brand-accent font-bold">$1,200 – $8,000</span>
          </label>
        </div>
      </motion.div>

      {/* Total Estimate */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="bg-brand-primary rounded-3xl p-10 text-center space-y-4 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-brand-accent rounded-full blur-3xl" />
        </div>

        <div className="relative z-10">
          <div className="flex items-center justify-center gap-2 mb-2">
            <DollarSign size={20} className="text-white/70" />
            <span className="text-white/80 font-bold uppercase tracking-wider text-sm">Estimated Total Cost Range</span>
          </div>

          <div className="text-4xl md:text-5xl font-bold text-white">
            {costs.total.min > 0
              ? `${fmt(costs.total.min)} – ${fmt(costs.total.max)}`
              : '$0'
            }
          </div>

          <p className="text-white/60 text-sm mt-3">
            *This is an estimate based on {state} builder pricing data, not a formal quote.
            <br />Excludes land purchase, utility extensions, and driveway.
          </p>

          {/* Cost Breakdown */}
          {costs.total.min > 0 && (
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white/10 rounded-xl p-3">
                <div className="text-white/60 text-xs font-bold uppercase tracking-wider">Living</div>
                <div className="text-white font-bold text-sm mt-1">{fmt(costs.living.min)}–{fmt(costs.living.max)}</div>
              </div>
              <div className="bg-white/10 rounded-xl p-3">
                <div className="text-white/60 text-xs font-bold uppercase tracking-wider">Shop</div>
                <div className="text-white font-bold text-sm mt-1">{fmt(costs.shop.min)}–{fmt(costs.shop.max)}</div>
              </div>
              <div className="bg-white/10 rounded-xl p-3">
                <div className="text-white/60 text-xs font-bold uppercase tracking-wider">Porch</div>
                <div className="text-white font-bold text-sm mt-1">{fmt(costs.porch.min)}–{fmt(costs.porch.max)}</div>
              </div>
              <div className="bg-white/10 rounded-xl p-3">
                <div className="text-white/60 text-xs font-bold uppercase tracking-wider">Add-ons</div>
                <div className="text-white font-bold text-sm mt-1">{fmt(costs.addOns.min)}–{fmt(costs.addOns.max)}</div>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* CTA Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button
          onClick={onStartChat}
          className="p-6 bg-white rounded-2xl border border-stone-200 hover:shadow-md transition-all group text-left space-y-3"
        >
          <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
            Have questions about your estimate?
            <ArrowRight size={18} className="text-brand-primary group-hover:translate-x-1 transition-transform" />
          </h3>
          <p className="text-stone-500 text-sm">Chat with our AI expert about costs, financing, and build process.</p>
        </button>
        <button
          onClick={onFindBuilder}
          className="p-6 bg-white rounded-2xl border border-stone-200 hover:shadow-md transition-all group text-left space-y-3"
        >
          <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
            Ready to find a builder?
            <ArrowRight size={18} className="text-brand-primary group-hover:translate-x-1 transition-transform" />
          </h3>
          <p className="text-stone-500 text-sm">Browse verified barndominium builders in {state} and nationwide.</p>
        </button>
      </div>

      {/* Disclaimer */}
      <p className="text-center text-stone-400 text-xs leading-relaxed max-w-2xl mx-auto">
        All estimates are approximate and subject to change based on materials, location, finish selections, contractor availability, and market conditions. Pricing data sourced from active builders and industry cost guides across all US regions. Always obtain multiple contractor bids before committing to a budget.
      </p>
    </div>
  );
}
