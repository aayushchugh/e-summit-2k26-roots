"use client";
import { useQuery } from "@tanstack/react-query";
import { endpoints } from "@/config";
import { AuthServices } from "@/services";
import { useEffect } from "react";
import { useUserStore } from "@/store";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setIsLoading } = useUserStore();

  const { data, isLoading } = useQuery({
    queryKey: [endpoints.auth.me.query],
    queryFn: AuthServices.getMe,
  });

  useEffect(() => {
    const userFromResponse = data?.data?.payload?.user;
    if (userFromResponse?.email) {
      setUser(userFromResponse);
    } else if (!isLoading && data !== undefined) {
      setUser(null);
    }
    setIsLoading(isLoading);
  }, [data?.data?.payload?.user, setUser, isLoading, setIsLoading]);

  return <>{children}</>;
}
