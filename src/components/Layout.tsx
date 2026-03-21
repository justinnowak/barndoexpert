import React from 'react';
import { Home, MessageSquare, Search, Menu, X, LogIn, ShieldCheck, LogOut, User as UserIcon, LayoutDashboard, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type TabId = 'home' | 'chat' | 'directory' | 'signup' | 'faq' | 'dashboard' | 'admin';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  user?: any;
  onSignIn: () => void;
  onSignOut: () => void;
  isBuilder?: boolean;
  isAdmin?: boolean;
}

export default function Layout({ children, activeTab, setActiveTab, user, onSignIn, onSignOut, isBuilder, isAdmin }: LayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const baseNavItems = [
    { id: 'home' as TabId, label: 'Home', icon: Home },
    { id: 'chat' as TabId, label: 'AI Expert', icon: MessageSquare },
    { id: 'directory' as TabId, label: 'Find a Builder', icon: Search },
    { id: 'signup' as TabId, label: 'Builder Signup', icon: ShieldCheck },
  ];

  // Dynamically add Dashboard / Admin nav items
  const navItems = [
    ...baseNavItems,
    ...(isBuilder ? [{ id: 'dashboard' as TabId, label: 'Dashboard', icon: LayoutDashboard }] : []),
    ...(isAdmin ? [{ id: 'admin' as TabId, label: 'Admin', icon: Settings }] : []),
  ];

  return (
    <div className="min-h-screen bg-[#f5f5f0] font-sans text-stone-900 selection:bg-emerald-100 selection:text-emerald-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('home')}>
              <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-primary/10">
                <Home size={24} />
              </div>
              <span className="text-2xl font-serif italic font-bold tracking-tight text-stone-900">BarndoExpert</span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`flex items-center gap-2 text-sm font-medium transition-all ${
                    activeTab === item.id 
                      ? "text-brand-primary underline underline-offset-8" 
                      : "text-stone-500 hover:text-stone-900"
                  }`}
                >
                  <item.icon size={18} />
                  {item.label}
                </button>
              ))}
              {user ? (
                <div className="flex items-center gap-4 ml-4">
                  <div className="flex items-center gap-2 px-3 py-1 bg-stone-100 rounded-full border border-stone-200">
                    <UserIcon size={16} className="text-stone-500" />
                    <span className="text-sm font-medium text-stone-700">{user.displayName?.split(' ')[0]}</span>
                  </div>
                  <button 
                    onClick={onSignOut}
                    className="p-2 text-stone-400 hover:text-red-500 transition-colors"
                    title="Sign Out"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              ) : (
                <button 
                  onClick={onSignIn}
                  className="ml-4 px-6 py-2 bg-stone-900 text-white rounded-full text-sm font-bold hover:bg-stone-800 transition-all flex items-center gap-2"
                >
                  <LogIn size={16} />
                  Sign In
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-stone-600">
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-t border-stone-100 overflow-hidden"
            >
              <div className="px-4 py-6 space-y-4">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id as any);
                      setIsMenuOpen(false);
                    }}
                    className={`flex items-center gap-3 w-full p-3 rounded-xl transition-all ${
                      activeTab === item.id 
                        ? "bg-brand-primary/5 text-brand-primary" 
                        : "text-stone-500 hover:bg-stone-50"
                    }`}
                  >
                    <item.icon size={20} />
                    {item.label}
                  </button>
                ))}
                {user ? (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl">
                      <div className="w-10 h-10 bg-brand-primary/10 text-brand-primary rounded-full flex items-center justify-center">
                        <UserIcon size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-stone-900">{user.displayName}</p>
                        <p className="text-xs text-stone-500">{user.email}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        onSignOut();
                        setIsMenuOpen(false);
                      }}
                      className="w-full p-4 bg-stone-100 text-stone-600 rounded-xl font-bold flex items-center justify-center gap-2"
                    >
                      <LogOut size={18} />
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => {
                      onSignIn();
                      setIsMenuOpen(false);
                    }}
                    className="w-full p-4 bg-stone-900 text-white rounded-xl font-bold flex items-center justify-center gap-2"
                  >
                    <LogIn size={18} />
                    Sign In
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {children}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400 py-16 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-2 space-y-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-brand-primary rounded-lg flex items-center justify-center text-white">
                  <Home size={20} />
                </div>
                <span className="text-xl font-serif italic font-bold text-white">BarndoExpert</span>
              </div>
              <p className="max-w-sm text-sm leading-relaxed">
                The ultimate resource for barndominium enthusiasts. From initial design to final build, we connect you with the knowledge and professionals you need.
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6">Quick Links</h4>
              <ul className="space-y-4 text-sm">
                <li><button onClick={() => setActiveTab('chat')} className="hover:text-white transition-colors">AI Expert Chat</button></li>
                <li><button onClick={() => setActiveTab('directory')} className="hover:text-white transition-colors">Find a Builder</button></li>
                <li><button onClick={() => setActiveTab('faq')} className="hover:text-white transition-colors">FAQ</button></li>
                <li><a href="#" className="hover:text-white transition-colors">Financing Guide</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Builder Signup</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6">Contact</h4>
              <ul className="space-y-4 text-sm">
                <li>support@barndoexpert.com</li>
                <li>1-800-BARNDO-EXPERT</li>
                <li>Austin, Texas</li>
              </ul>
            </div>
          </div>
          <div className="mt-16 pt-8 border-t border-stone-800 text-xs flex flex-col md:flex-row justify-between gap-4">
            <p>© 2026 BarndoExpert. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
