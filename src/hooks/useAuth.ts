import { trpc } from "@/providers/trpc";
import { useCallback, useMemo } from "react";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  accountBalance: number;
  balanceMyr?: number;
  balanceIdr?: number;
  roles: string[];
  isActive: boolean;
};

export function useAuth() {
  const utils = trpc.useUtils();

  const {
    data: user,
    isLoading,
    error,
    refetch,
  } = trpc.auth.me.useQuery(undefined, {
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: async () => {
      await utils.invalidate();
      window.location.href = "/login";
    },
  });

  const logout = useCallback(() => logoutMutation.mutate(), [logoutMutation]);

  const isAdmin = user?.roles?.includes("admin") ?? false;

  return useMemo(
    () => ({
      user: (user as AuthUser | undefined) ?? null,
      isAuthenticated: !!user,
      isAdmin,
      isLoading: isLoading || logoutMutation.isPending,
      error,
      logout,
      refresh: refetch,
    }),
    [user, isLoading, logoutMutation.isPending, error, logout, refetch, isAdmin]
  );
}
