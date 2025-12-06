export interface KeywordData {
  term: string;
  volume: number;
  difficulty: number; // 0-100
  intent: 'Informational' | 'Transactional' | 'Commercial' | 'Navigational';
  cpc: number;
}

export interface KeywordCluster {
  topic: string;
  keywords: string[]; // List of terms in this cluster
  competitorGap: string; // Analysis of what Page 1/2 results are missing
  opportunityScore: number; // 1-10 score based on gap severity
}

export interface OnPageAudit {
  healthScore: number;
  detectedTitle: string;
  businessSummary: string; // New field for the inferred business context
  metaDescriptionStatus: 'Optimized' | 'Missing' | 'Too Long' | 'Too Short';
  loadSpeedEstimate: 'Fast' | 'Moderate' | 'Slow';
  contentGaps: string[];
  technicalIssues: string[];
}

export interface AnalysisResult {
  keywords: KeywordData[];
  clusters: KeywordCluster[];
  audit: OnPageAudit;
}

export interface ContentBrief {
  contentType: 'Article' | 'Thread' | 'LinkedIn'; // Added LinkedIn
  title: string;
  targetKeyword: string;
  clusterTopic: string;
  
  // Brief Specifics
  contentGapAddressed: string;
  primaryAudience: string;
  overview: string;
  structure: string[]; // List of H2/H3 headers
  keyPoints: string[];
  competitiveAdvantage: string; // Why this will rank better
  searchIntentMatch: string;
  
  scheduledDate: string;
  
  // Generation Results
  htmlContent?: string; 
  imageUrl?: string; 
  
  // X Thread Results
  xThreadContent?: string[];
  xThreadImageUrl?: string;

  // LinkedIn Results
  linkedInContent?: string;
  linkedInImageUrl?: string;
}

export interface StrategyResult {
  briefs: ContentBrief[];
}

export enum AppState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  ANALYSIS_COMPLETE = 'ANALYSIS_COMPLETE',
  GENERATING_STRATEGY = 'GENERATING_STRATEGY',
  STRATEGY_COMPLETE = 'STRATEGY_COMPLETE',
}

export type PlanTier = 'Free' | 'Pro' | 'Business';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  plan: PlanTier;
  creditsUsed: number;
  maxCredits: number;
  joinedAt: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  subscriptionStatus?: 'active' | 'canceled' | 'past_due' | 'trialing';
  currentPeriodEnd?: string; // Renewal date
  cancelAtPeriodEnd?: boolean;
}


export interface SavedProject {
  id: string;
  userId: string;
  domain: string;
  niche: string;
  createdAt: string;
  updatedAt: string;
  analysis: AnalysisResult;
  strategy?: StrategyResult;
}
