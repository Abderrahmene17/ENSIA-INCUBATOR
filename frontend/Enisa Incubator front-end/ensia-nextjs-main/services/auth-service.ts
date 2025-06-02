import axios from 'axios';

const API_URL = "http://localhost:8000/";  // Added trailing slash

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

class AuthService {
  async login(email: string, password: string) {
    try {
      const response = await axiosInstance.post('auth/login/', {
        email,
        password
      });
  
      if (response.data.access) {
        // ✅ Save tokens into localStorage
        localStorage.setItem("access", response.data.access);
        localStorage.setItem("refresh", response.data.refresh);
  
        return response.data;
      }
  
      throw new Error('Login failed: No access token received');
    } catch (error: any) {
      console.error('Login error:', error);
  
      let errorMessage = 'Login failed';
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
  
        errorMessage = error.response.data?.detail ||
                       error.response.data?.message ||
                       JSON.stringify(error.response.data) ||
                       errorMessage;
      } else if (error.request) {
        console.error('Request:', error.request);
        errorMessage = 'No response from server';
      } else {
        console.error('Error:', error.message);
        errorMessage = error.message || errorMessage;
      }
  
      throw new Error(errorMessage);
    }
  }
  

  async register(fullName: string, email: string, password: string) {
    try {
      const response = await axiosInstance.post('auth/signup/', {
        full_name: fullName,
        email,
        password
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data?.detail || 
          JSON.stringify(error.response?.data) || 
          "Registration failed"
        );
      }
      throw new Error("Network error");
    }
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  private isValidToken(token: string | null): boolean {
    if (!token) return false;
    return token.split('.').length === 3; // Simple JWT check
  }

  getCurrentUser() {
    return this.isValidToken(localStorage.getItem('access_token'));
  }
}

export default new AuthService();