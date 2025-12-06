import React, { useState, useEffect } from 'react';
import { Search, Loader2, BarChart2, LayoutTemplate, Zap, ExternalLink, Megaphone, Crown, CreditCard, LogOut, CheckCircle, Save, FolderOpen } from 'lucide-react';
import { AnalysisResult, StrategyResult, AppState, User, SavedProject } from './types';
import { analyzeKeywords, generateStrategy } from './services/geminiService';
import { manageBilling, verifyPaymentSession, cancelSubscription, reactivateSubscription } from './services/paymentService';
import { dbService } from './services/dbService';
import { authService } from './services/authService';
import { projectService } from './services/projectService';
import { AnalysisView } from './components/AnalysisView';
import { StrategyView } from './components/StrategyView';
import { LoadingView } from './components/LoadingView';
import { PricingModal } from './components/PricingModal';
import { LandingPage } from './components/LandingPage';
import { SavedProjects } from './components/SavedProjects';
import { BillingDashboard } from './components/BillingDashboard';

const App: React.FC = () => {
  const [showLanding, setShowLanding] = useState(true);
  const [domain, setDomain] = useState('');
  const [niche, setNiche] = useState('');
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [strategy, setStrategy] = useState<StrategyResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  // Auth & Billing State
  const [user, setUser] = useState<User | null>(null);
  const [showPricing, setShowPricing] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  
  // Saved Projects State
  const [savedProjects, setSavedProjects] = useState<SavedProject[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [showSavedProjects, setShowSavedProjects] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showBillingDashboard, setShowBillingDashboard] = useState(false);

  // Initialize Auth & Check for Payment Redirect
  useEffect(() => {
    const init = async () => {
        const currentUser = await dbService.getCurrentUser();
        setUser(currentUser);
        setAuthLoading(false);
        
        // Load saved projects for user
        if (currentUser) {
          setSavedProjects(projectService.getUserProjects(currentUser.id));
        }

        // Check for Payment Success from Stripe redirect
        const params = new URLSearchParams(window.location.search);
        const sessionId = params.get('session_id');
        
        if (params.get('payment_success') === 'true' && sessionId && currentUser) {
             try {
                 // Verify the payment with Stripe
                 const verification = await verifyPaymentSession(sessionId);
                 
                 if (verification.success && verification.planTier) {
                     let updatedUser = await dbService.updatePlan(currentUser.id, verification.planTier);
                     
                     // Store Stripe customer ID and subscription data
                     if (verification.customerId) {
                         await dbService.updateStripeCustomerId(currentUser.id, verification.customerId);
                         updatedUser.stripeCustomerId = verification.customerId;
                     }
                     
                     // Store subscription details
                     if (verification.subscriptionId) {
                         updatedUser = await dbService.updateSubscription(currentUser.id, {
                             stripeSubscriptionId: verification.subscriptionId,
                             subscriptionStatus: verification.status as 'active',
                             currentPeriodEnd: verification.currentPeriodEnd,
                             cancelAtPeriodEnd: false,
                         });
                     }
                     
                     setUser(updatedUser);
                     setSuccessMsg(`Successfully upgraded to ${verification.planTier} Plan! You're now a member.`);
                     setShowPricing(false);
                     setShowLanding(false);
                 }
                 
                 // Clean URL
                 window.history.replaceState({}, document.title, window.location.pathname);
                 setTimeout(() => setSuccessMsg(null), 5000);
             } catch (e) {
                 console.error("Failed to finalize plan update", e);
             }
        }
    };
    init();
  }, []);

  const handleLogin = async () => {
    try {
        const loggedInUser = await authService.signInWithGoogle();
        setUser(loggedInUser);
        setShowPricing(false);
        setSavedProjects(projectService.getUserProjects(loggedInUser.id));
    } catch (e) {
        console.error("Login failed", e);
        setError("Failed to sign in with Google. Please try again.");
    }
  };

  const handleLogout = async () => {
      await authService.signOut();
      setUser(null);
      setAppState(AppState.IDLE);
      setAnalysisResult(null);
      setStrategy(null);
  };

  const handleManageBilling = async () => {
      if (!user?.stripeCustomerId) {
          alert("No billing information found.");
          return;
      }
      await manageBilling(user.stripeCustomerId);
  };

  const handleOpenBillingDashboard = () => {
      setShowBillingDashboard(true);
  };

  const handleCancelSubscription = async () => {
      if (!user?.stripeSubscriptionId) return;
      const result = await cancelSubscription(user.stripeSubscriptionId);
      if (result.success) {
          const updatedUser = await dbService.updateSubscription(user.id, {
              cancelAtPeriodEnd: true,
          });
          setUser(updatedUser);
          setSuccessMsg('Subscription will be canceled at the end of your billing period.');
          setTimeout(() => setSuccessMsg(null), 5000);
      }
  };

  const handleReactivateSubscription = async () => {
      if (!user?.stripeSubscriptionId) return;
      const result = await reactivateSubscription(user.stripeSubscriptionId);
      if (result.success) {
          const updatedUser = await dbService.updateSubscription(user.id, {
              cancelAtPeriodEnd: false,
          });
          setUser(updatedUser);
          setSuccessMsg('Subscription reactivated successfully!');
          setTimeout(() => setSuccessMsg(null), 5000);
      }
  };

  const handleAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain || !niche) return;

    if (!user) {
        // Require login for persistence
        handleLogin(); 
        return;
    }

    // Check Usage Quota
    try {
        const canProceed = await dbService.checkAvailability(user.id);
        if (!canProceed) {
            setShowPricing(true);
            setError("You have reached your monthly search limit. Please upgrade.");
            return;
        }
    } catch (e) {
        console.error(e);
        return;
    }

    setAppState(AppState.ANALYZING);
    setError(null);
    setSuccessMsg(null);

    try {
      const result = await analyzeKeywords(domain, niche);
      setAnalysisResult(result);
      setAppState(AppState.ANALYSIS_COMPLETE);

      // Increment Usage
      const updatedUser = await dbService.incrementUsage(user.id);
      setUser(updatedUser);

    } catch (err) {
      setError("Failed to analyze domain. Please check your API key or try again.");
      setAppState(AppState.IDLE);
    }
  };

  const handleStrategyGeneration = async () => {
    if (!analysisResult) return;

    setAppState(AppState.GENERATING_STRATEGY);
    try {
      const plan = user?.plan || 'Free';
      const result = await generateStrategy(
          domain, 
          analysisResult.keywords, 
          analysisResult.audit, 
          analysisResult.clusters,
          plan
      );
      setStrategy(result);
      setAppState(AppState.STRATEGY_COMPLETE);
      
      // Auto-save after strategy generation
      if (user) {
        const saved = projectService.saveProject(
          user.id, domain, niche, analysisResult, result, currentProjectId || undefined
        );
        setCurrentProjectId(saved.id);
        setSavedProjects(projectService.getUserProjects(user.id));
      }
    } catch (err) {
      console.error(err);
      setError("Failed to generate content strategy. Please try again.");
      setAppState(AppState.ANALYSIS_COMPLETE);
    }
  };

  const autoSaveStrategy = (newStrategy: StrategyResult) => {
    if (user && analysisResult && currentProjectId) {
      projectService.updateStrategy(currentProjectId, newStrategy);
    }
  };

  const handleContentUpdate = (index: number, content: string, imageUrl?: string) => {
    if (!strategy) return;
    const newBriefs = [...strategy.briefs];
    newBriefs[index] = { 
        ...newBriefs[index], 
        htmlContent: content,
        imageUrl: imageUrl || newBriefs[index].imageUrl 
    };
    const newStrategy = { ...strategy, briefs: newBriefs };
    setStrategy(newStrategy);
    autoSaveStrategy(newStrategy);
  };

  const handleThreadUpdate = (index: number, thread: string[], imageUrl?: string) => {
    if (!strategy) return;
    const newBriefs = [...strategy.briefs];
    newBriefs[index] = {
        ...newBriefs[index],
        xThreadContent: thread,
        xThreadImageUrl: imageUrl || newBriefs[index].xThreadImageUrl
    };
    const newStrategy = { ...strategy, briefs: newBriefs };
    setStrategy(newStrategy);
    autoSaveStrategy(newStrategy);
  };

  const handleLinkedInUpdate = (index: number, post: string, imageUrl?: string) => {
    if (!strategy) return;
    const newBriefs = [...strategy.briefs];
    newBriefs[index] = {
        ...newBriefs[index],
        linkedInContent: post,
        linkedInImageUrl: imageUrl || newBriefs[index].linkedInImageUrl
    };
    const newStrategy = { ...strategy, briefs: newBriefs };
    setStrategy(newStrategy);
    autoSaveStrategy(newStrategy);
  };

  const handleSaveProject = () => {
    if (!user || !analysisResult) return;
    
    setIsSaving(true);
    try {
      const saved = projectService.saveProject(
        user.id,
        domain,
        niche,
        analysisResult,
        strategy || undefined,
        currentProjectId || undefined
      );
      setCurrentProjectId(saved.id);
      setSavedProjects(projectService.getUserProjects(user.id));
      setSuccessMsg('Project saved successfully!');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (e) {
      setError('Failed to save project');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadProject = (project: SavedProject) => {
    setDomain(project.domain);
    setNiche(project.niche);
    setAnalysisResult(project.analysis);
    setStrategy(project.strategy || null);
    setCurrentProjectId(project.id);
    setShowSavedProjects(false);
    setAppState(project.strategy ? AppState.STRATEGY_COMPLETE : AppState.ANALYSIS_COMPLETE);
  };

  const handleDeleteProject = (projectId: string) => {
    projectService.deleteProject(projectId);
    if (user) {
      setSavedProjects(projectService.getUserProjects(user.id));
    }
    if (currentProjectId === projectId) {
      setCurrentProjectId(null);
    }
  };

  const reset = () => {
    setAppState(AppState.IDLE);
    setAnalysisResult(null);
    setStrategy(null);
    setDomain('');
    setNiche('');
    setError(null);
    setSuccessMsg(null);
    setCurrentProjectId(null);
  };

  if (authLoading) return null; // Or a spinner

  if (showLanding) {
      return <LandingPage onStart={() => setShowLanding(false)} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={reset}>
            <div className="bg-blue-600 text-white p-1.5 rounded-lg">
              <Zap size={20} fill="currentColor" />
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">Rank<span className="text-blue-600">Forge</span> AI</span>
          </div>
          
          <div className="flex items-center gap-4">
            {user && savedProjects.length > 0 && (
              <button 
                onClick={() => setShowSavedProjects(true)} 
                className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1"
              >
                <FolderOpen size={16} />
                Projects ({savedProjects.length})
              </button>
            )}
            
            <button onClick={() => setShowPricing(true)} className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">Pricing</button>
            
            {user ? (
                 <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                    <div className="text-right hidden sm:block group relative pb-2">
                        <p className="text-sm font-bold text-slate-900 leading-none cursor-default">{user.name}</p>
                        <div className="flex items-center justify-end gap-2 mt-1">
                             <p className="text-xs text-blue-600 font-bold uppercase tracking-wider flex items-center gap-1 cursor-default">
                                {user.plan === 'Pro' || user.plan === 'Business' ? <Crown size={10} fill="currentColor" /> : null} 
                                {user.plan}
                            </p>
                            <span className="text-xs text-slate-400">
                                ({user.creditsUsed}/{user.maxCredits})
                            </span>
                        </div>
                        
                        {/* Dropdown Menu */}
                        <div className="absolute right-0 top-full pt-2 w-44 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity z-50">
                            <div className="bg-white border border-slate-200 shadow-lg rounded-lg py-2 flex flex-col">
                                <button 
                                    onClick={handleOpenBillingDashboard}
                                    className="px-4 py-2 text-left text-xs font-medium text-slate-600 hover:text-blue-600 hover:bg-slate-50 flex items-center gap-2"
                                >
                                    <CreditCard size={12} />
                                    Billing Dashboard
                                </button>
                                <button 
                                    onClick={handleLogout}
                                    className="px-4 py-2 text-left text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2"
                                >
                                    <LogOut size={12} />
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    </div>
                    <img src={user.avatarUrl} alt={user.name} className="w-9 h-9 rounded-full bg-slate-200 border border-slate-200" />
                 </div>
            ) : (
                <button 
                    onClick={handleLogin}
                    className="bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 font-medium py-2 px-4 rounded-lg transition-all flex items-center gap-2 text-sm shadow-sm"
                >
                    <svg viewBox="0 0 24 24" className="w-4 h-4" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/><path d="M1 1h22v22H1z" fill="none"/></svg>
                    Sign in with Google
                </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Success Message */}
        {successMsg && (
             <div className="mb-8 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2 animate-fade-in shadow-sm">
                <CheckCircle size={18} />
                {successMsg}
             </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between animate-fade-in shadow-sm">
             <div className="flex items-center gap-2">
                <ExternalLink size={18} />
                {error}
             </div>
             {error.includes('upgrade') && (
                 <button onClick={() => setShowPricing(true)} className="text-sm font-bold underline hover:text-red-900">View Plans</button>
             )}
          </div>
        )}

        {/* Hero / Input State */}
        {appState === AppState.IDLE && (
          <div className="max-w-2xl mx-auto mt-16 text-center animate-fade-in">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-6">
              Dominate Your Niche with <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Intelligent SEO Analysis</span>
            </h1>
            <p className="text-lg text-slate-600 mb-10 max-w-lg mx-auto">
              Enter your domain and niche. Our AI analyzes opportunities, audits your site content, and builds a complete content roadmap for you.
            </p>

            <form onSubmit={handleAnalysis} className="bg-white p-2 rounded-2xl shadow-xl border border-slate-200 flex flex-col sm:flex-row gap-2">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="e.g., mycoffeebrand.com"
                  className="w-full px-4 py-3 rounded-xl bg-transparent focus:outline-none text-slate-900 placeholder:text-slate-400"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  required
                />
              </div>
              <div className="w-px bg-slate-200 hidden sm:block"></div>
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="e.g., Specialty Coffee Roasting"
                  className="w-full px-4 py-3 rounded-xl bg-transparent focus:outline-none text-slate-900 placeholder:text-slate-400"
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={!domain || !niche}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                Audit & Analyze <Search size={18} />
              </button>
            </form>
            
            <div className="mt-12 flex justify-center gap-8 text-slate-400">
               <div className="flex flex-col items-center gap-2">
                  <div className="p-3 bg-white rounded-full shadow-sm border border-slate-100"><BarChart2 size={20} className="text-blue-500" /></div>
                  <span className="text-xs font-medium">Keyword Gaps</span>
               </div>
               <div className="flex flex-col items-center gap-2">
                  <div className="p-3 bg-white rounded-full shadow-sm border border-slate-100"><LayoutTemplate size={20} className="text-purple-500" /></div>
                  <span className="text-xs font-medium">Site Audit</span>
               </div>
               <div className="flex flex-col items-center gap-2">
                  <div className="p-3 bg-white rounded-full shadow-sm border border-slate-100"><Megaphone size={20} className="text-green-500" /></div>
                  <span className="text-xs font-medium">Content Gen</span>
               </div>
            </div>
          </div>
        )}

        {/* Loading States */}
        {appState === AppState.ANALYZING && (
          <LoadingView mode="analyzing" />
        )}
        
        {appState === AppState.GENERATING_STRATEGY && (
          <LoadingView mode="strategy" />
        )}

        {/* Results View */}
        {(appState === AppState.ANALYSIS_COMPLETE || appState === AppState.STRATEGY_COMPLETE) && analysisResult && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                 <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                   Results for <span className="text-blue-600">{domain}</span>
                 </h2>
                 <p className="text-slate-500">Niche: {niche}</p>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Save Button */}
                {user && (
                  <button
                    onClick={handleSaveProject}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    {currentProjectId ? 'Update' : 'Save'} Project
                  </button>
                )}
                
                {/* Tabs for switching views if strategy exists */}
                {appState === AppState.STRATEGY_COMPLETE && (
                  <div className="flex bg-slate-200 p-1 rounded-lg">
                     <button 
                      className="px-4 py-1.5 rounded-md text-sm font-medium bg-white shadow-sm text-slate-900"
                      disabled
                     >
                       Strategy Active
                     </button>
                  </div>
                )}
              </div>
            </div>

            {/* Keyword Analysis Component */}
            {appState === AppState.ANALYSIS_COMPLETE && (
              <AnalysisView analysis={analysisResult} onGenerateStrategy={handleStrategyGeneration} />
            )}

            {/* Strategy Component */}
            {appState === AppState.STRATEGY_COMPLETE && strategy && (
               <div className="space-y-12">
                  <section>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <LayoutTemplate className="text-blue-600" size={24} /> 
                        Competitor Gap Briefs
                      </h3>
                      <button 
                        onClick={() => setAppState(AppState.ANALYSIS_COMPLETE)}
                        className="text-sm text-slate-500 hover:text-blue-600 underline"
                      >
                        Back to Audit
                      </button>
                    </div>
                    <StrategyView 
                        domain={domain}
                        strategy={strategy} 
                        onUpdateContent={handleContentUpdate}
                        onUpdateThread={handleThreadUpdate}
                        onUpdateLinkedIn={handleLinkedInUpdate}
                    />
                  </section>
               </div>
            )}
          </div>
        )}

      </main>

      {/* Pricing Modal */}
      {showPricing && (
        <PricingModal 
            user={user}
            onClose={() => setShowPricing(false)} 
            onLoginRequest={handleLogin}
            onUpgradeSuccess={(updatedUser) => setUser(updatedUser)}
        />
      )}

      {/* Saved Projects Modal */}
      {showSavedProjects && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FolderOpen size={20} className="text-blue-600" />
                Saved Projects
              </h3>
              <button 
                onClick={() => setShowSavedProjects(false)}
                className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"
              >
                ✕
              </button>
            </div>
            <div className="p-4 max-h-96 overflow-y-auto">
              <SavedProjects 
                projects={savedProjects}
                onLoad={handleLoadProject}
                onDelete={handleDeleteProject}
              />
            </div>
          </div>
        </div>
      )}

      {/* Billing Dashboard Modal */}
      {showBillingDashboard && user && (
        <BillingDashboard
          user={user}
          projects={savedProjects}
          onClose={() => setShowBillingDashboard(false)}
          onManageBilling={handleManageBilling}
          onCancelSubscription={handleCancelSubscription}
          onReactivateSubscription={handleReactivateSubscription}
        />
      )}
    </div>
  );
};

export default App;