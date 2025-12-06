import React from 'react';
import { LayoutTemplate, Zap, ArrowRight, MousePointer2, Target, Linkedin, Twitter, Sparkles, Check, Globe, BarChart3, Search, Hash, CheckCircle2 } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  const scrollToSection = (id: string) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen font-sans overflow-x-hidden selection:bg-blue-100 selection:text-blue-900">
      
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[100vw] h-[800px] bg-gradient-to-b from-blue-50 to-transparent opacity-80"></div>
        <div className="absolute -top-[200px] -right-[200px] w-[600px] h-[600px] bg-indigo-200/30 rounded-full blur-[100px]"></div>
        <div className="absolute top-[200px] -left-[200px] w-[600px] h-[600px] bg-blue-200/30 rounded-full blur-[100px]"></div>
        <div className="absolute inset-0 grid-bg opacity-40"></div>
      </div>

      {/* Navbar */}
      <nav className="fixed w-full top-0 z-50 transition-all duration-300 border-b border-white/50 bg-white/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
             <div className="bg-blue-600 text-white p-2 rounded-xl shadow-lg shadow-blue-600/20">
               <Zap size={20} fill="currentColor" />
             </div>
             <span className="font-extrabold text-xl tracking-tight text-slate-900">Rank<span className="text-blue-600">Forge</span></span>
          </div>
          <div className="flex items-center gap-6">
            <button 
                onClick={() => scrollToSection('features')}
                className="hidden sm:block text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
                Features
            </button>
            <button 
                onClick={() => scrollToSection('pricing')}
                className="hidden sm:block text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
                Pricing
            </button>
            <button 
                onClick={onStart}
                className="bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold py-2.5 px-6 rounded-full transition-all shadow-lg shadow-slate-900/10 hover:shadow-slate-900/20 hover:-translate-y-0.5"
            >
                Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 sm:pt-40 sm:pb-32 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto mb-16">
                <div className="inline-flex items-center gap-2 bg-white border border-slate-200 shadow-sm text-slate-600 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500 hover:border-blue-300 transition-colors cursor-default">
                   <Sparkles size={12} className="text-blue-600" /> AI-Powered Content Intelligence
                </div>
                
                <h1 className="text-5xl sm:text-7xl font-extrabold text-slate-900 tracking-tight mb-8 leading-[1.1] animate-in fade-in slide-in-from-bottom-6 duration-700">
                  Find the gap. <br className="hidden sm:block" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600">Own the narrative.</span>
                </h1>
                
                <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700">
                   Most SEO tools just give you data. RankForge AI scans your competitors, finds exactly what they missed, and <strong>writes the winning content</strong> for you.
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-1000">
                    <button 
                      onClick={onStart}
                      className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-8 rounded-full transition-all shadow-xl shadow-blue-600/30 hover:shadow-blue-600/40 hover:-translate-y-1 flex items-center justify-center gap-2 group text-lg"
                    >
                      Analyze My Niche
                      <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </button>
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 px-6 py-4">
                        <Check size={16} className="text-green-500" /> No credit card required
                    </div>
                </div>
            </div>

            {/* 3D Dashboard Preview */}
            <div className="relative max-w-5xl mx-auto animate-in fade-in zoom-in-95 duration-1000 delay-200">
                {/* Decorative glow behind */}
                <div className="absolute inset-0 bg-blue-600/10 blur-3xl -z-10 rounded-[3rem] transform scale-90"></div>
                
                {/* Main Interface Mockup */}
                <div className="glass-card rounded-2xl p-2 sm:p-4 shadow-2xl border border-white/60 bg-white/40">
                    <div className="bg-slate-50 rounded-xl overflow-hidden border border-slate-200 shadow-inner">
                        {/* Fake Browser Header */}
                        <div className="bg-white border-b border-slate-100 px-4 py-3 flex items-center gap-4">
                            <div className="flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                            </div>
                            <div className="flex-1 bg-slate-100 h-8 rounded-lg mx-4 flex items-center px-3 text-xs text-slate-400 font-mono">
                                <Search size={12} className="mr-2" /> rankforge.ai/dashboard
                            </div>
                        </div>

                        {/* Fake Dashboard Content */}
                        <div className="p-6 sm:p-8">
                             <div className="flex justify-between items-center mb-8">
                                 <div>
                                     <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                       <LayoutTemplate className="text-blue-600" size={24} /> 
                                       Competitor Gap Strategy
                                     </h3>
                                     <p className="text-sm text-slate-500">Results for: <span className="font-semibold text-slate-700">Specialty Coffee</span></p>
                                 </div>
                                 <div className="flex gap-2">
                                     <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600"><Twitter size={18}/></div>
                                     <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600"><Linkedin size={18}/></div>
                                 </div>
                             </div>

                             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                 {/* Card 1: Article Brief */}
                                 <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-2 hover:shadow-md transition-shadow">
                                     <div className="flex justify-between items-start mb-2">
                                         <div className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-1 rounded border border-blue-100 uppercase tracking-wide">Article</div>
                                         <span className="text-[10px] font-bold text-slate-400">DAY 1</span>
                                     </div>
                                     <h4 className="font-bold text-slate-900 text-sm leading-tight">Ultimate Guide to Arabica Beans</h4>
                                     <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                                         Deep dive into origins, flavor profiles, and roasting techniques that competitors missed.
                                     </p>
                                     <div className="mt-3 pt-3 border-t border-slate-50 flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                                         <Hash size={12} /> Target: "best arabica beans"
                                     </div>
                                 </div>

                                 {/* Card 2: Thread Brief (Active) */}
                                 <div className="bg-white p-5 rounded-xl border-2 border-blue-500 shadow-xl shadow-blue-500/10 flex flex-col gap-2 relative transform scale-105 z-10">
                                     <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase shadow-lg flex items-center gap-1 tracking-wide">
                                         <Check size={10} strokeWidth={4} /> Generated
                                     </div>
                                     <div className="flex justify-between items-start mb-2">
                                         <div className="bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded border border-slate-800 uppercase tracking-wide">Thread</div>
                                         <span className="text-[10px] font-bold text-slate-400">DAY 2</span>
                                     </div>
                                     <h4 className="font-bold text-slate-900 text-sm leading-tight">5 Myths About Dark Roast Coffee</h4>
                                     <div className="space-y-2 mt-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                                          <div className="flex gap-2 items-start">
                                             <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 shrink-0"></div>
                                             <p className="text-xs text-slate-600 leading-snug">Stop believing bold = strong...</p>
                                          </div>
                                          <div className="flex gap-2 items-start">
                                             <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1.5 shrink-0"></div>
                                             <p className="text-xs text-slate-600 leading-snug">Caffeine content is actually...</p>
                                          </div>
                                     </div>
                                     <button className="mt-2 w-full bg-slate-900 h-8 rounded-lg text-white text-xs font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10">View Thread</button>
                                 </div>

                                 {/* Card 3: LinkedIn Brief */}
                                 <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-2 hover:shadow-md transition-shadow">
                                     <div className="flex justify-between items-start mb-2">
                                         <div className="bg-sky-50 text-sky-700 text-[10px] font-bold px-2 py-1 rounded border border-sky-100 uppercase tracking-wide">LinkedIn</div>
                                         <span className="text-[10px] font-bold text-slate-400">DAY 3</span>
                                     </div>
                                     <h4 className="font-bold text-slate-900 text-sm leading-tight">Future of Sustainable Farming</h4>
                                     <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                                         How micro-lots are changing the economics for small farmers. Thought leadership piece.
                                     </p>
                                     <div className="mt-3 pt-3 border-t border-slate-50 flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                                         <Target size={12} /> Gap: Sustainability Trends
                                     </div>
                                 </div>
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Social Proof */}
      <div className="bg-white border-y border-slate-100 py-12 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4">
              <p className="text-center text-sm font-bold text-slate-400 uppercase tracking-widest mb-8">Trusted by growth teams worldwide</p>
              <div className="flex flex-wrap justify-center gap-12 sm:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                   {/* Fake Logos */}
                   <div className="flex items-center gap-2 font-bold text-xl text-slate-700"><Globe size={24} /> GlobalTech</div>
                   <div className="flex items-center gap-2 font-bold text-xl text-slate-700"><Zap size={24} /> FastScale</div>
                   <div className="flex items-center gap-2 font-bold text-xl text-slate-700"><LayoutTemplate size={24} /> CreatorLabs</div>
                   <div className="flex items-center gap-2 font-bold text-xl text-slate-700"><BarChart3 size={24} /> MetricsFlow</div>
              </div>
          </div>
      </div>

      {/* Features Grid (Bento Style) */}
      <div id="features" className="py-24 sm:py-32 relative z-10">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-20">
               <h2 className="text-4xl font-extrabold text-slate-900 mb-6">Build a content engine without the burnout</h2>
               <p className="text-lg text-slate-600 leading-relaxed">Stop staring at a blank page. Our AI handles the research, strategy, and first draft, so you can focus on distribution.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               {/* Feature 1 - Large */}
               <div className="md:col-span-2 bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:border-blue-200 transition-all group overflow-hidden relative">
                   <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:opacity-20 transition-opacity">
                       <Target size={200} className="text-blue-600" />
                   </div>
                   <div className="relative z-10">
                       <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-6">
                           <Target size={28} />
                       </div>
                       <h3 className="text-2xl font-bold text-slate-900 mb-4">Competitor Gap Detection</h3>
                       <p className="text-slate-600 leading-relaxed max-w-lg">
                           We don't just find keywords. We analyze the top 10 results for your niche, identify exactly what questions they failed to answer, and build a strategy to fill that void. This is how you outrank bigger sites.
                       </p>
                   </div>
               </div>

               {/* Feature 2 - Tall */}
               <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 shadow-xl shadow-slate-900/20 hover:shadow-2xl hover:scale-[1.02] transition-all flex flex-col justify-between relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-slate-800 to-slate-900 z-0"></div>
                   <div className="relative z-10">
                       <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-white mb-6 backdrop-blur-sm">
                           <Sparkles size={28} />
                       </div>
                       <h3 className="text-2xl font-bold mb-4">One-Click Gen</h3>
                       <p className="text-slate-400 leading-relaxed mb-8">
                           Turn a strategy brief into a 1,500 word article, a 10-tweet thread, and a LinkedIn post instantly.
                       </p>
                   </div>
                   <div className="relative z-10 bg-slate-800/50 rounded-xl p-4 border border-white/10 backdrop-blur-md">
                       <div className="flex items-center gap-3 mb-2">
                           <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                           <span className="text-xs font-mono text-green-400">GENERATING...</span>
                       </div>
                       <div className="space-y-2 opacity-50">
                           <div className="h-2 bg-white/20 rounded w-full"></div>
                           <div className="h-2 bg-white/20 rounded w-3/4"></div>
                           <div className="h-2 bg-white/20 rounded w-5/6"></div>
                       </div>
                   </div>
               </div>

               {/* Feature 3 */}
               <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-xl shadow-slate-200/50 hover:border-purple-200 transition-all">
                   <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 mb-6">
                       <LayoutTemplate size={28} />
                   </div>
                   <h3 className="text-2xl font-bold text-slate-900 mb-4">Multi-Channel</h3>
                   <p className="text-slate-600 leading-relaxed">
                       Don't just rely on SEO. Repurpose every winning angle into viral social content automatically.
                   </p>
               </div>

               {/* Feature 4 */}
               <div className="md:col-span-2 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-3xl p-8 sm:p-12 shadow-xl shadow-blue-600/20 flex flex-col sm:flex-row items-center gap-8 relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
                   <div className="flex-1 relative z-10">
                       <h3 className="text-2xl font-bold mb-4">Live SEO Audit included</h3>
                       <p className="text-blue-100 text-lg leading-relaxed mb-6">
                           We check your technical health, meta tags, and load speed estimates before building your strategy to ensure you have a solid foundation.
                       </p>
                       <button onClick={onStart} className="bg-white text-blue-700 px-6 py-3 rounded-xl font-bold text-sm hover:bg-blue-50 transition-colors shadow-lg">
                           Run Audit Free
                       </button>
                   </div>
                   <div className="w-full sm:w-1/3 bg-white/10 rounded-2xl p-6 backdrop-blur-md border border-white/20 relative z-10 transform rotate-3 hover:rotate-0 transition-all">
                       <div className="flex justify-between items-end mb-4">
                           <span className="text-4xl font-extrabold">92</span>
                           <span className="text-sm font-bold bg-green-400 text-green-900 px-2 py-1 rounded">EXCELLENT</span>
                       </div>
                       <div className="text-xs font-bold uppercase tracking-widest opacity-70">Health Score</div>
                   </div>
               </div>
            </div>
         </div>
      </div>

      {/* Pricing Section */}
      <div id="pricing" className="bg-white py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
                <h2 className="text-4xl font-extrabold text-slate-900 mb-4">Simple, transparent pricing</h2>
                <p className="text-lg text-slate-500">Choose the plan that fits your growth stage. No hidden fees.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {/* Free */}
                <div className="p-8 rounded-2xl border border-slate-200 hover:border-blue-200 transition-all flex flex-col">
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Free Starter</h3>
                    <div className="mb-6">
                        <span className="text-4xl font-extrabold text-slate-900">$0</span>
                        <span className="text-slate-500">/mo</span>
                    </div>
                    <ul className="space-y-4 mb-8 flex-1">
                        <li className="flex gap-2 text-sm text-slate-600"><CheckCircle2 className="w-5 h-5 text-green-500 shrink-0"/> 3 Searches / month</li>
                        <li className="flex gap-2 text-sm text-slate-600"><CheckCircle2 className="w-5 h-5 text-green-500 shrink-0"/> Basic Analysis</li>
                        <li className="flex gap-2 text-sm text-slate-600"><CheckCircle2 className="w-5 h-5 text-green-500 shrink-0"/> 6 Content Ideas</li>
                    </ul>
                    <button onClick={onStart} className="w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold transition-colors">Start for Free</button>
                </div>

                {/* Pro */}
                <div className="p-8 rounded-2xl border-2 border-blue-600 shadow-xl scale-105 bg-white relative flex flex-col">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                        Most Popular
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Pro Growth</h3>
                    <div className="mb-6">
                        <span className="text-4xl font-extrabold text-slate-900">$29</span>
                        <span className="text-slate-500">/mo</span>
                    </div>
                    <ul className="space-y-4 mb-8 flex-1">
                        <li className="flex gap-2 text-sm text-slate-600"><CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0"/> 50 Searches / month</li>
                        <li className="flex gap-2 text-sm text-slate-600"><CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0"/> Advanced Competitor Gaps</li>
                        <li className="flex gap-2 text-sm text-slate-600"><CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0"/> 12 Content Ideas</li>
                        <li className="flex gap-2 text-sm text-slate-600"><CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0"/> Priority Support</li>
                    </ul>
                    <button onClick={onStart} className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-colors shadow-lg shadow-blue-600/20">Get Started</button>
                </div>

                {/* Business */}
                <div className="p-8 rounded-2xl border border-slate-200 hover:border-slate-300 transition-all flex flex-col bg-slate-50">
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Business</h3>
                    <div className="mb-6">
                        <span className="text-4xl font-extrabold text-slate-900">$99</span>
                        <span className="text-slate-500">/mo</span>
                    </div>
                    <ul className="space-y-4 mb-8 flex-1">
                        <li className="flex gap-2 text-sm text-slate-600"><CheckCircle2 className="w-5 h-5 text-slate-900 shrink-0"/> 500 Searches / month</li>
                        <li className="flex gap-2 text-sm text-slate-600"><CheckCircle2 className="w-5 h-5 text-slate-900 shrink-0"/> Full Strategy Suite</li>
                        <li className="flex gap-2 text-sm text-slate-600"><CheckCircle2 className="w-5 h-5 text-slate-900 shrink-0"/> Dedicated Support</li>
                    </ul>
                    <button onClick={onStart} className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-colors">Contact Sales</button>
                </div>
            </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-slate-50 py-20">
         <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-4xl font-extrabold text-slate-900 mb-8">Ready to outrank the competition?</h2>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button 
                   onClick={onStart}
                   className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 px-12 rounded-full transition-all shadow-xl shadow-slate-900/20 text-lg"
                >
                   Build My Strategy Now
                </button>
            </div>
            <p className="mt-6 text-sm text-slate-500">Join 1,000+ marketers automating their growth.</p>
         </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-2">
                 <div className="bg-slate-900 text-white p-1.5 rounded-lg">
                   <Zap size={16} fill="currentColor" />
                 </div>
                 <span className="font-bold text-lg text-slate-900">RankForge AI</span>
              </div>
              <div className="flex gap-8 text-sm text-slate-500 font-medium">
                  <a href="#" className="hover:text-slate-900">Privacy</a>
                  <a href="#" className="hover:text-slate-900">Terms</a>
                  <a href="#" className="hover:text-slate-900">Twitter</a>
                  <a href="#" className="hover:text-slate-900">LinkedIn</a>
              </div>
              <div className="text-sm text-slate-400">
                  © 2024 RankForge AI. All rights reserved.
              </div>
          </div>
      </footer>
    </div>
  );
};