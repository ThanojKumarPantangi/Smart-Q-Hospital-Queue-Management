import { useEffect, useState, useRef } from "react";
import { AuthContext } from "./AuthContext";
import api from "../api/axios";
import { useSocket } from "../hooks/useSocket";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const { connectSocket, disconnectSocket } = useSocket();

  // prevents multiple /me calls
  const fetchedRef = useRef(false);

  const fetchUser = async () => {
    try {
      const res = await api.get("/api/auth/me");
      setUser(res.data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // run ONLY once
  useEffect(() => {
    if (fetchedRef.current) return;

    fetchedRef.current = true;
    fetchUser();
  }, []);

  // socket connection manager
  useEffect(() => {
    if (!user) {
      disconnectSocket();
      return;
    }

    connectSocket();

    return () => {
      disconnectSocket();
    };
  }, [user,connectSocket,disconnectSocket]);

  const login = async () => {
    await fetchUser();
  };

  const logout = async () => {
    try {
      await api.post("/api/auth/logout");
    } catch {
      // 
    }

    setUser(null);
    disconnectSocket();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};