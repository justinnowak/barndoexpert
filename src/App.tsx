import React, { useState, useEffect, Component, ErrorInfo, ReactNode } from 'react';
import Layout from './components/Layout';
import Home from './components/Home';
import Chat from './components/Chat';
import BuilderDirectory from './components/BuilderDirectory';
import BuilderSignup from './components/BuilderSignup';
import FAQ from './components/FAQ';
import BuilderProfile from './components/BuilderProfile';
import BuilderDashboard from './components/BuilderDashboard';
import AdminPanel from './components/AdminPanel';
import { auth, db, onAuthStateChanged, doc, getDoc, setDoc, serverTimestamp, OperationType, handleFirestoreError, signInWithPopup, googleProvider, collection, query, where, getDocs } from './firebase';
import { AlertCircle, RefreshCw } from 'lucide-react';

// Error Boundary Component
class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; error: any }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      let errorMessage = "An unexpected error occurred.";
      try {
        const parsed = JSON.parse(this.state.error.message);
        if (parsed.error) errorMessage = parsed.error;
      } catch (e) {
        errorMessage = this.state.error.message || errorMessage;
      }

      return (
        <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center space-y-6 border border-stone-100">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle size={32} />
            </div>
            <h2 className="text-2xl font-serif italic text-stone-900">Something went wrong</h2>
            <p className="text-stone-600 text-sm">{errorMessage}</p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-3 bg-stone-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-stone-800 transition-colors"
            >
              <RefreshCw size={18} />
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'chat' | 'directory' | 'signup' | 'faq' | 'dashboard' | 'admin'>('home');
  const [selectedBuilder, setSelectedBuilder] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isBuilder, setIsBuilder] = useState(false);
  const isAdmin = user?.email === 'justin@completebarndo.com';

  // Reset selected builder when switching tabs
  useEffect(() => {
    setSelectedBuilder(null);
  }, [activeTab]);

  // Handle URL params (Stripe checkout return)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    const checkout = params.get('checkout');

    if (tab === 'dashboard' && checkout === 'success') {
      setActiveTab('dashboard');
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    } else if (tab === 'signup' && checkout === 'canceled') {
      setActiveTab('signup');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  // Check if current user is a builder
  useEffect(() => {
    if (!user?.uid) {
      setIsBuilder(false);
      return;
    }

    const checkBuilder = async () => {
      try {
        const q = query(collection(db, 'builders'), where('ownerUid', '==', user.uid));
        const snapshot = await getDocs(q);
        setIsBuilder(!snapshot.empty);
      } catch (err) {
        console.error('Failed to check builder status:', err);
      }
    };
    checkBuilder();
  }, [user]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        try {
          const userDoc = await getDoc(userDocRef);
          if (!userDoc.exists()) {
            await setDoc(userDocRef, {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              role: 'user',
              createdAt: serverTimestamp()
            });
          }
          setUser(firebaseUser);
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}`);
        }
      } else {
        setUser(null);
      }
      setIsAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      if (error.code !== 'auth/popup-closed-by-user') {
        handleFirestoreError(error, OperationType.GET, 'auth');
      }
    }
  };

  const handleSignOut = () => auth.signOut();

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-[#f5f5f0] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-stone-500 font-medium animate-pulse">Loading BarndoExpert...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Layout
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
        isBuilder={isBuilder}
        isAdmin={isAdmin}
      >
        {activeTab === 'home' && (
          <Home 
            onStartChat={() => setActiveTab('chat')} 
            onFindBuilder={() => setActiveTab('directory')} 
          />
        )}
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
          selectedBuilder ? (
            <BuilderProfile 
              builder={selectedBuilder} 
              onBack={() => setSelectedBuilder(null)} 
            />
          ) : (
            <BuilderDirectory 
              user={user} 
              onSignup={() => setActiveTab('signup')} 
              onSelectBuilder={setSelectedBuilder}
            />
          )
        )}
        {activeTab === 'signup' && <BuilderSignup />}
        {activeTab === 'dashboard' && user && (
          <BuilderDashboard user={user} />
        )}
        {activeTab === 'admin' && user && isAdmin && (
          <AdminPanel user={user} />
        )}
        {activeTab === 'faq' && (
          <FAQ
            onStartChat={() => setActiveTab('chat')}
            onFindBuilder={() => setActiveTab('directory')}
          />
        )}
      </Layout>
    </ErrorBoundary>
  );
}
