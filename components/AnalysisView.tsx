import React from 'react';
import { AnalysisResult } from '../types';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList, Cell } from 'recharts';
import { ArrowRight, CheckCircle2, AlertCircle, Activity, Globe, Gauge, AlertTriangle, SearchCheck, Layers, Unlock, Target } from 'lucide-react';

interface AnalysisViewProps {
  analysis: AnalysisResult;
  onGenerateStrategy: () => void;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border border-slate-200 shadow-lg rounded-lg text-sm">
        <p className="font-bold text-slate-800">{data.term}</p>
        <p className="text-slate-600">Vol: {data.volume.toLocaleString()}</p>
        <p className="text-slate-600">Diff: {data.difficulty}/100</p>
        <p className="text-slate-600">CPC: ${data.cpc}</p>
      </div>
    );
  }
  return null;
};

export const AnalysisView: React.FC<AnalysisViewProps> = ({ analysis, onGenerateStrategy }) => {
  const { keywords, audit, clusters } = analysis;
  
  // Identify the sweet spot: Volume > 100, Difficulty < 60
  const opportunities = keywords.filter(k => k.difficulty < 60 && k.volume > 100);

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Site Audit Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 md:col-span-2">
          <div className="flex items-center justify-between mb-6">
             <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
               <Activity className="text-blue-600" size={20} />
               Live Site Analysis
             </h3>
             <span className={`px-3 py-1 rounded-full text-sm font-bold 
               ${audit.healthScore > 80 ? 'bg-green-100 text-green-700' : audit.healthScore > 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
               Health Score: {audit.healthScore}/100
             </span>
          </div>
          
          <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
             <h4 className="text-xs font-bold text-blue-800 uppercase mb-2 flex items-center gap-1">
               <SearchCheck size={14} /> AI Context Inference
             </h4>
             <p className="text-sm text-slate-700 leading-relaxed">
               {audit.businessSummary}
             </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Detected Title Tag</p>
                <p className="text-sm font-medium text-slate-900 line-clamp-2" title={audit.detectedTitle}>
                  {audit.detectedTitle || "N/A"}
                </p>
              </div>
               <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Meta Status</p>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${audit.metaDescriptionStatus === 'Optimized' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  <p className="text-sm font-medium text-slate-900">{audit.metaDescriptionStatus}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <AlertTriangle size={14} /> Critical Issues
              </h4>
              <ul className="space-y-2">
                {audit.technicalIssues.map((issue, idx) => (
                  <li key={idx} className="text-xs flex items-start gap-2 text-slate-600">
                    <span className="text-red-500 mt-0.5">•</span>
                    {issue}
                  </li>
                ))}
              </ul>
              <div className="flex items-center gap-2 text-sm mt-4 pt-2 border-t border-slate-100">
                <Gauge size={16} className="text-slate-400" />
                <span className="text-slate-600">Est. Load Speed:</span>
                <span className="font-medium text-slate-900">{audit.loadSpeedEstimate}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-6 rounded-xl shadow-md flex flex-col">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Globe size={18} className="text-indigo-400"/> Content Gaps
          </h3>
          <p className="text-sm text-indigo-200 mb-4">
            Topics your competitors are covering that you are missing:
          </p>
          <ul className="space-y-3 mb-6 flex-grow">
            {audit.contentGaps.map((gap, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm">
                <CheckCircle2 size={16} className="text-green-400 shrink-0 mt-0.5" />
                <span>{gap}</span>
              </li>
            ))}
          </ul>
           <button 
            onClick={onGenerateStrategy}
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center transition-all group shadow-lg shadow-indigo-900/50"
          >
            Create Strategy
            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* NEW SECTION: Keyword Clusters & Competitor Gaps */}
      {clusters && clusters.length > 0 && (
          <div>
              <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Layers className="text-blue-600" />
                  Keyword Clusters & SERP Analysis
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {clusters.map((cluster, idx) => (
                      <div key={idx} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                          <div className="bg-slate-50 px-5 py-4 border-b border-slate-100 flex justify-between items-center">
                              <h4 className="font-bold text-slate-800">{cluster.topic}</h4>
                              <div className="flex items-center gap-1 bg-white px-2 py-1 rounded border border-slate-200 text-xs font-semibold text-slate-600">
                                  <Target size={12} className="text-blue-500" />
                                  Score: {cluster.opportunityScore}/10
                              </div>
                          </div>
                          
                          <div className="p-5 flex-1 flex flex-col gap-4">
                              {/* Competitor Gap Highlight */}
                              <div className="bg-red-50 border border-red-100 rounded-lg p-3">
                                  <div className="flex items-center gap-2 text-red-800 font-bold text-xs uppercase mb-1">
                                      <Unlock size={12} /> Competitor Weakness
                                  </div>
                                  <p className="text-sm text-slate-700 leading-snug">
                                      {cluster.competitorGap}
                                  </p>
                              </div>

                              <div className="flex-1">
                                  <p className="text-xs font-semibold text-slate-400 uppercase mb-2">Cluster Keywords</p>
                                  <div className="flex flex-wrap gap-2">
                                      {cluster.keywords.slice(0, 5).map((k, kIdx) => (
                                          <span key={kIdx} className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded">
                                              {k}
                                          </span>
                                      ))}
                                      {cluster.keywords.length > 5 && (
                                          <span className="text-xs text-slate-400 flex items-center">+{cluster.keywords.length - 5} more</span>
                                      )}
                                  </div>
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Keyword Opportunities</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  type="number" 
                  dataKey="difficulty" 
                  name="Difficulty" 
                  domain={[0, 100]} 
                  label={{ value: 'Difficulty (0-100)', position: 'insideBottom', offset: -10 }} 
                />
                <YAxis 
                  type="number" 
                  dataKey="volume" 
                  name="Volume" 
                  label={{ value: 'Search Volume', angle: -90, position: 'insideLeft' }} 
                />
                <Tooltip content={<CustomTooltip />} />
                <Scatter name="Keywords" data={keywords} fill="#3b82f6">
                  {keywords.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={entry.difficulty < 40 ? '#22c55e' : entry.difficulty > 70 ? '#ef4444' : '#eab308'} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-center">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Keyword Stats</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Total Keywords</span>
                <span className="font-mono text-xl font-semibold text-slate-900">{keywords.length}</span>
              </div>
              <div className="w-full bg-slate-100 h-px"></div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Sweet Spot</span>
                <span className="font-mono text-xl font-semibold text-green-600">{opportunities.length}</span>
              </div>
              <div className="w-full bg-slate-100 h-px"></div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Avg. Difficulty</span>
                <span className="font-mono text-xl font-semibold text-slate-900">
                  {Math.round(keywords.reduce((acc, k) => acc + k.difficulty, 0) / keywords.length)}
                </span>
              </div>
            </div>
        </div>
      </div>

      {/* Keyword Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <h3 className="font-semibold text-slate-800">Non-Branded Long-Tail Opportunities</h3>
          <span className="text-xs font-medium bg-blue-100 text-blue-700 px-2 py-1 rounded-full">AI Estimated Data</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3">Keyword</th>
                <th className="px-6 py-3">Intent</th>
                <th className="px-6 py-3 text-right">Volume</th>
                <th className="px-6 py-3 text-right">Difficulty</th>
                <th className="px-6 py-3 text-right">CPC</th>
              </tr>
            </thead>
            <tbody>
              {keywords.map((k, i) => (
                <tr key={i} className="bg-white border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{k.term}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium 
                      ${k.intent === 'Transactional' ? 'bg-green-100 text-green-700' : 
                        k.intent === 'Commercial' ? 'bg-purple-100 text-purple-700' :
                        'bg-blue-100 text-blue-700'}`}>
                      {k.intent}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-slate-600">{k.volume.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className={`font-mono ${k.difficulty > 70 ? 'text-red-600' : k.difficulty < 40 ? 'text-green-600' : 'text-yellow-600'}`}>
                        {k.difficulty}
                      </span>
                      <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${k.difficulty > 70 ? 'bg-red-500' : k.difficulty < 40 ? 'bg-green-500' : 'bg-yellow-500'}`} 
                          style={{ width: `${k.difficulty}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right text-slate-600">${k.cpc.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};