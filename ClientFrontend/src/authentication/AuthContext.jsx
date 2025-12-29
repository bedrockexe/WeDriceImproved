import { createContext, useContext, useMemo } from "react";
import axios from "axios";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const queryClient = useQueryClient();

  // 🔹 Fetch current user using TanStack Query
  const {
    data: user,
    isLoading: loading,
    refetch: refetchUser,
  } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const res = await axios.get(`${API}/api/users/me`, {
        withCredentials: true,
      });
      return res.data.user;
    },
    retry: false,
    staleTime: 1000 * 60 * 5,
  });


  // 🔹 Logout function
  const logout = async () => {
    try {
      await axios.post(`${API}/api/logout`, {}, { withCredentials: true });

      // Clear cached auth data
      queryClient.setQueryData(["currentUser"], null);
      queryClient.clear();
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      logout,
      refetchUser,
      isAuthenticated: !!user,
    }),
    [user, loading]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
