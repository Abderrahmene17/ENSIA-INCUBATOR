import { useState, useEffect, useCallback } from 'react';
import userService, { User, Role } from '../services/userService';

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);

  // Debounced fetch function
  const fetchUsers = useCallback(async (searchName?: string) => {
    const now = Date.now();
    if (now - lastFetchTime < 1000) {
      return;
    }

    setLoading(true);
    setLastFetchTime(now);

    try {
      const params = searchName ? { full_name: searchName } : undefined;
      const data = await userService.getUsers(params);
      setUsers(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [lastFetchTime]);

  const fetchRoles = async () => {
    try {
      const data = await userService.getRoles();
      setRoles(data);
    } catch (err) {
      console.error('Failed to fetch roles', err);
    }
  };

  const createUser = useCallback(async (userData: { full_name: string; email: string; password: string; role: number }) => {
    try {
      const user = await userService.createUser(userData);
      setUsers(prev => [...prev, user]);
      return user;
    } catch (err) {
      console.error('Error creating user:', err);
      throw err;
    }
  }, []);

  const updateUser = useCallback(async (userId: number, userData: Partial<User>) => {
    try {
      const user = await userService.updateUser(userId, userData);
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, ...userData } : user
      ));
      return user;
    } catch (err) {
      console.error('Error updating user:', err);
      throw err;
    }
  }, []);

  const deleteUser = useCallback(async (userId: number) => {
    try {
      await userService.deleteUser(userId);
      setUsers(prev => prev.filter(user => user.id !== userId));
    } catch (err) {
      console.error('Error deleting user:', err);
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  return {
    users,
    roles,
    loading,
    error,
    fetchUsers,
    fetchRoles,
    createUser,
    updateUser,
    deleteUser
  };
};

export const useUser = (id: number) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const data = await userService.getUser(id);
      setUser(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch user');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchUser();
    }
  }, [id]);

  return {
    user,
    loading,
    error,
    fetchUser
  };
};