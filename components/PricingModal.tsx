import React, { useState } from 'react';
import { Check, X, ShieldCheck, Loader2, CreditCard } from 'lucide-react';
import { PlanTier, User } from '../types';
import { initiateCheckout } from '../services/paymentService';

interface PricingModalProps {
  user: User | null;
  onClose: () => void;
  onLoginRequest: () => void;
  onUpgradeSuccess: (user: User) => void;
}

export const PricingModal: React.FC<PricingModalProps> = ({ user, onClose, onLoginRequest, onUpgradeSuccess }) => {
  const [processingTier, setProcessingTier] = useState<PlanTier | null>(null);

  const currentPlan = user?.plan || 'Free';

  const handleSubscribe = async (tier: PlanTier) => {
    if (!user) {
        onLoginRequest();
        return;
    }
    
    if (tier === 'Free') return;
    
    setProcessingTier(tier);
    try {
        // Redirect to Stripe Checkout - user will be redirected back after payment
        await initiateCheckout(user.id, user.email, tier);
        // Note: The page will redirect, so we don't need to handle success here
    } catch (error) {
        console.error("Payment failed", error);
        setProcessingTier(null);
    }
  };

  const plans: { tier: PlanTier; price: string; features: string[]; highlight?: boolean; color: string }[] = [
    {
      tier: 'Free',
      price: '$0',
      features: [
        '3 Searches per month',
        'Basic Keyword Analysis',
        '6 Content Ideas Generated',
        'Standard Support'
      ],
      color: 'bg-slate-100'
    },
    {
      tier: 'Pro',
      price: '$29',
      features: [
        '50 Searches per month',
        'Advanced Competitor Gaps',
        '12 Content Ideas Generated',
        'SEO Audit Report',
        'Priority Support'
      ],
      highlight: true,
      color: 'bg-blue-600 text-white'
    },
    {
      tier: 'Business',
      price: '$99',
      features: [
        '500 Searches per month',
        'Everything in Pro',
        '30 Content Ideas Generated',
        'Multi-domain Management',
        'Dedicated Account Manager'
      ],
      color: 'bg-slate-900 text-white'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden animate-in zoom-in-95 duration-200 relative">
        <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors z-10"
        >
            <X size={24} />
        </button>

        <div className="text-center pt-10 pb-6 px-4">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Upgrade your Growth</h2>
            <p className="text-slate-500">Generate more content, analyze more keywords, and rank faster.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 md:p-10 bg-slate-50">
            {plans.map((plan) => (
                <div 
                    key={plan.tier}
                    className={`relative rounded-xl p-6 shadow-sm border border-slate-200 flex flex-col 
                        ${plan.tier === currentPlan ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
                        ${plan.tier === 'Pro' ? 'bg-white shadow-xl scale-105 z-10' : 'bg-white'}
                        ${processingTier && processingTier !== plan.tier ? 'opacity-50 blur-[1px]' : ''}
                    `}
                >
                    {plan.tier === 'Pro' && (
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                            Most Popular
                        </div>
                    )}
                    
                    <div className="mb-4">
                        <h3 className="text-lg font-bold text-slate-900">{plan.tier}</h3>
                        <div className="flex items-baseline gap-1 mt-2">
                            <span className="text-3xl font-extrabold text-slate-900">{plan.price}</span>
                            <span className="text-sm text-slate-500">/month</span>
                        </div>
                    </div>

                    <ul className="space-y-3 mb-8 flex-1">
                        {plan.features.map((feature, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                                <Check size={16} className="text-green-500 shrink-0 mt-0.5" />
                                {feature}
                            </li>
                        ))}
                    </ul>

                    <button
                        onClick={() => handleSubscribe(plan.tier)}
                        disabled={currentPlan === plan.tier || processingTier !== null}
                        className={`w-full py-3 px-4 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2
                            ${currentPlan === plan.tier 
                                ? 'bg-slate-100 text-slate-400 cursor-default' 
                                : plan.tier === 'Pro' 
                                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20' 
                                    : 'bg-slate-900 hover:bg-slate-800 text-white'}
                        `}
                    >
                        {processingTier === plan.tier ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                Processing...
                            </>
                        ) : currentPlan === plan.tier ? (
                            'Current Plan'
                        ) : plan.tier === 'Free' ? (
                            'Downgrade'
                        ) : (
                            'Subscribe'
                        )}
                    </button>
                </div>
            ))}
        </div>
        
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-center items-center gap-4 text-xs text-slate-500">
             <div className="flex items-center gap-1">
                 <ShieldCheck size={14} className="text-slate-400" />
                 Secure payment by Stripe
             </div>
             <span>•</span>
             <div className="flex items-center gap-1">
                 <CreditCard size={14} className="text-slate-400" />
                 Cancel anytime
             </div>
        </div>
      </div>
    </div>
  );
};
