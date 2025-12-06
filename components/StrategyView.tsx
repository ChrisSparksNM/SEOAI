import React, { useState } from 'react';
import { StrategyResult } from '../types';
import { Check, Copy, Loader2, Maximize2, X, Target, FileText, Sparkles, Layers, Trophy, MessageCircle, Heart, Repeat, Share, ImageIcon, ChevronRight, Hash, Linkedin, ThumbsUp, MessageSquare, Briefcase } from 'lucide-react';
import { generateFullContent, generateXThread, generateLinkedInPost } from '../services/geminiService';

interface StrategyViewProps {
  strategy: StrategyResult;
  domain: string;
  onUpdateContent: (index: number, content: string, imageUrl?: string) => void;
  onUpdateThread: (index: number, thread: string[], imageUrl?: string) => void;
  onUpdateLinkedIn: (index: number, post: string, imageUrl?: string) => void;
}

export const StrategyView: React.FC<StrategyViewProps> = ({ strategy, domain, onUpdateContent, onUpdateThread, onUpdateLinkedIn }) => {
  const [selectedBriefIndex, setSelectedBriefIndex] = useState<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const selectedBrief = selectedBriefIndex !== null ? strategy.briefs[selectedBriefIndex] : null;

  const handleGenerate = async () => {
    if (selectedBriefIndex === null || !selectedBrief) return;
    
    setIsGenerating(true);
    try {
        if (selectedBrief.contentType === 'Article') {
            const { html, imageUrl } = await generateFullContent(selectedBrief);
            onUpdateContent(selectedBriefIndex, html, imageUrl);
        } else if (selectedBrief.contentType === 'Thread') {
            const { thread, imageUrl } = await generateXThread(selectedBrief);
            onUpdateThread(selectedBriefIndex, thread, imageUrl);
        } else if (selectedBrief.contentType === 'LinkedIn') {
            const { post, imageUrl } = await generateLinkedInPost(selectedBrief);
            onUpdateLinkedIn(selectedBriefIndex, post, imageUrl);
        }
    } catch (error) {
        console.error("Failed to generate content", error);
    } finally {
        setIsGenerating(false);
    }
  };

  const closeModal = () => {
    setSelectedBriefIndex(null);
    setIsGenerating(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Helper styles based on type
  const getTypeStyles = (type: string) => {
      switch(type) {
          case 'Article': return {
              bg: 'bg-white',
              border: 'border-slate-200',
              hoverBorder: 'hover:border-blue-400',
              text: 'text-slate-800',
              icon: <FileText size={18} />,
              iconBg: 'bg-blue-100 text-blue-600',
              tagBg: 'bg-blue-50 text-blue-700 border-blue-100',
              readyColor: 'text-green-600',
              isGenerated: (b: any) => !!b.htmlContent
          };
          case 'Thread': return {
              bg: 'bg-slate-900',
              border: 'border-slate-800',
              hoverBorder: 'hover:border-slate-600',
              text: 'text-white',
              icon: <MessageCircle size={18} />,
              iconBg: 'bg-slate-800 text-white',
              tagBg: 'bg-indigo-900/40 text-indigo-300 border-indigo-800',
              readyColor: 'text-green-400',
              isGenerated: (b: any) => !!b.xThreadContent
          };
          case 'LinkedIn': return {
              bg: 'bg-[#0077b5]', // LinkedIn Blue
              border: 'border-sky-600',
              hoverBorder: 'hover:border-sky-300',
              text: 'text-white',
              icon: <Linkedin size={18} />,
              iconBg: 'bg-sky-800 text-white',
              tagBg: 'bg-sky-900/30 text-sky-100 border-sky-500',
              readyColor: 'text-sky-100',
              isGenerated: (b: any) => !!b.linkedInContent
          };
          default: return { bg: 'bg-white', border: 'border-slate-200', hoverBorder:'', text:'', icon: null, iconBg: '', tagBg: '', readyColor:'', isGenerated: () => false };
      }
  };

  return (
    <div className="space-y-6 animate-fade-in relative min-h-[500px]">
      
      {/* Header Info */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <div className="bg-blue-600 p-2 rounded-lg text-white mt-1">
              <Sparkles size={20} />
          </div>
          <div>
              <h4 className="font-bold text-slate-900">Multi-Channel Strategy</h4>
              <p className="text-sm text-slate-600">
                  Your strategy includes <strong>SEO Articles</strong>, viral <strong>X Threads</strong>, and professional <strong>LinkedIn Posts</strong>.
                  Click any card to generate high-quality content instantly.
              </p>
          </div>
      </div>

      {/* Briefs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {strategy.briefs.map((brief, idx) => {
            const styles = getTypeStyles(brief.contentType);
            const isDone = styles.isGenerated(brief);

            return (
                <div 
                key={idx} 
                onClick={() => setSelectedBriefIndex(idx)}
                className={`cursor-pointer transition-all group relative overflow-hidden flex flex-col h-full rounded-xl border shadow-sm hover:shadow-lg hover:-translate-y-1
                    ${styles.bg} ${styles.border} ${styles.hoverBorder}`}
                >
                
                {/* Type Badge */}
                <div className="absolute top-4 right-4">
                     <div className={`p-1.5 rounded-full ${styles.iconBg} ${isDone ? 'ring-2 ring-green-400' : ''}`}>
                         {styles.icon}
                     </div>
                </div>

                <div className="p-6 pb-2">
                    <div className="flex flex-wrap gap-2 mb-3">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded bg-black/10 backdrop-blur-sm 
                            ${brief.contentType === 'Article' ? 'text-slate-500' : 'text-white/80'}`}>
                            {brief.scheduledDate}
                        </span>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded border ${styles.tagBg}`}>
                            {brief.contentType}
                        </span>
                    </div>
                    
                    <h3 className={`font-bold text-lg leading-snug mb-2 ${styles.text}`}>
                        {brief.title}
                    </h3>
                </div>

                <div className="px-6 py-2 flex-1">
                    <p className={`text-xs line-clamp-3 ${brief.contentType === 'Article' ? 'text-slate-500' : 'text-white/70'}`}>
                        {brief.overview}
                    </p>
                </div>

                <div className={`mt-4 mx-6 mb-6 pt-3 border-t flex items-center justify-between text-xs
                    ${brief.contentType === 'Article' ? 'border-slate-100 text-slate-400' : 'border-white/10 text-white/50'}`}>
                    <span className="flex items-center gap-1 opacity-80"><Hash size={12}/> {brief.targetKeyword}</span>
                    {isDone && (
                        <span className={`font-bold flex items-center gap-1 ${styles.readyColor}`}><Check size={12} /> Ready</span>
                    )}
                </div>
                </div>
            );
        })}
      </div>

      {/* Brief Detail & Generation Modal */}
      {selectedBrief && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-7xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50 shrink-0">
              <div className="flex items-center gap-3">
                 <div className={`p-2 rounded-lg 
                    ${selectedBrief.contentType === 'Article' ? 'bg-blue-100 text-blue-600' : 
                      selectedBrief.contentType === 'Thread' ? 'bg-black text-white' : 'bg-[#0077b5] text-white'}`}>
                     {selectedBrief.contentType === 'Article' ? <FileText size={20} /> : 
                      selectedBrief.contentType === 'Thread' ? <MessageCircle size={20} /> : <Linkedin size={20} />}
                 </div>
                 <div>
                    <h3 className="text-lg font-bold text-slate-900 leading-none mb-1">
                        {selectedBrief.contentType} Strategy
                    </h3>
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Targeting: {selectedBrief.targetKeyword}</p>
                 </div>
              </div>
              <button onClick={closeModal} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
                <X size={24} />
              </button>
            </div>

            {/* Modal Body - Split View */}
            <div className="flex-1 overflow-hidden flex flex-col lg:flex-row bg-white relative">
                
                {/* LEFT SIDE: The Brief (Wider for better readability) */}
                <div className="flex-1 lg:w-[40%] xl:w-[35%] overflow-y-auto border-r border-slate-200 bg-white flex flex-col">
                     <div className="p-8 pb-32"> {/* Added padding bottom for fixed footer */}
                         <div className="flex flex-wrap gap-2 mb-6">
                             <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded font-bold uppercase tracking-wide">{selectedBrief.scheduledDate}</span>
                             <span className="bg-purple-50 text-purple-700 text-xs px-2 py-1 rounded font-bold uppercase tracking-wide border border-purple-100">{selectedBrief.clusterTopic}</span>
                         </div>
                         
                         <h2 className="text-2xl font-extrabold text-slate-900 mb-6 leading-tight">{selectedBrief.title}</h2>
                         
                         <div className="space-y-8">
                             <div>
                                 <h4 className="text-xs font-bold text-slate-400 mb-2 uppercase tracking-wide">Overview</h4>
                                 <p className="text-slate-700 leading-relaxed text-sm">{selectedBrief.overview}</p>
                             </div>

                             <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                                 <h4 className="flex items-center gap-2 text-xs font-bold text-blue-700 mb-2 uppercase tracking-wide">
                                     <Target size={14} /> Competitor Gap
                                 </h4>
                                 <p className="text-sm text-slate-700">{selectedBrief.contentGapAddressed}</p>
                             </div>

                             <div>
                                <h4 className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wide">Strategy Details</h4>
                                <ul className="space-y-4">
                                    <li className="flex gap-3">
                                        <div className="mt-1"><Trophy size={16} className="text-yellow-500" /></div>
                                        <div>
                                            <span className="block text-xs font-bold text-slate-900">Competitive Advantage</span>
                                            <span className="text-sm text-slate-600">{selectedBrief.competitiveAdvantage}</span>
                                        </div>
                                    </li>
                                    <li className="flex gap-3">
                                        <div className="mt-1"><Briefcase size={16} className="text-slate-400" /></div>
                                        <div>
                                            <span className="block text-xs font-bold text-slate-900">Audience</span>
                                            <span className="text-sm text-slate-600">{selectedBrief.primaryAudience}</span>
                                        </div>
                                    </li>
                                </ul>
                             </div>

                             <div className="pt-6 border-t border-slate-100">
                                 <h4 className="text-xs font-bold text-slate-400 mb-4 uppercase tracking-wide">Structure & Key Points</h4>
                                 <div className="space-y-2">
                                     {selectedBrief.structure.map((item, i) => (
                                         <div key={i} className="flex items-start gap-3 text-sm text-slate-700">
                                             <span className="flex-shrink-0 w-5 h-5 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-[10px] font-bold mt-0.5">{i + 1}</span>
                                             <span>{item}</span>
                                         </div>
                                     ))}
                                 </div>
                             </div>
                         </div>
                     </div>
                     
                     {/* Sticky Action Button */}
                     <div className="absolute bottom-0 left-0 right-0 p-6 bg-white/90 backdrop-blur-md border-t border-slate-200 z-10 lg:w-[40%] xl:w-[35%]">
                         <button 
                             onClick={handleGenerate}
                             disabled={isGenerating}
                             className={`w-full py-4 px-6 rounded-xl font-bold flex items-center justify-center gap-2 shadow-xl transition-all hover:scale-[1.01] active:scale-[0.99]
                                ${selectedBrief.contentType === 'Article' 
                                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/20' 
                                    : selectedBrief.contentType === 'Thread' 
                                    ? 'bg-black hover:bg-slate-800 text-white shadow-slate-900/20'
                                    : 'bg-[#0077b5] hover:bg-sky-700 text-white shadow-sky-600/20'
                                } disabled:opacity-70 disabled:cursor-not-allowed`}
                         >
                             {isGenerating ? (
                                 <>
                                    <Loader2 className="animate-spin" /> 
                                    Crafting Content...
                                 </>
                             ) : (
                                 <>
                                    <Sparkles size={18} /> 
                                    {selectedBrief.contentType === 'Article' 
                                        ? (selectedBrief.htmlContent ? 'Regenerate Article' : 'Generate Full Article') 
                                        : selectedBrief.contentType === 'Thread'
                                        ? (selectedBrief.xThreadContent ? 'Regenerate Thread' : 'Generate X Thread')
                                        : (selectedBrief.linkedInContent ? 'Regenerate Post' : 'Generate LinkedIn Post')
                                    }
                                 </>
                             )}
                         </button>
                     </div>
                </div>

                {/* RIGHT SIDE: Output Area */}
                <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden relative min-h-[400px]">
                    
                    {/* Header for Output */}
                    <div className="px-8 py-4 border-b border-slate-200 bg-white flex justify-between items-center shrink-0">
                         <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide">
                             Preview
                         </h3>
                         {(selectedBrief.htmlContent || selectedBrief.xThreadContent || selectedBrief.linkedInContent) && (
                            <button 
                                onClick={() => {
                                    let text = '';
                                    if (selectedBrief.contentType === 'Article') text = selectedBrief.htmlContent || '';
                                    else if (selectedBrief.contentType === 'Thread') text = selectedBrief.xThreadContent?.join('\n\n---\n\n') || '';
                                    else text = selectedBrief.linkedInContent || '';
                                    copyToClipboard(text);
                                }}
                                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                            >
                                <Copy size={14} /> Copy Content
                            </button>
                         )}
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 relative">
                        {/* Loading Overlay */}
                        {isGenerating && (
                            <div className="absolute inset-0 z-20 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center text-slate-500">
                                <Loader2 size={40} className="animate-spin text-blue-500 mb-4" />
                                <p className="animate-pulse font-medium">AI is working its magic...</p>
                            </div>
                        )}

                        {/* Empty State */}
                        {!isGenerating && !selectedBrief.htmlContent && !selectedBrief.xThreadContent && !selectedBrief.linkedInContent && (
                             <div className="flex flex-col items-center justify-center h-full text-slate-400 opacity-60">
                                 <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mb-6">
                                     {selectedBrief.contentType === 'Article' ? <FileText size={40} /> : 
                                      selectedBrief.contentType === 'Thread' ? <MessageCircle size={40} /> : <Linkedin size={40} />}
                                 </div>
                                 <p className="text-lg font-medium text-slate-600">No Content Generated Yet</p>
                                 <p className="text-sm">Click the button on the left to start.</p>
                             </div>
                        )}

                        {/* Article Output */}
                        {!isGenerating && selectedBrief.contentType === 'Article' && selectedBrief.htmlContent && (
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {selectedBrief.imageUrl && (
                                    <div className="w-full h-64 md:h-80 relative group">
                                        <img src={selectedBrief.imageUrl} alt={selectedBrief.title} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                                    </div>
                                )}
                                <div className="p-8 md:p-10">
                                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8 leading-tight">{selectedBrief.title}</h1>
                                    <div className="prose prose-slate prose-lg max-w-none prose-headings:font-bold prose-headings:text-slate-900 prose-a:text-blue-600 prose-img:rounded-xl">
                                        <div dangerouslySetInnerHTML={{ __html: selectedBrief.htmlContent }} />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Thread Output */}
                        {!isGenerating && selectedBrief.contentType === 'Thread' && selectedBrief.xThreadContent && (
                            <div className="max-w-[500px] mx-auto space-y-0 relative before:absolute before:left-[27px] before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-200 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {selectedBrief.xThreadContent.map((tweet, i) => (
                                    <div key={i} className="flex gap-4 relative pb-6 last:pb-0">
                                        <div className="flex flex-col items-center shrink-0">
                                            <div className="w-14 h-14 rounded-full bg-slate-100 border-4 border-slate-50 z-10 overflow-hidden flex items-center justify-center font-bold text-slate-500 text-lg shadow-sm">
                                                {domain.charAt(0).toUpperCase()}
                                            </div>
                                        </div>
                                        <div className="flex-1 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="font-bold text-slate-900">{domain}</span>
                                                    <span className="text-slate-400 text-sm">@brand</span>
                                                    <span className="text-slate-300 mx-1">·</span>
                                                    <span className="text-slate-400 text-sm">{i + 1}/{selectedBrief.xThreadContent?.length}</span>
                                                </div>
                                            </div>
                                            <p className="text-slate-900 whitespace-pre-wrap text-[16px] leading-relaxed mb-4">
                                                {tweet}
                                            </p>
                                            
                                            {/* Show Image only on first tweet */}
                                            {i === 0 && selectedBrief.xThreadImageUrl && (
                                                <div className="rounded-xl overflow-hidden border border-slate-100 mb-4 shadow-sm">
                                                    <img src={selectedBrief.xThreadImageUrl} alt="Thread Visual" className="w-full h-auto" />
                                                </div>
                                            )}

                                            <div className="flex justify-between items-center text-slate-400 pt-2 border-t border-slate-50">
                                                <button className="flex items-center gap-1 hover:text-blue-500 transition-colors"><MessageCircle size={18} /><span className="text-xs">24</span></button>
                                                <button className="flex items-center gap-1 hover:text-green-500 transition-colors"><Repeat size={18} /><span className="text-xs">12</span></button>
                                                <button className="flex items-center gap-1 hover:text-red-500 transition-colors"><Heart size={18} /><span className="text-xs">148</span></button>
                                                <button className="flex items-center gap-1 hover:text-blue-500 transition-colors"><Share size={18} /></button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* LinkedIn Output */}
                        {!isGenerating && selectedBrief.contentType === 'LinkedIn' && selectedBrief.linkedInContent && (
                             <div className="max-w-[550px] mx-auto bg-white border border-slate-200 rounded-xl shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="p-4 border-b border-slate-100 flex gap-3">
                                     <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-500">
                                         {domain.charAt(0).toUpperCase()}
                                     </div>
                                     <div>
                                         <div className="font-bold text-slate-900 text-sm">{domain}</div>
                                         <div className="text-xs text-slate-500">12,482 followers</div>
                                         <div className="text-xs text-slate-500 flex items-center gap-1">1h • <GlobeIcon /></div>
                                     </div>
                                </div>
                                <div className="p-4">
                                     <div className="whitespace-pre-wrap text-sm text-slate-800 leading-relaxed mb-4">
                                        {selectedBrief.linkedInContent}
                                     </div>
                                     {selectedBrief.linkedInImageUrl && (
                                         <div className="rounded-lg overflow-hidden border border-slate-100 mb-2">
                                             <img src={selectedBrief.linkedInImageUrl} alt="Post Visual" className="w-full h-auto" />
                                         </div>
                                     )}
                                </div>
                                <div className="px-4 py-2 border-t border-slate-100 flex items-center gap-1 text-slate-500 text-xs">
                                    <ThumbsUpIcon size={14} className="text-blue-500" />
                                    <HeartIcon size={14} className="text-red-500" />
                                    <span className="hover:text-blue-600 hover:underline cursor-pointer ml-1">142 others</span>
                                    <span className="ml-auto hover:text-blue-600 hover:underline cursor-pointer">32 comments</span>
                                </div>
                                <div className="px-2 py-1 flex border-t border-slate-100">
                                    <button className="flex-1 py-3 hover:bg-slate-50 rounded flex items-center justify-center gap-2 text-slate-500 text-sm font-semibold transition-colors">
                                        <ThumbsUp size={18} /> Like
                                    </button>
                                    <button className="flex-1 py-3 hover:bg-slate-50 rounded flex items-center justify-center gap-2 text-slate-500 text-sm font-semibold transition-colors">
                                        <MessageSquare size={18} /> Comment
                                    </button>
                                    <button className="flex-1 py-3 hover:bg-slate-50 rounded flex items-center justify-center gap-2 text-slate-500 text-sm font-semibold transition-colors">
                                        <Repeat size={18} /> Repost
                                    </button>
                                    <button className="flex-1 py-3 hover:bg-slate-50 rounded flex items-center justify-center gap-2 text-slate-500 text-sm font-semibold transition-colors">
                                        <Share size={18} /> Send
                                    </button>
                                </div>
                             </div>
                        )}
                    </div>
                </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const GlobeIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 4.19C10.74 4.12 11.55 4.07 12.44 4.04C12.33 5.34 12.16 7.23 12 9H9.9C9.76 7.42 9.47 5.76 10 4.19ZM4.26 14C4.1 13.36 4 12.69 4 12C4 11.31 4.1 10.64 4.26 10H7.64C7.56 11.31 7.56 12.69 7.64 14H4.26ZM5.03 16H8.05C8.36 17.76 8.9 19.34 9.61 20.6C7.55 19.92 5.91 18.23 5.03 16ZM8.05 8H5.03C5.91 5.77 7.55 4.08 9.61 3.4C8.9 4.66 8.36 6.24 8.05 8ZM12 19.96C11.11 19.93 10.3 19.88 9.56 19.81C10.09 18.24 10.38 16.58 10.52 15H13.48C13.62 16.58 13.91 18.24 14.44 19.81C13.7 19.88 12.89 19.93 12 19.96ZM12.52 9C12.36 7.23 12.19 5.34 12.08 4.04C12.97 4.07 13.78 4.12 14.52 4.19C15.05 5.76 15.34 7.42 15.48 9H12.52ZM16.36 14H19.74C19.9 13.36 20 12.69 20 12C20 11.31 19.9 10.64 19.74 10H16.36C16.44 11.31 16.44 12.69 16.36 14ZM14.39 20.6C15.1 19.34 15.64 17.76 15.95 16H18.97C18.09 18.23 16.45 19.92 14.39 20.6ZM15.95 8C15.64 6.24 15.1 4.66 14.39 3.4C16.45 4.08 18.09 5.77 18.97 8H15.95Z"/>
    </svg>
);

const ThumbsUpIcon = ({className, size}: {className?: string, size: number}) => (
    <div className={`rounded-full bg-blue-100 p-0.5 ${className}`}>
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-1.91l-.01-.01L23 10z"/></svg>
    </div>
)

const HeartIcon = ({className, size}: {className?: string, size: number}) => (
    <div className={`rounded-full bg-red-100 p-0.5 ${className}`}>
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
    </div>
)
