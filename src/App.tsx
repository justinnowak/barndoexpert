import React, { useState, useEffect, Component, ErrorInfo, ReactNode } from 'react';
import { ClerkProvider, useAuth, useUser, SignInButton, SignOutButton } from '@clerk/clerk-react';
import Layout from './components/Layout';
import Home from './components/Home';
import Chat from './components/Chat';
import BuilderDirectory from './components/BuilderDirectory';
import BuilderSignup from './components/BuilderSignup';
import FAQ from './components/FAQ';
import BuilderProfile from './components/BuilderProfile';
import BuilderDashboard from './components/BuilderDashboard';
import AdminPanel from './components/AdminPanel';
import CostCalculator from './components/CostCalculator';
import { AlertCircle, RefreshCw } from 'lucide-react';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: any }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) { return { hasError: true, error }; }
  componentDidCatch(error: any, errorInfo: ErrorInfo) { console.error('Uncaught error:', error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center space-y-6 border border-stone-100">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle size={32} />
            </div>
            <h2 className="text-2xl font-serif italic text-stone-900">Something went wrong</h2>
            <p className="text-stone-600 text-sm">{this.state.error?.message || 'An unexpected error occurred.'}</p>
            <button onClick={() => window.location.reload()} className="w-full py-3 bg-stone-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-stone-800 transition-colors">
              <RefreshCw size={18} /> Reload Application
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function AppInner() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<'home' | 'chat' | 'directory' | 'signup' | 'faq' | 'dashboard' | 'admin' | 'calculator'>('home');
  const [selectedBuilder, setSelectedBuilder] = useState<any>(null);
  const [isBuilder, setIsBuilder] = useState(false);

  const isAdmin = user?.primaryEmailAddress?.emailAddress === (import.meta.env.VITE_ADMIN_EMAIL || 'justin@completebarndo.com');

  useEffect(() => { setSelectedBuilder(null); }, [activeTab]);

  useEffect(() => {
    if (!isSignedIn) { setIsBuilder(false); return; }
    const check = async () => {
      try {
        const token = await getToken();
        const res = await fetch('/api/builders/me', { headers: { Authorization: `Bearer ${token}` } });
        setIsBuilder(res.ok);
      } catch { setIsBuilder(false); }
    };
    check();
  }, [isSignedIn, getToken]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#f5f5f0] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-stone-500 font-medium animate-pulse">Loading BarndoExpert...</p>
        </div>
      </div>
    );
  }

  const userObj = isSignedIn ? {
    uid: user?.id,
    email: user?.primaryEmailAddress?.emailAddress,
    displayName: user?.fullName,
  } : null;

  return (
    <Layout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      user={userObj}
      onSignIn={() => {}}
      onSignOut={() => {}}
      isBuilder={isBuilder}
      isAdmin={isAdmin}
      clerkSignIn={!isSignedIn}
    >
      {activeTab === 'home' && <Home onStartChat={() => setActiveTab('chat')} onFindBuilder={() => setActiveTab('directory')} />}
      {activeTab === 'chat' && (
        <div className="max-w-3xl mx-auto">
          <div className="mb-8 text-center">
            <h2 className="text-4xl font-serif italic text-stone-900 mb-2">AI Construction Expert</h2>
            <p className="text-stone-600">Ask about framing, insulation, financing, or anything barndo-related.</p>
          </div>
          <Chat />
        </div>
      )}
      {activeTab === 'directory' && (
        selectedBuilder
          ? <BuilderProfile builder={selectedBuilder} onBack={() => setSelectedBuilder(null)} />
          : <BuilderDirectory user={userObj} onSignup={() => setActiveTab('signup')} onSelectBuilder={setSelectedBuilder} />
      )}
      {activeTab === 'signup' && <BuilderSignup />}
      {activeTab === 'calculator' && <CostCalculator onStartChat={() => setActiveTab('chat')} onFindBuilder={() => setActiveTab('directory')} />}
      {activeTab === 'dashboard' && isSignedIn && <BuilderDashboard user={userObj} />}
      {activeTab === 'admin' && isSignedIn && isAdmin && <AdminPanel user={userObj} />}
      {activeTab === 'faq' && <FAQ onStartChat={() => setActiveTab('chat')} onFindBuilder={() => setActiveTab('directory')} />}
    </Layout>
  );
}

export default function App() {
  if (!PUBLISHABLE_KEY) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <p className="text-stone-600">Missing VITE_CLERK_PUBLISHABLE_KEY environment variable.</p>
      </div>
    );
  }
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <ErrorBoundary>
        <AppInner />
      </ErrorBoundary>
    </ClerkProvider>
  );
}
