// Simple API connectivity test for vako.ge frontend
import axios from 'axios';

export async function testApiConnection() {
  try {
    // Use relative URL in production, absolute URL in development
    const apiUrl = import.meta.env.DEV ? 'http://localhost:5000/api/properties' : '/api/properties';
    console.log('Testing API at:', apiUrl);
    const response = await axios.get(apiUrl);
    console.log('API test response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('API test failed:', error);
    return { error: error?.message || 'Connection failed' };
  }
}
