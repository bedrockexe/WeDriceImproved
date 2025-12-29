import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  const API = import.meta.env.VITE_API_URL || "http://localhost:5001";

  const checkAuth = async () => {
    try {
      const res = await axios.get(`${API}/api/admin/me`, {
        withCredentials: true,
      });
      setAdmin(res.data.admin);
    } catch (error) {
      setAdmin(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (data) => {
    await axios.post(`${API}/api/admin/login`, data, {
      withCredentials: true,
    });
    await checkAuth();
  };

  const logout = async () => {
    await axios.post(`${API}/api/admin/logout`, {}, { withCredentials: true });
    setAdmin(null);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ admin, loading, setAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
