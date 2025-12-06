import express from 'express';
import cors from 'cors';
import Stripe from 'stripe';

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Stripe with secret key
const stripe = require("stripe")(process.env.STRIPE_SECRET);
app.use(cors());
app.use(express.json());

// Price IDs - You'll need to create these in your Stripe Dashboard
// For now using price amounts directly
const PRICE_CONFIG = {
  Pro: { amount: 2900, name: 'Pro Plan' },      // $29/month
  Business: { amount: 9900, name: 'Business Plan' } // $99/month
};

// Create Checkout Session
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { userId, userEmail, planTier } = req.body;

    if (!PRICE_CONFIG[planTier]) {
      return res.status(400).json({ error: 'Invalid plan tier' });
    }

    const priceConfig = PRICE_CONFIG[planTier];

    // Create or retrieve Stripe customer
    let customer;
    const existingCustomers = await stripe.customers.list({ email: userEmail, limit: 1 });
    
    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
    } else {
      customer = await stripe.customers.create({
        email: userEmail,
        metadata: { userId }
      });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: priceConfig.name },
          unit_amount: priceConfig.amount,
          recurring: { interval: 'month' }
        },
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: `${req.headers.origin}?payment_success=true&plan=${planTier}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}?payment_cancelled=true`,
      metadata: { userId, planTier }
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ error: error.message });
  }
});


// Verify session and get plan info
app.get('/api/verify-session/:sessionId', async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);
    
    if (session.payment_status === 'paid') {
      // Get subscription details
      let subscriptionData = {};
      if (session.subscription) {
        const subscription = await stripe.subscriptions.retrieve(session.subscription);
        subscriptionData = {
          subscriptionId: subscription.id,
          status: subscription.status,
          currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
        };
      }
      
      res.json({
        success: true,
        planTier: session.metadata.planTier,
        customerId: session.customer,
        ...subscriptionData,
      });
    } else {
      res.json({ success: false });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create Customer Portal session for billing management
app.post('/api/create-portal-session', async (req, res) => {
  try {
    const { customerId } = req.body;
    
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: req.headers.origin,
    });

    res.json({ url: session.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get subscription details
app.get('/api/subscription/:subscriptionId', async (req, res) => {
  try {
    const subscription = await stripe.subscriptions.retrieve(req.params.subscriptionId);
    
    res.json({
      success: true,
      status: subscription.status,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Cancel subscription (at period end)
app.post('/api/cancel-subscription', async (req, res) => {
  try {
    const { subscriptionId } = req.body;
    
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });

    res.json({
      success: true,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Reactivate subscription (remove cancel at period end)
app.post('/api/reactivate-subscription', async (req, res) => {
  try {
    const { subscriptionId } = req.body;
    
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    });

    res.json({
      success: true,
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Webhook for Stripe events (subscription updates, cancellations)
app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  try {
    const event = endpointSecret 
      ? stripe.webhooks.constructEvent(req.body, sig, endpointSecret)
      : JSON.parse(req.body);

    switch (event.type) {
      case 'checkout.session.completed':
        console.log('Payment successful:', event.data.object);
        break;
      case 'customer.subscription.deleted':
        console.log('Subscription cancelled:', event.data.object);
        break;
    }

    res.json({ received: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
