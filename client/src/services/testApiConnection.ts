// Simple API connectivity test for vako.ge frontend
import axios from 'axios';

export async function testApiConnection() {
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_URL || ''}/api/auth/ping`);
    return response.data;
  } catch (error: any) {
    return { error: error?.message || 'Connection failed' };
  }
}
