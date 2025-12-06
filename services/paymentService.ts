import { loadStripe } from '@stripe/stripe-js';
import { PlanTier } from '../types';

const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51RqkxSCo0Yjlt4DWsjHdK0LupiKBz5yW3ls1vd3unNYRjOb8izJcS5Y6lkryiD70p7JeZSTW5jbMPH6pZNw3GzbS00bD3gipMH';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const stripePromise = loadStripe(STRIPE_PUBLIC_KEY);

export const initiateCheckout = async (
  userId: string, 
  userEmail: string,
  planTier: PlanTier
): Promise<{ success: boolean; sessionId?: string }> => {
  try {
    const response = await fetch(`${API_URL}/api/create-checkout-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, userEmail, planTier }),
    });

    const data = await response.json();
    
    if (data.url) {
      // Redirect to Stripe Checkout
      window.location.href = data.url;
      return { success: true, sessionId: data.sessionId };
    }
    
    return { success: false };
  } catch (error) {
    console.error('Checkout error:', error);
    return { success: false };
  }
};

export const verifyPaymentSession = async (sessionId: string): Promise<{
  success: boolean;
  planTier?: PlanTier;
  customerId?: string;
  subscriptionId?: string;
  status?: string;
  currentPeriodEnd?: string;
}> => {
  try {
    const response = await fetch(`${API_URL}/api/verify-session/${sessionId}`);
    return await response.json();
  } catch (error) {
    console.error('Verification error:', error);
    return { success: false };
  }
};

export const manageBilling = async (customerId: string): Promise<void> => {
  try {
    const response = await fetch(`${API_URL}/api/create-portal-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerId }),
    });

    const data = await response.json();
    if (data.url) {
      window.location.href = data.url;
    }
  } catch (error) {
    console.error('Portal error:', error);
    alert('Unable to open billing portal. Please try again.');
  }
};

export const cancelSubscription = async (subscriptionId: string): Promise<{ success: boolean; cancelAtPeriodEnd?: boolean }> => {
  try {
    const response = await fetch(`${API_URL}/api/cancel-subscription`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscriptionId }),
    });
    return await response.json();
  } catch (error) {
    console.error('Cancel error:', error);
    return { success: false };
  }
};

export const reactivateSubscription = async (subscriptionId: string): Promise<{ success: boolean }> => {
  try {
    const response = await fetch(`${API_URL}/api/reactivate-subscription`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscriptionId }),
    });
    return await response.json();
  } catch (error) {
    console.error('Reactivate error:', error);
    return { success: false };
  }
};

export const getSubscriptionDetails = async (subscriptionId: string): Promise<{
  status: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
} | null> => {
  try {
    const response = await fetch(`${API_URL}/api/subscription/${subscriptionId}`);
    const data = await response.json();
    return data.success ? data : null;
  } catch (error) {
    console.error('Subscription details error:', error);
    return null;
  }
};
