import { useEffect } from "react";

import { subscribeBusinessRefresh } from "../lib/realtime";

export const useRealtimeRefresh = (
  refresh: () => void,
  enabled = true
): void => {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    return subscribeBusinessRefresh(refresh);
  }, [enabled, refresh]);
};
