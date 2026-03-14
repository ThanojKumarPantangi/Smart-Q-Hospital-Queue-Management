import React, { useEffect, useRef, useCallback, useState } from "react";
import { io } from "socket.io-client";
import { SocketContext } from "./SocketContext";

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  /* ================================
     SOCKET EVENT HANDLERS
  ================================= */

  const handleConnect = useCallback(() => {
    setIsConnected((prev) => {
      if (!prev) return true;
      return prev;
    });
  }, []);

  const handleDisconnect = useCallback(() => {
    setIsConnected((prev) => {
      if (prev) return false;
      return prev;
    });
  }, []);

  const handleConnectError = useCallback((err) => {
    console.warn("Socket connect_error:", err?.message || err);
  }, []);

  /* ================================
     SOCKET INITIALIZATION
  ================================= */

  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL, {
      withCredentials: true,
      autoConnect: false,
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);

      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, [handleConnect, handleDisconnect, handleConnectError]);

  /* ================================
     CONNECT FUNCTION
  ================================= */

  const connectSocket = useCallback(() => {
    const socket = socketRef.current;
    if (!socket) return;

    if (!socket.connected) {
      socket.connect();
    }
  }, []);

  /* ================================
     DISCONNECT FUNCTION
  ================================= */

  const disconnectSocket = useCallback(() => {
    const socket = socketRef.current;
    if (!socket) return;

    if (socket.connected) {
      socket.disconnect();
    }

    setIsConnected(false);
  }, []);

  /* ================================
     CONTEXT PROVIDER
  ================================= */

  return (
    <SocketContext.Provider
      value={{
        socketRef,
        isConnected,
        connectSocket,
        disconnectSocket,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};