"use client";

import { useEffect, useState, useCallback } from "react";
import { securityLogger } from "../utils/securityLogger";

export interface SyncAction {
  id: string;
  type: "wishlist_toggle" | "profile_update" | "analytics_event";
  payload: unknown;
  timestamp: number;
}

export function useSync() {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [pendingQueue, setPendingQueue] = useState<SyncAction[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Flush queue – moved before useEffect and wrapped in useCallback
  const flushQueue = useCallback(async () => {
    if (isSyncing || pendingQueue.length === 0) return;
    setIsSyncing(true);
    // Simulated sync – replace with real Supabase call later
    for (const action of [...pendingQueue]) {
      try {
        await new Promise((resolve) => setTimeout(resolve, 300));
      } catch (e) {
        securityLogger({ type: "supabase_error", source: "useSync.flushQueue", message: String(e) });
        setIsSyncing(false);
        return;
      }
    }
    // Clear queue after successful sync
    setPendingQueue([]);
    if (typeof window !== "undefined") {
      localStorage.setItem("serena_pending_sync", JSON.stringify([]));
    }
    setIsSyncing(false);
  }, [isSyncing, pendingQueue]);

  // Load initial queue and set listeners
  useEffect(() => {
    if (typeof window === "undefined") return;
    setIsOnline(navigator.onLine);
    const saved = localStorage.getItem("serena_pending_sync");
    if (saved) {
      try {
        setPendingQueue(JSON.parse(saved) as SyncAction[]);
      } catch (e) {
        securityLogger({ type: "supabase_error", source: "useSync.loadQueue", message: String(e) });
      }
    }
    const handleOnline = () => {
      setIsOnline(true);
      flushQueue();
    };
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    if (navigator.onLine) flushQueue();
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [flushQueue]);

  const saveQueue = (queue: SyncAction[]) => {
    setPendingQueue(queue);
    if (typeof window !== "undefined") {
      localStorage.setItem("serena_pending_sync", JSON.stringify(queue));
    }
  };

  const queueAction = useCallback((type: SyncAction["type"], payload: unknown) => {
    const newAction: SyncAction = {
      id: crypto.randomUUID(),
      type,
      payload,
      timestamp: Date.now(),
    };
    const updated = [...pendingQueue, newAction];
    saveQueue(updated);
    if (isOnline) flushQueue();
  }, [pendingQueue, isOnline, flushQueue]);

  return { isOnline, isSyncing, pendingCount: pendingQueue.length, queueAction, flushQueue };
}
