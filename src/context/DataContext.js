import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useAuth } from './AuthContext';

const initialState = {
  nailPolishes: [],
  toppers: [],
  comboPhotos: {},
  customColors: [],
  customFormulas: [],
  customTopperTypes: [],
  usedCombinations: []
};

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

function dataReducer(state, action) {
  switch (action.type) {
    case 'LOAD_DATA':
      return { ...state, ...action.payload };
    case 'ADD_POLISH':
      return { ...state, nailPolishes: [...state.nailPolishes, action.payload] };
    case 'REMOVE_POLISH':
      return { ...state, nailPolishes: state.nailPolishes.filter(p => !(p.name === action.payload.name && p.brand === action.payload.brand)) };
    case 'ADD_TOPPER':
      return { ...state, toppers: [...state.toppers, action.payload] };
    case 'REMOVE_TOPPER':
      return { ...state, toppers: state.toppers.filter(t => !(t.name === action.payload.name && t.brand === action.payload.brand)) };
    case 'ADD_COMBINATION':
      return { ...state, usedCombinations: [...state.usedCombinations, action.payload] };
    case 'UPDATE_COMBINATION':
      return { 
        ...state, 
        usedCombinations: state.usedCombinations.map(c => 
          c.id === action.payload.id ? { ...c, ...action.payload.updates } : c
        )
      };
    case 'REMOVE_COMBINATION':
      return { ...state, usedCombinations: state.usedCombinations.filter(c => c.id !== action.payload) };
    case 'ADD_CUSTOM_COLOR':
      return { ...state, customColors: [...state.customColors, action.payload] };
    case 'REMOVE_CUSTOM_COLOR':
      return { ...state, customColors: state.customColors.filter(c => c !== action.payload) };
    case 'ADD_CUSTOM_FORMULA':
      return { ...state, customFormulas: [...state.customFormulas, action.payload] };
    case 'REMOVE_CUSTOM_FORMULA':
      return { ...state, customFormulas: state.customFormulas.filter(f => f !== action.payload) };
    case 'ADD_CUSTOM_TOPPER_TYPE':
      return { ...state, customTopperTypes: [...state.customTopperTypes, action.payload] };
    case 'REMOVE_CUSTOM_TOPPER_TYPE':
      return { ...state, customTopperTypes: state.customTopperTypes.filter(t => t !== action.payload) };
    case 'SAVE_COMBO_PHOTO':
      return { ...state, comboPhotos: { ...state.comboPhotos, [action.payload.key]: action.payload.photo } };
    case 'RESET_DATA':
      return initialState;
    default:
      return state;
  }
}

export const DataProvider = ({ children }) => {
  const [state, dispatch] = useReducer(dataReducer, initialState);
  const { user, isAuthenticated } = useAuth();

  // Load data - Firebase if authenticated, localStorage if not
  useEffect(() => {
    if (isAuthenticated && user?.polishCollection) {
      // Load from Firebase user data
      const firebaseData = {
        nailPolishes: user.polishCollection || [],
        toppers: user.topperCollection || [],
        usedCombinations: user.recentCombinations || [],
        customColors: user.customColors || [],
        customFormulas: user.customFormulas || [],
        customTopperTypes: user.customTopperTypes || [],
        comboPhotos: user.comboPhotos || {}
      };
      dispatch({ type: 'LOAD_DATA', payload: firebaseData });
    } else if (!isAuthenticated) {
      // Load from localStorage for non-authenticated users
      const savedData = {
        nailPolishes: JSON.parse(localStorage.getItem('nailPolishes')) || [],
        toppers: JSON.parse(localStorage.getItem('toppers')) || [],
        comboPhotos: JSON.parse(localStorage.getItem('comboPhotos')) || {},
        customColors: JSON.parse(localStorage.getItem('customColors')) || [],
        customFormulas: JSON.parse(localStorage.getItem('customFormulas')) || [],
        customTopperTypes: JSON.parse(localStorage.getItem('customTopperTypes')) || [],
        usedCombinations: JSON.parse(localStorage.getItem('usedCombinations')) || []
      };
      dispatch({ type: 'LOAD_DATA', payload: savedData });
    }
  }, [isAuthenticated, user]);

  // Save to localStorage for non-authenticated users
  useEffect(() => {
    if (!isAuthenticated) {
      Object.keys(state).forEach(key => {
        localStorage.setItem(key, JSON.stringify(state[key]));
      });
    }
  }, [state, isAuthenticated]);

  const getAllColors = () => {
    const defaults = ['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink', 'nude', 'black', 'brown', 'grey', 'white'];
    return [...defaults, ...state.customColors];
  };

  const getAllFormulas = () => {
    const defaults = ['creme', 'shimmer', 'glitter', 'metallic', 'holographic', 'chrome'];
    return [...defaults, ...state.customFormulas];
  };

  const getAllTopperTypes = () => {
    const defaults = ['glossy', 'matte', 'glitter', 'shimmer', 'holographic', 'chrome'];
    return [...defaults, ...state.customTopperTypes];
  };

  const value = {
    ...state,
    dispatch,
    getAllColors,
    getAllFormulas,
    getAllTopperTypes
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
