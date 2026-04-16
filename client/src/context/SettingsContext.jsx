import React, { createContext, useState, useContext, useEffect } from 'react';

// API Imports (Assuming these are exported from your api file)
import { 
  getAllParameters,
  getParameterById,
  createParameter,
  updateParameter,
  deleteParameter,
  getAllImages,
  registerImage,
  updateImage,
  deleteImage 
} from "../api/settings";

export const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  const [parametersList, setParametersList] = useState([]);
  const [imagesList, setImagesList] = useState([]);
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);

  // -------------------- Parameters Management --------------------

  const fetchAllParameters = async () => {
    setLoading(true);
    try {
      const res = await getAllParameters();
      setParametersList(res.data.data);
      return res.data.data;
    } catch (error) {
      setErrors([error.response?.data?.msg || "Error fetching parameters"]);
    } finally {
      setLoading(false);
    }
  };

  const createNewParameter = async (data) => {
    try {
      const res = await createParameter(data);
      console.log(res)
      setParametersList([...parametersList, res.data.data]);
      return res.data;
    } catch (error) {
      setErrors([error.response?.data?.msg || "Error creating parameter"]);
      throw error;
    }
  };

  const editParameter = async (id, data) => {
    try {
      const res = await updateParameter(id, data);
      setParametersList(parametersList.map(p => p.id === id ? res.data.data : p));
      return res.data;
    } catch (error) {
      setErrors([error.response?.data?.msg || "Error updating parameter"]);
      throw error;
    }
  };

  const removeParameter = async (id) => {
    try {
      await deleteParameter(id);
      setParametersList(parametersList.filter(p => p.id !== id));
    } catch (error) {
      setErrors([error.response?.data?.msg || "Error deleting parameter"]);
    }
  };

  // -------------------- Image Management --------------------

  const fetchAllImages = async () => {
    setLoading(true);
    try {
      const res = await getAllImages();
      setImagesList(res.data.data);
      return res.data.data;
    } catch (error) {
      setErrors([error.response?.data?.msg || "Error fetching images"]);
    } finally {
      setLoading(false);
    }
  };

  const uploadImage = async (formData) => {
    try {
      const res = await registerImage(formData);
      return res.data;
    } catch (error) {
      // Returning structured JSON messages as requested
      const errorMsg = error.response?.data?.msg || "Error uploading images";
      setErrors([errorMsg]);
      return { status: false, msg: errorMsg };
    }
  };

  const removeImage = async (id) => {
    try {
      await deleteImage(id);
      setImagesList(imagesList.filter(img => img.id !== id));
    } catch (error) {
      setErrors([error.response?.data?.msg || "Error deleting image"]);
    }
  };

  // -------------------- Effects --------------------

  // Auto-clear errors after 5 seconds
  useEffect(() => {
    if (errors.length > 0) {
      const timer = setTimeout(() => setErrors([]), 5000);
      return () => clearTimeout(timer);
    }
  }, [errors]);

  // Initial load
  useEffect(() => {
    fetchAllParameters();
    fetchAllImages();
  }, []);

  return (
    <SettingsContext.Provider value={{
      // States
      parametersList,
      imagesList,
      errors,
      loading,

      // Parameter Methods
      fetchAllParameters,
      createNewParameter,
      editParameter,
      removeParameter,

      // Image Methods
      fetchAllImages,
      uploadImage,
      deleteImage
    }}>
      {children}
    </SettingsContext.Provider>
  );
};