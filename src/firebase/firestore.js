import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from "firebase/firestore";
import { db } from "./config";

// Add polish to user's collection
export const addPolishToCollection = async (userId, polish) => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      polishCollection: arrayUnion({
        ...polish,
        id: Date.now().toString(),
        addedAt: new Date().toISOString()
      })
    });
  } catch (error) {
    throw new Error(error.message);
  }
};

// Remove polish from user's collection
export const removePolishFromCollection = async (userId, polishId) => {
  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const updatedCollection = userData.polishCollection.filter(polish => polish.id !== polishId);
      
      await updateDoc(userRef, {
        polishCollection: updatedCollection
      });
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

// Add topper to user's collection
export const addTopperToCollection = async (userId, topper) => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      topperCollection: arrayUnion({
        ...topper,
        id: Date.now().toString(),
        addedAt: new Date().toISOString()
      })
    });
  } catch (error) {
    throw new Error(error.message);
  }
};

// Remove topper from user's collection
export const removeTopperFromCollection = async (userId, topperId) => {
  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const updatedCollection = userData.topperCollection.filter(topper => topper.id !== topperId);
      
      await updateDoc(userRef, {
        topperCollection: updatedCollection
      });
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

// Add combination to recent combinations
export const addRecentCombination = async (userId, combination) => {
  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      let recentCombinations = userData.recentCombinations || [];
      
      // Add new combination to the beginning
      recentCombinations.unshift({
        ...combination,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      });
      
      // Keep only the last 10 combinations
      if (recentCombinations.length > 10) {
        recentCombinations = recentCombinations.slice(0, 10);
      }
      
      await updateDoc(userRef, {
        recentCombinations: recentCombinations
      });
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

// Remove combination from recent combinations
export const removeRecentCombination = async (userId, combinationId) => {
  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const updatedCombinations = userData.recentCombinations.filter(combo => combo.id !== combinationId);
      
      await updateDoc(userRef, {
        recentCombinations: updatedCombinations
      });
    }
  } catch (error) {
    throw new Error(error.message);
  }
};

// Update user settings
export const updateUserSettings = async (userId, settings) => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      settings: settings,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    throw new Error(error.message);
  }
};

// Get user's complete data
export const getUserCompleteData = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, "users", userId));
    if (userDoc.exists()) {
      return userDoc.data();
    } else {
      throw new Error("User data not found");
    }
  } catch (error) {
    throw new Error(error.message);
  }
};
