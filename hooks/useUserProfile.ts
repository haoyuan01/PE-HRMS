"use client";

import { useState, useEffect, useCallback } from "react";
import { userApi } from "@/lib/api/user";
import type { UserProfile } from "@/types/user";

export function useUserProfile(uuid: string | undefined) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!uuid) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await userApi.getProfile(uuid);
      setProfile(response.data);
    } catch {
      setError("Failed to load profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [uuid]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return { profile, isLoading, error, refetch: fetchProfile };
}
