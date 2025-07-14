import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "./config";

// Sign up with email and password
export const signUpWithEmail = async (email, password, displayName) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update the user's display name
    await updateProfile(user, {
      displayName: displayName
    });
    
    // Create user document in Firestore
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: user.email,
      displayName: displayName,
      createdAt: new Date().toISOString(),
      polishCollection: [],
      topperCollection: [],
      finisherCollection: [],
      recentCombinations: []
    });
    
    return {
      uid: user.uid,
      email: user.email,
      displayName: displayName
    };
  } catch (error) {
    // Preserve the original Firebase error with code and message
    throw error;
  }
};

// Sign in with email and password
export const signInWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName
    };
  } catch (error) {
    // Preserve the original Firebase error with code and message
    throw error;
  }
};

// Sign out
export const signOutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    throw new Error(error.message);
  }
};

// Get current user data from Firestore
export const getUserData = async (uid) => {
  try {
    const userRef = doc(db, "users", uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      
      // Check if existing document is missing any required fields and add them
      const updates = {};
      
      if (!userData.hasOwnProperty('finisherCollection')) {
        updates.finisherCollection = [];
      }
      if (!userData.hasOwnProperty('polishCollection')) {
        updates.polishCollection = [];
      }
      if (!userData.hasOwnProperty('topperCollection')) {
        updates.topperCollection = [];
      }
      if (!userData.hasOwnProperty('recentCombinations')) {
        updates.recentCombinations = [];
      }
      
      // Only update if there are missing fields
      if (Object.keys(updates).length > 0) {
        updates.updatedAt = new Date().toISOString();
        await updateDoc(userRef, updates);
        
        // Return the updated user data
        return { ...userData, ...updates };
      }
      
      return userData;
    } else {
      throw new Error("User data not found");
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

// Send password reset email
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true };
  } catch (error) {
    // Preserve the original Firebase error with code and message
    throw error;
  }
};

// Listen to auth state changes
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};
