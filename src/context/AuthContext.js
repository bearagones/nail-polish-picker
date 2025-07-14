import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { onAuthStateChange, signOutUser, getUserData } from '../firebase/auth';

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };
    case 'RESTORE_SESSION':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false
      };
    default:
      return state;
  }
};

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get additional user data from Firestore
          const userData = await getUserData(firebaseUser.uid);
          const user = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || userData.displayName,
            ...userData
          };
          dispatch({ type: 'RESTORE_SESSION', payload: user });
        } catch (error) {
          console.error('Error fetching user data:', error);
          // If we can't get Firestore data, use basic Firebase user info
          const user = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            polishCollection: [],
            topperCollection: [],
            finisherCollection: [],
            recentCombinations: []
          };
          dispatch({ type: 'RESTORE_SESSION', payload: user });
        }
      } else {
        dispatch({ type: 'RESTORE_SESSION', payload: null });
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const login = (userData) => {
    dispatch({ type: 'LOGIN', payload: userData });
  };

  const logout = async () => {
    try {
      await signOutUser();
      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      console.error('Error signing out:', error);
      // Force logout even if Firebase signout fails
      dispatch({ type: 'LOGOUT' });
    }
  };

  const updateUser = (updatedUserData) => {
    const newUserData = { ...state.user, ...updatedUserData };
    dispatch({ type: 'LOGIN', payload: newUserData });
  };

  const value = {
    ...state,
    login,
    logout,
    updateUser,
    dispatch
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
