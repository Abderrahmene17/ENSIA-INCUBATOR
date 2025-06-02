import api from './api';

export interface User {
  id: number;
  full_name: string;
  email: string;
  role: number;
  role_name: string;
}

export interface Role {
  id: number;
  name: string;
}

const userService = {
  // Get all users with optional search
  getUsers: async (params?: { full_name?: string }) => {
    try {
      const response = await api.get('/users/', {
        params: params || {}
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },
  
  // Get a single user by ID
  getUser: async (id: number) => {
    const response = await api.get(`/users/${id}/`);
    return response.data;
  },
  
  // Create a new user
  createUser: async (data: { full_name: string; email: string; password: string; role: number }) => {
    const response = await api.post('/users/', data);
    return response.data;
  },
  
  // Update a user
  updateUser: async (id: number, data: Partial<User>) => {
    const response = await api.put(`/users/${id}/`, data);
    return response.data;
  },
  
  // Delete a user
  deleteUser: async (id: number) => {
    return await api.delete(`/users/${id}/`);
  },
  
  // Get all roles
  getRoles: async () => {
    const response = await api.get('/roles/');
    return response.data;
  }
};

export default userService;