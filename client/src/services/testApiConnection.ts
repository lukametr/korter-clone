// Simple API connectivity test for vako.ge frontend
import axios from 'axios';

export async function testApiConnection() {
  try {
    console.log('Testing API at:', 'http://localhost:5000/api/properties');
    const response = await axios.get('http://localhost:5000/api/properties');
    console.log('API test response:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('API test failed:', error);
    return { error: error?.message || 'Connection failed' };
  }
}
