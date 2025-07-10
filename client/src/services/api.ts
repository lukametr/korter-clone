/// <reference types="vite/client" />
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const loginUser = async (email: string, password: string) => {
  const response = await api.post('/api/auth/login', { email, password });
  return response.data;
};

export const registerUser = async (userData: any) => {
  const response = await api.post('/api/auth/register', userData);
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get('/api/auth/me');
  return response.data;
};

// Properties API
export const getProperties = async (filters?: any) => {
  const response = await api.get('/api/properties', { params: filters });
  console.log('API Response:', response.data);
  
  // Extract properties array from response
  let properties = response.data.properties || response.data;
  
  // Ensure we always return an array
  if (!Array.isArray(properties)) {
    console.warn('Properties data is not an array:', properties);
    return [];
  }
  
  // Fix image URLs by adding server base URL
  return properties.map((property: any) => ({
    ...property,
    mainImage: property.mainImage?.startsWith('/uploads') 
      ? `${API_URL}${property.mainImage}` 
      : property.mainImage,
    images: property.images?.map((img: string) => 
      img.startsWith('/uploads') ? `${API_URL}${img}` : img
    ) || []
  }));
};

export const getProperty = async (id: string) => {
  const response = await api.get(`/api/properties/${id}`);
  return response.data;
};

export const createProperty = async (propertyData: any) => {
  const response = await api.post('/api/properties', propertyData);
  return response.data;
};

export const updateProperty = async (id: string, propertyData: any) => {
  const response = await api.put(`/api/properties/${id}`, propertyData);
  return response.data;
};

export const deleteProperty = async (id: string) => {
  const response = await api.delete(`/api/properties/${id}`);
  return response.data;
};

// Companies API
export const getCompanies = async () => {
  const response = await api.get('/api/companies');
  return response.data;
};

export const createCompany = async (companyData: any) => {
  const response = await api.post('/api/companies', companyData);
  return response.data;
};

// Admin API
export const getAdminStats = async () => {
  const response = await api.get('/api/admin/stats');
  return response.data;
};

export const getAdminUsers = async () => {
  const response = await api.get('/api/admin/users');
  return response.data;
};

// Upload API
export const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post('/api/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export default api;