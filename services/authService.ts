import { signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, googleProvider } from './firebaseConfig';
import { User } from '../types';
import { dbService } from './dbService';

export const authService = {
  // Sign in with Google
  signInWithGoogle: async (): Promise<User> => {
    const result = await signInWithPopup(auth, googleProvider);
    const firebaseUser = result.user;
    
    // Create or get user in our DB
    const user = await dbService.loginWithGoogle({
      uid: firebaseUser.uid,
      email: firebaseUser.email || '',
      displayName: firebaseUser.displayName || '',
      photoURL: firebaseUser.photoURL || '',
    });
    
    return user;
  },

  // Sign out
  signOut: async (): Promise<void> => {
    await signOut(auth);
    await dbService.logout();
  },

  // Listen to auth state changes
  onAuthStateChanged: (callback: (user: User | null) => void): (() => void) => {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Get user from our DB
        const user = await dbService.getCurrentUser();
        callback(user);
      } else {
        callback(null);
      }
    });
  },

  // Get current Firebase user
  getCurrentFirebaseUser: (): FirebaseUser | null => {
    return auth.currentUser;
  },
};
