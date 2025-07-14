import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "./config";

// Upload photo to Firebase Storage
export const uploadPhoto = async (userId, file, combinationId) => {
  try {
    // Create a unique filename with timestamp
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `combination_${combinationId}_${timestamp}.${fileExtension}`;
    
    // Create a reference to the file location
    const storageRef = ref(storage, `users/${userId}/combination-photos/${fileName}`);
    
    // Upload the file
    const snapshot = await uploadBytes(storageRef, file);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return {
      url: downloadURL,
      path: snapshot.ref.fullPath,
      fileName: fileName
    };
  } catch (error) {
    console.error("Error uploading photo:", error);
    throw new Error(`Failed to upload photo: ${error.message}`);
  }
};

// Delete photo from Firebase Storage
export const deletePhoto = async (photoPath) => {
  try {
    const photoRef = ref(storage, photoPath);
    await deleteObject(photoRef);
  } catch (error) {
    console.error("Error deleting photo:", error);
    throw new Error(`Failed to delete photo: ${error.message}`);
  }
};

// Upload photo from base64 data URL (for existing photos)
export const uploadPhotoFromDataURL = async (userId, dataURL, combinationId) => {
  try {
    // Convert data URL to blob
    const response = await fetch(dataURL);
    const blob = await response.blob();
    
    // Create a file-like object
    const file = new File([blob], `combination_${combinationId}.jpg`, { type: 'image/jpeg' });
    
    return await uploadPhoto(userId, file, combinationId);
  } catch (error) {
    console.error("Error uploading photo from data URL:", error);
    throw new Error(`Failed to upload photo: ${error.message}`);
  }
};
