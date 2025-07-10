/// <reference types="vite/client" />
import axios from 'axios';

// For development, use localhost backend
const API_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.DEV ? 'http://localhost:5000/api' : '/api');

console.log('API_URL configured as:', API_URL);

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
  console.log('Login URL:', `${API_URL}/auth/login`);
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export const registerUser = async (userData: any) => {
  console.log('Register URL:', `${API_URL}/auth/register`);
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

// Properties API
export const getProperties = async (filters?: any) => {
  console.log('Properties URL:', `${API_URL}/properties`);
  const response = await api.get('/properties', { params: filters });
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
  const response = await api.get(`/properties/${id}`);
  return response.data;
};

export const createProperty = async (propertyData: any) => {
  const response = await api.post('/properties', propertyData);
  return response.data;
};

export const updateProperty = async (id: string, propertyData: any) => {
  const response = await api.put(`/properties/${id}`, propertyData);
  return response.data;
};

export const deleteProperty = async (id: string) => {
  const response = await api.delete(`/properties/${id}`);
  return response.data;
};

// Companies API
export const getCompanies = async () => {
  const response = await api.get('/companies');
  return response.data;
};

export const createCompany = async (companyData: any) => {
  const response = await api.post('/companies', companyData);
  return response.data;
};

// Admin API
export const getAdminStats = async () => {
  const response = await api.get('/admin/stats');
  return response.data;
};

export const getAdminUsers = async () => {
  const response = await api.get('/admin/users');
  return response.data;
};

// Upload API
export const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export default api;