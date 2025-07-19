import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { 
  addPolishToCollection, 
  removePolishFromCollection, 
  addTopperToCollection, 
  removeTopperFromCollection,
  addFinisherToCollection,
  removeFinisherFromCollection,
  addRecentCombination,
  updateRecentCombination,
  removeRecentCombination
} from '../firebase/firestore';
import { uploadPhoto, uploadPhotoFromDataURL, deletePhoto } from '../firebase/storage';

const initialState = {
  nailPolishes: [],
  toppers: [],
  finishers: [],
  comboPhotos: {},
  customColors: [],
  customFormulas: [],
  customTopperTypes: [],
  customFinisherTypes: [],
  customBrands: [],
  customCollections: [],
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
    case 'ADD_FINISHER':
      return { ...state, finishers: [...state.finishers, action.payload] };
    case 'REMOVE_FINISHER':
      return { ...state, finishers: state.finishers.filter(f => !(f.name === action.payload.name && f.brand === action.payload.brand)) };
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
    case 'ADD_CUSTOM_FINISHER_TYPE':
      return { ...state, customFinisherTypes: [...state.customFinisherTypes, action.payload] };
    case 'REMOVE_CUSTOM_FINISHER_TYPE':
      return { ...state, customFinisherTypes: state.customFinisherTypes.filter(t => t !== action.payload) };
    case 'ADD_CUSTOM_BRAND':
      // Prevent duplicates by checking if brand already exists
      const allExistingBrands = new Set([
        ...state.nailPolishes.map(p => p.brand),
        ...state.toppers.map(t => t.brand),
        ...state.finishers.map(f => f.brand),
        ...state.customBrands
      ]);
      if (!allExistingBrands.has(action.payload)) {
        return { ...state, customBrands: [...state.customBrands, action.payload] };
      }
      return state;
    case 'REMOVE_CUSTOM_BRAND':
      return { ...state, customBrands: state.customBrands.filter(b => b !== action.payload) };
    case 'ADD_CUSTOM_COLLECTION':
      // Prevent duplicates by checking if collection already exists
      const allExistingCollections = new Set([
        ...state.nailPolishes.map(p => p.collection).filter(Boolean),
        ...state.toppers.map(t => t.collection).filter(Boolean),
        ...state.customCollections
      ]);
      if (!allExistingCollections.has(action.payload)) {
        return { ...state, customCollections: [...state.customCollections, action.payload] };
      }
      return state;
    case 'REMOVE_CUSTOM_COLLECTION':
      return { ...state, customCollections: state.customCollections.filter(c => c !== action.payload) };
    case 'UPDATE_POLISH':
      return { 
        ...state, 
        nailPolishes: state.nailPolishes.map(p => 
          p.name === action.payload.originalName && p.brand === action.payload.originalBrand 
            ? action.payload.updatedPolish 
            : p
        )
      };
    case 'SAVE_COMBO_PHOTO':
      return { ...state, comboPhotos: { ...state.comboPhotos, [action.payload.key]: action.payload.photo } };
    case 'REMOVE_COMBO_PHOTO':
      const { [action.payload]: removed, ...remainingPhotos } = state.comboPhotos;
      return { ...state, comboPhotos: remainingPhotos };
    case 'RESET_DATA':
      return initialState;
    default:
      return state;
  }
}

export const DataProvider = ({ children }) => {
  const [state, dispatch] = useReducer(dataReducer, initialState);
  const { user, isAuthenticated } = useAuth();

  // Enhanced dispatch that syncs with Firebase for authenticated users
  const enhancedDispatch = async (action) => {
    // For removal actions, find the item BEFORE updating local state
    let itemToRemove = null;
    if (isAuthenticated && user?.uid) {
      switch (action.type) {
        case 'REMOVE_POLISH':
          itemToRemove = state.nailPolishes.find(p => 
            p.name === action.payload.name && p.brand === action.payload.brand
          );
          break;
        case 'REMOVE_TOPPER':
          itemToRemove = state.toppers.find(t => 
            t.name === action.payload.name && t.brand === action.payload.brand
          );
          break;
        case 'REMOVE_FINISHER':
          itemToRemove = state.finishers.find(f => 
            f.name === action.payload.name && f.brand === action.payload.brand
          );
          break;
      }
    }

    // Update local state
    dispatch(action);

    // Then sync with Firebase if authenticated
    if (isAuthenticated && user?.uid) {
      try {
        switch (action.type) {
          case 'ADD_POLISH':
            await addPolishToCollection(user.uid, action.payload);
            break;
          case 'REMOVE_POLISH':
            if (itemToRemove?.id) {
              await removePolishFromCollection(user.uid, itemToRemove.id);
            }
            break;
          case 'ADD_TOPPER':
            await addTopperToCollection(user.uid, action.payload);
            break;
          case 'REMOVE_TOPPER':
            if (itemToRemove?.id) {
              await removeTopperFromCollection(user.uid, itemToRemove.id);
            }
            break;
          case 'ADD_FINISHER':
            await addFinisherToCollection(user.uid, action.payload);
            break;
          case 'REMOVE_FINISHER':
            if (itemToRemove?.id) {
              await removeFinisherFromCollection(user.uid, itemToRemove.id);
            }
            break;
          case 'ADD_COMBINATION':
            if (action.payload.used) {
              console.log('DataContext: Processing combination with used=true:', {
                id: action.payload.id,
                hasPhotoFile: !!action.payload.photoFile,
                hasPhoto: !!action.payload.photo,
                photoFileType: action.payload.photoFile ? action.payload.photoFile.constructor.name : null,
                photoType: action.payload.photo ? typeof action.payload.photo : null,
                photoStartsWith: action.payload.photo ? action.payload.photo.substring(0, 20) + '...' : null
              });
              let photoData = null;
              
              // Handle photo upload to Firebase Storage if there's a photo
              if (action.payload.photoFile) {
                console.log('DataContext: Found photoFile, uploading to Firebase Storage:', {
                  name: action.payload.photoFile.name,
                  size: action.payload.photoFile.size,
                  type: action.payload.photoFile.type
                });
                try {
                  // Upload the actual file to Firebase Storage
                  const uploadResult = await uploadPhoto(user.uid, action.payload.photoFile, action.payload.id);
                  console.log('DataContext: Photo uploaded successfully:', uploadResult);
                  
                  // Map the upload result to the expected photoData format
                  photoData = {
                    photo: uploadResult.url,
                    photoPath: uploadResult.path,
                    photoFileName: uploadResult.fileName
                  };
                } catch (error) {
                  console.error('Error uploading photo to Firebase Storage:', error);
                  // Continue without photo if upload fails
                }
              } else if (action.payload.photo && action.payload.photo.startsWith('data:')) {
                console.log('DataContext: Found base64 photo, uploading to Firebase Storage');
                try {
                  // Fallback: If it's a data URL (base64), upload it to Firebase Storage
                  const uploadResult = await uploadPhotoFromDataURL(user.uid, action.payload.photo, action.payload.id);
                  console.log('DataContext: Base64 photo uploaded successfully:', uploadResult);
                  
                  // Map the upload result to the expected photoData format
                  photoData = {
                    photo: uploadResult.url,
                    photoPath: uploadResult.path,
                    photoFileName: uploadResult.fileName
                  };
                } catch (error) {
                  console.error('Error uploading photo from data URL to Firebase Storage:', error);
                  // Continue without photo if upload fails
                }
              } else {
                console.log('DataContext: No photo found in combination payload', {
                  hasPhotoFile: !!action.payload.photoFile,
                  hasPhoto: !!action.payload.photo,
                  photoValue: action.payload.photo
                });
              }
              
              console.log('DataContext: Adding combination to Firebase with photoData:', photoData);
              await addRecentCombination(user.uid, action.payload, photoData);
            }
            break;
          case 'UPDATE_COMBINATION':
            if (action.payload.updates.photoFile || action.payload.updates.photo) {
              console.log('DataContext: Processing UPDATE_COMBINATION with photo:', {
                id: action.payload.id,
                hasPhotoFile: !!action.payload.updates.photoFile,
                hasPhoto: !!action.payload.updates.photo
              });
              
              let photoData = null;
              
              // Handle photo upload to Firebase Storage if there's a photo
              if (action.payload.updates.photoFile) {
                console.log('DataContext: Found photoFile in UPDATE_COMBINATION, uploading to Firebase Storage:', {
                  name: action.payload.updates.photoFile.name,
                  size: action.payload.updates.photoFile.size,
                  type: action.payload.updates.photoFile.type
                });
                try {
                  // Upload the actual file to Firebase Storage
                  const uploadResult = await uploadPhoto(user.uid, action.payload.updates.photoFile, action.payload.id);
                  console.log('DataContext: Photo uploaded successfully in UPDATE_COMBINATION:', uploadResult);
                  
                  // Map the upload result to the expected photoData format
                  photoData = {
                    photo: uploadResult.url,
                    photoPath: uploadResult.path,
                    photoFileName: uploadResult.fileName
                  };
                } catch (error) {
                  console.error('Error uploading photo to Firebase Storage in UPDATE_COMBINATION:', error);
                  // Continue without photo if upload fails
                }
              } else if (action.payload.updates.photo && action.payload.updates.photo.startsWith('data:')) {
                console.log('DataContext: Found base64 photo in UPDATE_COMBINATION, uploading to Firebase Storage');
                try {
                  // Fallback: If it's a data URL (base64), upload it to Firebase Storage
                  const uploadResult = await uploadPhotoFromDataURL(user.uid, action.payload.updates.photo, action.payload.id);
                  console.log('DataContext: Base64 photo uploaded successfully in UPDATE_COMBINATION:', uploadResult);
                  
                  // Map the upload result to the expected photoData format
                  photoData = {
                    photo: uploadResult.url,
                    photoPath: uploadResult.path,
                    photoFileName: uploadResult.fileName
                  };
                } catch (error) {
                  console.error('Error uploading photo from data URL to Firebase Storage in UPDATE_COMBINATION:', error);
                  // Continue without photo if upload fails
                }
              }
              
              // Update the combination in Firebase with the photo data
              if (photoData) {
                console.log('DataContext: Updating combination in Firebase with photoData:', photoData);
                // Filter out photoFile from updates since Firestore can't handle File objects
                const { photoFile, ...firestoreUpdates } = action.payload.updates;
                await updateRecentCombination(user.uid, action.payload.id, firestoreUpdates, photoData);
              } else {
                // Update without photo data - also filter out photoFile
                const { photoFile, ...firestoreUpdates } = action.payload.updates;
                await updateRecentCombination(user.uid, action.payload.id, firestoreUpdates);
              }
            }
            break;
          case 'REMOVE_COMBINATION':
            await removeRecentCombination(user.uid, action.payload);
            break;
          default:
            // For other actions, we don't need Firebase sync yet
            break;
        }
      } catch (error) {
        console.error('Firebase sync error:', error);
        // You might want to show an error message to the user here
      }
    }
  };

  // Load data - Firebase if authenticated, localStorage if not
  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('DataContext: Loading data for authenticated user:', user.uid);
      console.log('DataContext: User object keys:', Object.keys(user));
      console.log('DataContext: polishCollection length:', user.polishCollection?.length || 0);
      console.log('DataContext: topperCollection length:', user.topperCollection?.length || 0);
      console.log('DataContext: finisherCollection length:', user.finisherCollection?.length || 0);
      console.log('DataContext: recentCombinations length:', user.recentCombinations?.length || 0);
      
      if (user.polishCollection?.length > 0) {
        console.log('DataContext: First polish:', user.polishCollection[0]);
      }
      if (user.recentCombinations?.length > 0) {
        console.log('DataContext: First combination:', user.recentCombinations[0]);
      }
      
      // Load from Firebase user data (user object should have all fields after getUserData)
      const firebaseData = {
        nailPolishes: user.polishCollection || [],
        toppers: user.topperCollection || [],
        finishers: user.finisherCollection || [],
        usedCombinations: user.recentCombinations || [],
        customColors: user.customColors || [],
        customFormulas: user.customFormulas || [],
        customTopperTypes: user.customTopperTypes || [],
        customFinisherTypes: user.customFinisherTypes || [],
        comboPhotos: user.comboPhotos || {}
      };
      console.log('DataContext: Final firebaseData lengths:', {
        nailPolishes: firebaseData.nailPolishes.length,
        toppers: firebaseData.toppers.length,
        finishers: firebaseData.finishers.length,
        usedCombinations: firebaseData.usedCombinations.length
      });
      dispatch({ type: 'LOAD_DATA', payload: firebaseData });
    } else if (!isAuthenticated) {
      console.log('DataContext: Loading data from localStorage for non-authenticated user');
      // Load from localStorage for non-authenticated users
      const savedData = {
        nailPolishes: JSON.parse(localStorage.getItem('nailPolishes')) || [],
        toppers: JSON.parse(localStorage.getItem('toppers')) || [],
        finishers: JSON.parse(localStorage.getItem('finishers')) || [],
        comboPhotos: JSON.parse(localStorage.getItem('comboPhotos')) || {},
        customColors: JSON.parse(localStorage.getItem('customColors')) || [],
        customFormulas: JSON.parse(localStorage.getItem('customFormulas')) || [],
        customTopperTypes: JSON.parse(localStorage.getItem('customTopperTypes')) || [],
        customFinisherTypes: JSON.parse(localStorage.getItem('customFinisherTypes')) || [],
        usedCombinations: JSON.parse(localStorage.getItem('usedCombinations')) || []
      };
      console.log('DataContext: localStorage data loaded:', savedData);
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
    const defaults = ['crème', 'shimmer', 'glitter', 'metallic', 'holographic', 'chrome'];
    const allFormulas = new Set([...defaults, ...state.customFormulas]);
    return Array.from(allFormulas).sort();
  };

  const getAllTopperTypes = () => {
    const defaults = ['glossy', 'matte', 'glitter', 'shimmer', 'holographic', 'chrome'];
    return [...defaults, ...state.customTopperTypes];
  };

  const getAllFinisherTypes = () => {
    const defaults = ['matte top coat', 'glossy top coat'];
    return [...defaults, ...state.customFinisherTypes];
  };

  const getAllBrands = () => {
    // Extract unique brands from existing polishes, toppers, and finishers
    const existingBrands = new Set([
      ...state.nailPolishes.map(p => p.brand),
      ...state.toppers.map(t => t.brand),
      ...state.finishers.map(f => f.brand)
    ]);
    // Combine existing and custom brands, remove duplicates, and sort alphabetically
    const allBrands = new Set([
      ...Array.from(existingBrands),
      ...state.customBrands
    ]);
    return Array.from(allBrands).sort();
  };

  const getAllCollections = () => {
    // Extract unique collections from existing polishes and toppers
    const existingCollections = new Set([
      ...state.nailPolishes.map(p => p.collection).filter(Boolean),
      ...state.toppers.map(t => t.collection).filter(Boolean)
    ]);
    // Combine existing and custom collections, remove duplicates, and sort alphabetically
    const allCollections = new Set([
      ...Array.from(existingCollections),
      ...state.customCollections
    ]);
    return Array.from(allCollections).sort();
  };

  const value = {
    ...state,
    dispatch: enhancedDispatch,
    getAllColors,
    getAllFormulas,
    getAllTopperTypes,
    getAllFinisherTypes,
    getAllBrands,
    getAllCollections
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
