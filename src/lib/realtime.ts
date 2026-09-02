import { io, type Socket } from "socket.io-client";
import { queryClient } from "./queryClient";
import { queryKeys } from "./queryKeys";

const API_URL =
  import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, "") ??
  "http://localhost:5000";

export const realtimeSocket: Socket = io(API_URL, {
  transports: ["websocket", "polling"],
  reconnection: true,
  reconnectionDelay: 1_000,
  reconnectionDelayMax: 5_000,
});

export const BUSINESS_REFRESH_EVENT = "thads:business-refresh";

let realtimeStarted = false;

export const startRealtimeSync = (): (() => void) => {
  if (realtimeStarted) {
    return () => undefined;
  }

  realtimeStarted = true;

  const refreshBusinessData = (): void => {
    void queryClient.invalidateQueries({
      queryKey: queryKeys.all,
      refetchType: "active",
    });

    window.dispatchEvent(new Event(BUSINESS_REFRESH_EVENT));
  };

  realtimeSocket.on("business:changed", refreshBusinessData);

  return () => {
    realtimeSocket.off("business:changed", refreshBusinessData);
    realtimeStarted = false;
  };
};

export const subscribeBusinessRefresh = (
  callback: () => void
): (() => void) => {
  const handler = (): void => callback();
  window.addEventListener(BUSINESS_REFRESH_EVENT, handler);

  return () => {
    window.removeEventListener(BUSINESS_REFRESH_EVENT, handler);
  };
};
