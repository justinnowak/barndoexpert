import React, { useState } from 'react';
import { Check, ShieldCheck, Zap, CreditCard, ArrowRight, Loader2, AlertCircle, Search, TrendingUp, Users, MousePointer2, Mail, PhoneCall, LayoutDashboard, BarChart3, Eye } from 'lucide-react';
import { motion } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth, SignInButton } from '@clerk/clerk-react';

export default function BuilderSignup() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    businessName: '',
    email: '',
    location: '',
    address: '',
    phone: '',
    website: '',
    description: '',
    specialties: ''
  });

  const { isSignedIn, getToken } = useAuth();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) {
      setError('Please select a plan first.');
      return;
    }

    // Basic validation
    if (!formData.businessName || !formData.email || !formData.location || !formData.phone) {
      setError('Business name, email, location, and phone are required.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (formData.website && !formData.website.startsWith('http')) {
      setError('Website must start with http:// or https://');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      if (!isSignedIn) {
        setError('Please sign in to continue. Click the Sign In button in the top navigation.');
        setIsLoading(false);
        return;
      }
      const token = await getToken();
      const res = await fetch('/api/builders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: formData.businessName,
          email: formData.email,
          location: formData.location,
          address: formData.address || undefined,
          phone: formData.phone,
          website: formData.website || undefined,
          description: formData.description || undefined,
          specialties: formData.specialties.split(',').map(s => s.trim()).filter(Boolean),
          plan: selectedPlan === 'Starter' ? 'Basic' : (selectedPlan || 'Basic'),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Signup failed');
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to sign up. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const plans = [
    {
      name: 'Starter',
      price: 'Free',
      priceNote: 'During beta',
      features: ['Directory Listing', 'Contact Form', '5 Photos', 'Basic Support'],
      icon: Zap,
      color: 'bg-stone-100 text-stone-600'
    },
    {
      name: 'Professional',
      price: 'Free',
      priceNote: 'During beta',
      features: ['Priority Listing', 'Verified Badge', '50 Photos', 'Analytics Dashboard', 'Direct Leads'],
      icon: ShieldCheck,
      color: 'bg-brand-accent/10 text-brand-accent',
      popular: true
    }
  ];

  const visitorData = [
    { month: 'Oct', visitors: 12500 },
    { month: 'Nov', visitors: 18200 },
    { month: 'Dec', visitors: 24600 },
    { month: 'Jan', visitors: 32100 },
    { month: 'Feb', visitors: 41800 },
    { month: 'Mar', visitors: 52400 },
  ];

  if (success) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center space-y-6">
        <div className="w-20 h-20 bg-brand-accent/10 text-brand-accent rounded-full flex items-center justify-center mx-auto">
          <Check size={40} />
        </div>
        <h2 className="text-4xl font-serif italic text-stone-900">Welcome Aboard!</h2>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-brand-accent/5 border border-brand-accent/10 py-4 px-8 rounded-2xl inline-block mx-auto"
        >
          <p className="text-brand-accent font-bold text-xl">
            Welcome aboard with the {selectedPlan} plan!
          </p>
        </motion.div>
        <p className="text-stone-600">Your builder profile has been created. Our team will review your application and activate your listing shortly.</p>
        <p className="text-stone-500 text-sm">You'll be able to access your dashboard once your listing is approved.</p>
        <button
          onClick={() => window.location.reload()}
          className="px-8 py-3 bg-brand-primary text-white rounded-full font-bold hover:bg-brand-primary/90 transition-colors"
        >
          Back to Directory
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12">
      {error && (
        <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl flex items-center gap-3">
          <AlertCircle size={20} />
          {error}
        </div>
      )}
      <div className="text-center mb-16 space-y-4">
        <h2 className="text-5xl font-serif italic text-stone-900">Grow Your Business</h2>
        <p className="text-xl text-stone-600 max-w-2xl mx-auto">
          Join the only listing service dedicated exclusively to barndominium builders. Get your business in front of homeowners who use us as their primary resource for finding specialized builders.
        </p>
      </div>

      {/* Visitor Growth Section */}
      <div className="mb-20 bg-stone-50 rounded-[3rem] p-12 border border-stone-200 overflow-hidden relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-accent/10 text-brand-accent rounded-full text-sm font-bold uppercase tracking-wider">
              <TrendingUp size={16} />
              Rapid Growth
            </div>
            <h3 className="text-4xl font-serif italic text-stone-900 leading-tight">
              Tens of thousands of visitors are looking for builders just like you.
            </h3>
            <p className="text-lg text-stone-600 leading-relaxed">
              Our platform has become the go-to resource for barndominium enthusiasts across the United States. We connect you with high-intent homeowners actively seeking specialized builders in their region.
            </p>
            <div className="flex items-center gap-8 pt-4">
              <div>
                <div className="text-3xl font-bold text-stone-900">52k+</div>
                <div className="text-sm text-stone-500 uppercase tracking-widest font-medium">Monthly Visitors</div>
              </div>
              <div className="w-px h-12 bg-stone-200" />
              <div>
                <div className="text-3xl font-bold text-stone-900">50 States</div>
                <div className="text-sm text-stone-500 uppercase tracking-widest font-medium">National Coverage</div>
              </div>
            </div>
          </div>

          <div className="h-[300px] w-full bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-bold text-stone-400 uppercase tracking-widest">Monthly Traffic Growth</span>
              <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded">+319% YoY</span>
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={visitorData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F27D26" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#F27D26" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#a8a29e', fontSize: 12 }}
                  dy={10}
                  padding={{ left: 20, right: 20 }}
                  scale="point"
                />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="visitors"
                  stroke="#F27D26"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorVisitors)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {plans.map((plan) => (
          <motion.div
            key={plan.name}
            whileHover={{ y: -10 }}
            className={`relative p-8 rounded-[2.5rem] border ${
              plan.popular ? 'border-brand-accent/20 bg-white shadow-xl' : 'border-stone-200 bg-stone-50'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-accent text-white px-4 py-1 rounded-full text-sm font-bold">
                Most Popular
              </div>
            )}

            <div className="flex items-center gap-4 mb-8">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${plan.color}`}>
                <plan.icon size={24} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-stone-900">{plan.name}</h3>
                <p className="text-stone-500 text-sm">Per month, billed annually</p>
              </div>
            </div>

            <div className="mb-8">
              <span className="text-5xl font-bold text-stone-900">{plan.price}</span>
              <span className="text-stone-400 text-sm ml-2">{plan.priceNote}</span>
            </div>

            <ul className="space-y-4 mb-10">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-stone-700">
                  <div className="w-5 h-5 bg-brand-accent/10 text-brand-accent rounded-full flex items-center justify-center shrink-0">
                    <Check size={12} />
                  </div>
                  {feature}
                </li>
              ))}
            </ul>

            <button
              onClick={() => setSelectedPlan(plan.name)}
              className={`w-full py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 ${
              selectedPlan === plan.name
                ? 'bg-brand-accent text-white shadow-lg shadow-brand-accent/20'
                : plan.popular
                  ? 'bg-brand-accent text-white hover:bg-brand-accent/90 shadow-lg shadow-brand-accent/20'
                  : 'bg-brand-primary text-white hover:bg-brand-primary/90'
            }`}>
              {selectedPlan === plan.name ? 'Plan Selected' : 'Select Plan'}
              {selectedPlan === plan.name ? <Check size={20} /> : <ArrowRight size={20} />}
            </button>
          </motion.div>
        ))}
      </div>

      {selectedPlan && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-16 bg-white rounded-[3rem] p-8 md:p-12 border border-stone-200 shadow-xl"
        >
          <div className="mb-10">
            <h3 className="text-3xl font-serif italic text-stone-900">Complete Your Listing</h3>
            <p className="text-stone-600">Tell us more about your business to get started with the {selectedPlan} plan.</p>
          </div>

          <form onSubmit={handleSignup} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-stone-700 uppercase tracking-wider">Business Name *</label>
              <input
                required
                name="businessName"
                value={formData.businessName}
                onChange={handleInputChange}
                placeholder="e.g. Lone Star Barndos"
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-stone-700 uppercase tracking-wider">Contact Email *</label>
              <input
                required
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="contact@business.com"
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-stone-700 uppercase tracking-wider">Service Area (City, State) *</label>
              <input
                required
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="e.g. Austin, TX"
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-stone-700 uppercase tracking-wider">Physical Address</label>
              <input
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="123 Builder Lane"
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-stone-700 uppercase tracking-wider">Phone Number *</label>
              <input
                required
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="(555) 000-0000"
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-stone-700 uppercase tracking-wider">Website URL</label>
              <input
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                placeholder="https://yourwebsite.com"
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-stone-700 uppercase tracking-wider">Specialties (comma separated)</label>
              <input
                name="specialties"
                value={formData.specialties}
                onChange={handleInputChange}
                placeholder="Custom Design, Steel Frame, Turnkey"
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-bold text-stone-700 uppercase tracking-wider">Business Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                placeholder="Tell homeowners what makes your barndominiums special..."
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none resize-none"
              />
            </div>

            <div className="md:col-span-2 pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-5 bg-brand-primary text-white rounded-2xl font-bold hover:bg-brand-primary/90 transition-all flex items-center justify-center gap-3 shadow-xl"
              >
                {isLoading ? <Loader2 className="animate-spin" size={24} /> : 'Complete Signup — Free During Beta'}
                {!isLoading && <ArrowRight size={24} />}
              </button>
              <p className="text-center text-stone-400 text-sm mt-4">
                By clicking "Complete Signup", you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
          </form>
        </motion.div>
      )}

      <div className="mt-20 bg-white rounded-[3rem] p-12 border border-stone-100 shadow-sm flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1 space-y-6">
          <h3 className="text-3xl font-serif italic text-stone-900">Why list with us?</h3>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-brand-accent/10 rounded-full flex items-center justify-center text-brand-accent shrink-0">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h4 className="font-bold text-stone-900">The Only Barndominium-Specific Service</h4>
                <p className="text-stone-600 text-sm">We are the only listing service dedicated exclusively to barndominium builders, ensuring you aren't lost in a sea of general contractors.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center text-stone-600 shrink-0">
                <Search size={20} />
              </div>
              <div>
                <h4 className="font-bold text-stone-900">The Go-To Resource</h4>
                <p className="text-stone-600 text-sm">Homeowners looking specifically for barndos and specialized builders come here as their primary resource.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center text-stone-600 shrink-0">
                <CreditCard size={20} />
              </div>
              <div>
                <h4 className="font-bold text-stone-900">High Conversion</h4>
                <p className="text-stone-600 text-sm">Our targeted audience leads to higher quality inquiries and better conversion rates for your business.</p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex-1 relative">
          <div className="aspect-square rounded-3xl overflow-hidden">
            <img
              src="https://texascompletebarndosolutions.com/wp-content/uploads/2025/12/3D-rendered-barndominium-design-for-client-in-central-Texas.webp"
              alt="Successful Builder"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </div>

      {/* Builder Dashboard Mock-up Section */}
      <div className="mt-24 space-y-12">
        <div className="text-center space-y-4">
          <h3 className="text-4xl font-serif italic text-stone-900">Your Personal Growth Dashboard</h3>
          <p className="text-xl text-stone-600 max-w-2xl mx-auto">
            Get real-time insights into how your listing is performing. Track every interaction and watch your business grow.
          </p>
        </div>

        <div className="bg-stone-900 rounded-[3rem] p-4 md:p-8 shadow-2xl border border-stone-800 relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-accent/5 blur-[100px] rounded-full -mr-48 -mt-48" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-primary/5 blur-[100px] rounded-full -ml-48 -mb-48" />

          <div className="relative bg-white rounded-2xl overflow-hidden shadow-inner flex flex-col md:flex-row min-h-[600px]">
            {/* Mock Sidebar */}
            <div className="w-full md:w-64 bg-stone-50 border-r border-stone-100 p-6 space-y-8 hidden md:block">
              <div className="flex items-center gap-3 text-brand-primary">
                <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center text-white">
                  <LayoutDashboard size={18} />
                </div>
                <span className="font-bold tracking-tight">BuilderHub</span>
              </div>

              <nav className="space-y-1">
                <div className="flex items-center gap-3 px-3 py-2 bg-brand-primary/10 text-brand-primary rounded-lg font-bold text-sm">
                  <BarChart3 size={18} />
                  Analytics
                </div>
                <div className="flex items-center gap-3 px-3 py-2 text-stone-400 hover:bg-stone-100 rounded-lg font-medium text-sm transition-colors cursor-not-allowed">
                  <Users size={18} />
                  Leads
                </div>
                <div className="flex items-center gap-3 px-3 py-2 text-stone-400 hover:bg-stone-100 rounded-lg font-medium text-sm transition-colors cursor-not-allowed">
                  <Mail size={18} />
                  Messages
                </div>
                <div className="flex items-center gap-3 px-3 py-2 text-stone-400 hover:bg-stone-100 rounded-lg font-medium text-sm transition-colors cursor-not-allowed">
                  <Zap size={18} />
                  Promotions
                </div>
              </nav>

              <div className="pt-8">
                <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4">Account</div>
                <div className="flex items-center gap-3 p-2 rounded-xl border border-stone-200 bg-white shadow-sm">
                  <div className="w-8 h-8 rounded-full bg-stone-200 overflow-hidden">
                    <img src="https://picsum.photos/seed/builder/100/100" alt="Avatar" className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-stone-900 truncate">Lone Star Barndos</div>
                    <div className="text-[10px] text-emerald-600 font-bold">Pro Member</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mock Main Content */}
            <div className="flex-1 p-6 md:p-10 space-y-8 overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h4 className="text-2xl font-bold text-stone-900">Performance Overview</h4>
                  <p className="text-stone-500 text-sm">Last 30 days of activity</p>
                </div>
                <div className="flex items-center gap-2 bg-stone-100 p-1 rounded-lg">
                  <button className="px-3 py-1.5 text-xs font-bold bg-white shadow-sm rounded-md text-stone-900">30 Days</button>
                  <button className="px-3 py-1.5 text-xs font-bold text-stone-500 hover:text-stone-700">90 Days</button>
                  <button className="px-3 py-1.5 text-xs font-bold text-stone-500 hover:text-stone-700">1 Year</button>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-stone-50 border border-stone-100 space-y-3">
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                    <Eye size={20} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-stone-900">12,482</div>
                    <div className="text-xs font-bold text-stone-400 uppercase tracking-wider">Profile Views</div>
                  </div>
                  <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                    <TrendingUp size={10} /> +12% vs last month
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-stone-50 border border-stone-100 space-y-3">
                  <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                    <MousePointer2 size={20} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-stone-900">842</div>
                    <div className="text-xs font-bold text-stone-400 uppercase tracking-wider">Website Clicks</div>
                  </div>
                  <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                    <TrendingUp size={10} /> +24% vs last month
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-stone-50 border border-stone-100 space-y-3">
                  <div className="w-10 h-10 bg-brand-accent/10 text-brand-accent rounded-xl flex items-center justify-center">
                    <Mail size={20} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-stone-900">156</div>
                    <div className="text-xs font-bold text-stone-400 uppercase tracking-wider">Email Clicks</div>
                  </div>
                  <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                    <TrendingUp size={10} /> +8% vs last month
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-stone-50 border border-stone-100 space-y-3">
                  <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                    <PhoneCall size={20} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-stone-900">94</div>
                    <div className="text-xs font-bold text-stone-400 uppercase tracking-wider">Phone Calls</div>
                  </div>
                  <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                    <TrendingUp size={10} /> +15% vs last month
                  </div>
                </div>
              </div>

              {/* Recent Leads Table Mock */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h5 className="font-bold text-stone-900">Recent Inquiries</h5>
                  <button className="text-xs font-bold text-brand-primary hover:underline">View All Leads</button>
                </div>
                <div className="border border-stone-100 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-stone-50 border-bottom border-stone-100">
                      <tr>
                        <th className="px-6 py-4 font-bold text-stone-400 uppercase tracking-widest text-[10px]">Homeowner</th>
                        <th className="px-6 py-4 font-bold text-stone-400 uppercase tracking-widest text-[10px]">Location</th>
                        <th className="px-6 py-4 font-bold text-stone-400 uppercase tracking-widest text-[10px]">Type</th>
                        <th className="px-6 py-4 font-bold text-stone-400 uppercase tracking-widest text-[10px]">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-50">
                      <tr>
                        <td className="px-6 py-4">
                          <div className="font-bold text-stone-900">Michael R.</div>
                          <div className="text-xs text-stone-400">m.roberts@email.com</div>
                        </td>
                        <td className="px-6 py-4 text-stone-600">Austin, TX</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-[10px] font-bold uppercase">Website Click</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs">
                            <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full" />
                            New
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4">
                          <div className="font-bold text-stone-900">Sarah J.</div>
                          <div className="text-xs text-stone-400">sarah.j@email.com</div>
                        </td>
                        <td className="px-6 py-4 text-stone-600">Dallas, TX</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 bg-purple-50 text-purple-600 rounded text-[10px] font-bold uppercase">Phone Call</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="flex items-center gap-1.5 text-stone-400 font-bold text-xs">
                            <div className="w-1.5 h-1.5 bg-stone-400 rounded-full" />
                            Contacted
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
