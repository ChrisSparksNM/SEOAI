import { User, PlanTier } from '../types';

const DB_KEY = 'rankforge_users_db';
const CURRENT_USER_ID_KEY = 'rankforge_current_user_id';

interface DbSchema {
  users: User[];
}

interface GoogleUserData {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
}

const getDb = (): DbSchema => {
  const data = localStorage.getItem(DB_KEY);
  return data ? JSON.parse(data) : { users: [] };
};

const saveDb = (db: DbSchema) => {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
};

export const dbService = {
  loginWithGoogle: async (googleUser: GoogleUserData): Promise<User> => {
    const db = getDb();
    let user = db.users.find(u => u.id === googleUser.uid);

    if (!user) {
      user = {
        id: googleUser.uid,
        name: googleUser.displayName || googleUser.email.split('@')[0],
        email: googleUser.email,
        avatarUrl: googleUser.photoURL || `https://ui-avatars.com/api/?name=${googleUser.email}&background=0D8ABC&color=fff`,
        plan: 'Free',
        creditsUsed: 0,
        maxCredits: 3,
        joinedAt: new Date().toISOString(),
        stripeCustomerId: undefined,
      };
      db.users.push(user);
      saveDb(db);
    }

    localStorage.setItem(CURRENT_USER_ID_KEY, user.id);
    return user;
  },

  login: async (email: string): Promise<User> => {
    await new Promise(r => setTimeout(r, 800));
    const db = getDb();
    let user = db.users.find(u => u.email === email);

    if (!user) {
      user = {
        id: crypto.randomUUID(),
        name: email.split('@')[0],
        email: email,
        avatarUrl: `https://ui-avatars.com/api/?name=${email}&background=0D8ABC&color=fff`,
        plan: 'Free',
        creditsUsed: 0,
        maxCredits: 3,
        joinedAt: new Date().toISOString()
      };
      db.users.push(user);
      saveDb(db);
    }

    localStorage.setItem(CURRENT_USER_ID_KEY, user.id);
    return user;
  },

  getCurrentUser: async (): Promise<User | null> => {
    const id = localStorage.getItem(CURRENT_USER_ID_KEY);
    if (!id) return null;
    const db = getDb();
    return db.users.find(u => u.id === id) || null;
  },

  logout: async () => {
    localStorage.removeItem(CURRENT_USER_ID_KEY);
  },

  updatePlan: async (userId: string, tier: PlanTier): Promise<User> => {
    const db = getDb();
    const userIndex = db.users.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error("User not found");

    const limits: Record<PlanTier, number> = { 'Free': 3, 'Pro': 50, 'Business': 500 };
    db.users[userIndex].plan = tier;
    db.users[userIndex].maxCredits = limits[tier];
    saveDb(db);
    return db.users[userIndex];
  },

  incrementUsage: async (userId: string): Promise<User> => {
    const db = getDb();
    const userIndex = db.users.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error("User not found");

    const user = db.users[userIndex];
    if (user.creditsUsed >= user.maxCredits) {
      throw new Error("Monthly limit reached. Please upgrade.");
    }
    user.creditsUsed += 1;
    saveDb(db);
    return user;
  },

  checkAvailability: async (userId: string): Promise<boolean> => {
    const db = getDb();
    const user = db.users.find(u => u.id === userId);
    if (!user) return false;
    return user.creditsUsed < user.maxCredits;
  },

  updateStripeCustomerId: async (userId: string, stripeCustomerId: string): Promise<User> => {
    const db = getDb();
    const userIndex = db.users.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error("User not found");
    db.users[userIndex].stripeCustomerId = stripeCustomerId;
    saveDb(db);
    return db.users[userIndex];
  },

  updateSubscription: async (
    userId: string, 
    subscriptionData: {
      stripeSubscriptionId?: string;
      subscriptionStatus?: 'active' | 'canceled' | 'past_due' | 'trialing';
      currentPeriodEnd?: string;
      cancelAtPeriodEnd?: boolean;
    }
  ): Promise<User> => {
    const db = getDb();
    const userIndex = db.users.findIndex(u => u.id === userId);
    if (userIndex === -1) throw new Error("User not found");
    
    db.users[userIndex] = { ...db.users[userIndex], ...subscriptionData };
    saveDb(db);
    return db.users[userIndex];
  },

  getUserById: async (userId: string): Promise<User | null> => {
    const db = getDb();
    return db.users.find(u => u.id === userId) || null;
  },
};
