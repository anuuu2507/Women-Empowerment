import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  aadhaarLast4: string;
  gender: 'female';
  skills: string[];
  profileImage?: string;
  credits: number;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  workHistory: WorkItem[];
  availability: string;
  deliveryPreference: 'pickup' | 'delivery' | 'online' | 'all';
  radius: number;
}

interface WorkItem {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'pending';
  date: string;
  amount: number;
  rating?: number;
  review?: string;
  customerName: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: Partial<User>) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  addCredits: (amount: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user data for demo
const mockUser: User = {
  id: '1',
  name: 'Priya Sharma',
  email: 'priya@example.com',
  phone: '+91 98765 43210',
  address: 'Hyderabad, Telangana',
  aadhaarLast4: '1234',
  gender: 'female',
  skills: ['Stitching', 'Tailoring', 'Home Cooking'],
  credits: 2500,
  rating: 4.8,
  reviewCount: 47,
  isVerified: true,
  workHistory: [
    {
      id: '1',
      title: 'Blouse Stitching',
      description: 'Traditional blouse with embroidery work',
      status: 'completed',
      date: '2024-01-15',
      amount: 500,
      rating: 5,
      review: 'Excellent work! Very professional.',
      customerName: 'Lakshmi',
    },
    {
      id: '2',
      title: 'Home Cooked Meal',
      description: 'South Indian thali for family gathering',
      status: 'completed',
      date: '2024-01-10',
      amount: 800,
      rating: 5,
      review: 'Delicious food! Will order again.',
      customerName: 'Sunita',
    },
  ],
  availability: '9 AM - 6 PM',
  deliveryPreference: 'all',
  radius: 5,
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('feminine-shakthi-user');
    return saved ? JSON.parse(saved) : null;
  });

  const isAuthenticated = !!user;

  useEffect(() => {
    if (user) {
      localStorage.setItem('feminine-shakthi-user', JSON.stringify(user));
    } else {
      localStorage.removeItem('feminine-shakthi-user');
    }
  }, [user]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success && data.user) {
        setUser(data.user);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (userData: Partial<User>): Promise<{ success: boolean; message?: string; shouldRedirectToLogin?: boolean }> => {
    console.log('🔵 Registration attempt with data:', userData);

    // Check if user already exists in localStorage
    const existingUser = localStorage.getItem('feminine-shakthi-user');
    if (existingUser) {
      try {
        const parsedUser = JSON.parse(existingUser);
        if (parsedUser.email === userData.email || parsedUser.phone === userData.phone) {
          console.log('⚠️ User already exists in localStorage');
          return {
            success: false,
            message: 'Account already exists. Please login instead.',
            shouldRedirectToLogin: true
          };
        }
      } catch (e) {
        console.error('Error parsing existing user:', e);
      }
    }

    // Try to sync with backend (check for duplicates there too)
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      console.log('🔵 Backend response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('🔵 Backend response data:', data);

        if (data.success && data.user) {
          console.log('✅ Registration synced with backend successfully!');
          setUser(data.user);
          return { success: true };
        } else if (!data.success && (data.message?.includes('already registered') || data.message?.includes('Email already') || data.message?.includes('Phone number already'))) {
          // Backend detected duplicate user
          console.log('⚠️ Backend detected duplicate user');
          return {
            success: false,
            message: 'Account already exists. Please login instead.',
            shouldRedirectToLogin: true
          };
        }
      } else {
        // Check if it's a duplicate error from backend
        try {
          const errorData = await response.json();
          if (errorData.message?.includes('already registered') || errorData.message?.includes('Email already') || errorData.message?.includes('Phone number already')) {
            console.log('⚠️ Backend detected duplicate user (non-200 response)');
            return {
              success: false,
              message: 'Account already exists. Please login instead.',
              shouldRedirectToLogin: true
            };
          }
        } catch (e) {
          console.error('Error parsing error response:', e);
        }
      }

      console.log('⚠️ Backend sync failed, using local registration');
    } catch (error) {
      console.log('⚠️ Backend unavailable, using local registration:', error);
    }

    // Create a new user object with default values (offline-first approach)
    const newUser: User = {
      id: `user_${Date.now()}`,
      name: userData.name || '',
      email: userData.email || '',
      phone: userData.phone || '',
      address: userData.address || '',
      aadhaarLast4: userData.aadhaarLast4 || '',
      gender: 'female',
      skills: userData.skills || [],
      credits: 0,
      rating: 0,
      reviewCount: 0,
      isVerified: true,
      workHistory: [],
      availability: 'Flexible',
      deliveryPreference: 'all',
      radius: 5,
    };

    // Always succeed with local registration
    console.log('✅ Creating user locally:', newUser);
    setUser(newUser);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
  };

  const updateUser = async (data: Partial<User>) => {
    if (user) {
      try {
        // Optimistic update
        const updatedUser = { ...user, ...data };
        setUser(updatedUser);

        // Persist to backend
        const res = await fetch(`/api/users/${user.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        const result = await res.json();
        if (result.success && result.user) {
          setUser(result.user); // Confirm with server state
          localStorage.setItem('feminine-shakthi-user', JSON.stringify(result.user));
        }
      } catch (err) {
        console.error("Failed to update profile", err);
        // Revert or show error if critical
      }
    }
  };

  const addCredits = (amount: number) => {
    if (user) {
      setUser({ ...user, credits: user.credits + amount });
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, register, logout, updateUser, addCredits }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
