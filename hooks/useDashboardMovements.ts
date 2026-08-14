"use client";

import { useEffect, useState } from "react";
import { movementApi } from "@/lib/api/movement";
import type { Movement } from "@/types/movement";

export function useDashboardMovements(enabled = true) {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [isLoading, setIsLoading] = useState(enabled);

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    setIsLoading(true);
    movementApi
      .getMovements({ page: 1, size: 4 })
      .then((res) => active && setMovements(res.movements))
      .catch(() => active && setMovements([]))
      .finally(() => active && setIsLoading(false));
    return () => {
      active = false;
    };
  }, [enabled]);

  return { movements, isLoading };
}
