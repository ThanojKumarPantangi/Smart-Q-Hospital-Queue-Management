import { useEffect, useRef } from "react";

export function useTokenSocket({
  socketRef,
  token,
  departmentId,
  onCalled,
  onSkipped,
  onCompleted,
  onNoShow,
  onQueueUpdate,
  onNewMessage,
  onMissedMessages,
}) {
  const joinedDeptRef = useRef(null);

  /* ---------- JOIN DEPARTMENT (ONLY ON CHANGE) ---------- */
  useEffect(() => {
    if (!socketRef?.current) return;

    const socket = socketRef.current;
    const deptId = departmentId || token?.departmentId;

    if (!deptId) return;

    // prevent duplicate join
    if (joinedDeptRef.current === deptId) return;

    // leave previous department if switching
    if (joinedDeptRef.current) {
      socket.emit("leave-department", joinedDeptRef.current);
    }

    socket.emit("join-department", deptId);
    joinedDeptRef.current = deptId;

  }, [departmentId, token?.departmentId,socketRef]);



  /* ---------- SOCKET RECONNECT HANDLING ---------- */
  useEffect(() => {
    if (!socketRef?.current) return;

    const socket = socketRef.current;

    const handleReconnect = () => {
      const deptId = joinedDeptRef.current;
      if (deptId) {
        socket.emit("join-department", deptId);
      }
    };

    socket.on("connect", handleReconnect);

    return () => {
      socket.off("connect", handleReconnect);
    };
  }, [socketRef]);



  /* ---------- TOKEN EVENTS ---------- */
  useEffect(() => {
    if (!socketRef?.current) return;

    const socket = socketRef.current;

    const handleCalled = (payload) => onCalled?.(payload);
    const handleSkipped = (payload) => onSkipped?.(payload);
    const handleCompleted = (payload) => onCompleted?.(payload);
    const handleNoShow = (payload) => onNoShow?.(payload);
    const handleQueue = (payload) => onQueueUpdate?.(payload);

    socket.on("TOKEN_CALLED", handleCalled);
    socket.on("TOKEN_SKIPPED", handleSkipped);
    socket.on("TOKEN_COMPLETED", handleCompleted);
    socket.on("TOKEN_NO_SHOW", handleNoShow);
    socket.on("QUEUE_POSITION_UPDATE", handleQueue);

    return () => {
      socket.off("TOKEN_CALLED", handleCalled);
      socket.off("TOKEN_SKIPPED", handleSkipped);
      socket.off("TOKEN_COMPLETED", handleCompleted);
      socket.off("TOKEN_NO_SHOW", handleNoShow);
      socket.off("QUEUE_POSITION_UPDATE", handleQueue);
    };
  }, [onCalled, onSkipped, onCompleted, onNoShow, onQueueUpdate,socketRef]);



  /* ---------- MESSAGE EVENTS ---------- */
  useEffect(() => {
    if (!socketRef?.current) return;

    const socket = socketRef.current;

    const handleNewMessage = (message) => {
      onNewMessage?.(message);
    };

    const handleMissedMessages = (messages = []) => {
      onMissedMessages?.(messages);
    };

    socket.on("messages:new", handleNewMessage);
    socket.on("messages:missed", handleMissedMessages);

    return () => {
      socket.off("messages:new", handleNewMessage);
      socket.off("messages:missed", handleMissedMessages);
    };
  }, [onNewMessage, onMissedMessages,socketRef]);
}