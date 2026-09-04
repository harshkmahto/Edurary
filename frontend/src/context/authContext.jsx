import React, { createContext, useState, useContext, useEffect } from 'react';
import { getProfile, logoutUser } from '../services/auth.service';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};


export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);


   useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {

    const response = await getProfile();
    
    if (response && response.success && response.data?.user){
        setUser(response.data.user);
        setIsAuthenticated(true);
    } else {
        setUser(null);
        setIsAuthenticated(false);
    } 
} catch (error) {
      
      if (error.status !== 401 && error.message !== 'Failed to fetch profile') {
        console.error("Auth check failed:", error);
      }
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

 const logout = async () => {
    try {
      const response = await logoutUser();
      
      if (response) {
        setUser(null);
        setIsAuthenticated(false);
        console.log("Logged out successfully");
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  }; 


 const value = {
    user,
    isAuthenticated,
    loading,
    checkAuth,
    logout,
  };
 

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};