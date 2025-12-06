import React, { useState } from 'react';
import { X, CreditCard, Calendar, FolderOpen, BarChart3, AlertTriangle, CheckCircle, Loader2, Crown, RefreshCw } from 'lucide-react';
import { User, SavedProject } from '../types';

interface BillingDashboardProps {
  user: User;
  projects: SavedProject[];
  onClose: () => void;
  onManageBilling: () => Promise<void>;
  onCancelSubscription: () => Promise<void>;
  onReactivateSubscription: () => Promise<void>;
}

export const BillingDashboard: React.FC<BillingDashboardProps> = ({
  user,
  projects,
  onClose,
  onManageBilling,
  onCancelSubscription,
  onReactivateSubscription,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [actionType, setActionType] = useState<string | null>(null);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getUsagePercentage = () => {
    return Math.round((user.creditsUsed / user.maxCredits) * 100);
  };

  const getPlanPrice = () => {
    switch (user.plan) {
      case 'Pro': return '$29';
      case 'Business': return '$99';
      default: return '$0';
    }
  };

  const getGeneratedContentCount = () => {
    return projects.reduce((acc, p) => {
      if (!p.strategy) return acc;
      return acc + p.strategy.briefs.filter(b => 
        b.htmlContent || b.xThreadContent || b.linkedInContent
      ).length;
    }, 0);
  };

  const handleAction = async (action: () => Promise<void>, type: string) => {
    setIsLoading(true);
    setActionType(type);
    try {
      await action();
    } finally {
      setIsLoading(false);
      setActionType(null);
    }
  };

  const isSubscribed = user.plan !== 'Free';
  const isCanceling = user.cancelAtPeriodEnd;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-blue-600 to-indigo-600">
          <div className="text-white">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <CreditCard size={24} />
              Billing Dashboard
            </h2>
            <p className="text-blue-100 text-sm mt-1">Manage your subscription and usage</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Current Plan Card */}
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500 font-medium">Current Plan</p>
                <div className="flex items-center gap-2 mt-1">
                  <h3 className="text-2xl font-bold text-slate-900">{user.plan}</h3>
                  {isSubscribed && <Crown size={20} className="text-yellow-500" />}
                </div>
                <p className="text-slate-600 mt-1">
                  {getPlanPrice()}<span className="text-slate-400">/month</span>
                </p>
              </div>
              
              {isSubscribed && (
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                  isCanceling 
                    ? 'bg-orange-100 text-orange-700' 
                    : user.subscriptionStatus === 'active'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                }`}>
                  {isCanceling ? 'Canceling' : user.subscriptionStatus || 'Active'}
                </div>
              )}
            </div>

            {isCanceling && (
              <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg flex items-start gap-2">
                <AlertTriangle size={18} className="text-orange-500 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-orange-800">Subscription ending</p>
                  <p className="text-orange-600">Your plan will downgrade to Free on {formatDate(user.currentPeriodEnd)}</p>
                </div>
              </div>
            )}
          </div>


          {/* Usage Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Credits Used */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 text-slate-500 mb-2">
                <BarChart3 size={16} />
                <span className="text-xs font-medium uppercase tracking-wide">Monthly Usage</span>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-2xl font-bold text-slate-900">{user.creditsUsed}</span>
                  <span className="text-slate-400 text-sm">/{user.maxCredits}</span>
                </div>
                <span className={`text-xs font-bold ${
                  getUsagePercentage() > 80 ? 'text-red-500' : 'text-green-500'
                }`}>
                  {getUsagePercentage()}%
                </span>
              </div>
              <div className="mt-2 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all ${
                    getUsagePercentage() > 80 ? 'bg-red-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${Math.min(getUsagePercentage(), 100)}%` }}
                />
              </div>
            </div>

            {/* Projects */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 text-slate-500 mb-2">
                <FolderOpen size={16} />
                <span className="text-xs font-medium uppercase tracking-wide">Saved Projects</span>
              </div>
              <span className="text-2xl font-bold text-slate-900">{projects.length}</span>
              <p className="text-xs text-slate-400 mt-1">
                {getGeneratedContentCount()} pieces generated
              </p>
            </div>

            {/* Renewal Date */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 text-slate-500 mb-2">
                <Calendar size={16} />
                <span className="text-xs font-medium uppercase tracking-wide">
                  {isCanceling ? 'Ends On' : 'Renews On'}
                </span>
              </div>
              <span className="text-lg font-bold text-slate-900">
                {isSubscribed ? formatDate(user.currentPeriodEnd) : 'N/A'}
              </span>
              {isSubscribed && !isCanceling && (
                <p className="text-xs text-slate-400 mt-1">Auto-renewal enabled</p>
              )}
            </div>
          </div>

          {/* Member Since */}
          <div className="flex items-center justify-between py-3 border-t border-slate-100">
            <span className="text-sm text-slate-500">Member since</span>
            <span className="text-sm font-medium text-slate-700">{formatDate(user.joinedAt)}</span>
          </div>


          {/* Actions */}
          {isSubscribed && (
            <div className="space-y-3 pt-4 border-t border-slate-200">
              <h4 className="text-sm font-semibold text-slate-700">Subscription Actions</h4>
              
              <div className="flex flex-wrap gap-3">
                {/* Manage Billing (Stripe Portal) */}
                <button
                  onClick={() => handleAction(onManageBilling, 'billing')}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                >
                  {isLoading && actionType === 'billing' ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <CreditCard size={16} />
                  )}
                  Update Payment Method
                </button>

                {/* Cancel or Reactivate */}
                {isCanceling ? (
                  <button
                    onClick={() => handleAction(onReactivateSubscription, 'reactivate')}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isLoading && actionType === 'reactivate' ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <RefreshCw size={16} />
                    )}
                    Reactivate Subscription
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to cancel? You will retain access until the end of your billing period.')) {
                        handleAction(onCancelSubscription, 'cancel');
                      }
                    }}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-red-50 text-red-600 border border-red-200 text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isLoading && actionType === 'cancel' ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <X size={16} />
                    )}
                    Cancel Subscription
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Free Plan Upgrade CTA */}
          {!isSubscribed && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle size={20} className="text-blue-600" />
                <h4 className="font-semibold text-slate-900">Upgrade for more features</h4>
              </div>
              <p className="text-sm text-slate-600 mb-4">
                Get more searches, advanced analysis, and priority support with a paid plan.
              </p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                View Plans
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
