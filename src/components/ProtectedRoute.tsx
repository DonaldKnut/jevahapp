import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function loginRedirectPath(
  loginPath: string,
  returnTo: string,
  extraState?: Record<string, string>
) {
  const params = new URLSearchParams();
  if (returnTo) params.set("from", returnTo);
  if (extraState?.intent) params.set("intent", extraState.intent);
  const qs = params.toString();
  return qs ? `${loginPath}?${qs}` : loginPath;
}

export default function ProtectedRoute({
  children,
  requireAdmin = true,
}: {
  children: React.ReactNode;
  /** Admin console gate. Set false for creator studio (any signed-in user). */
  requireAdmin?: boolean;
}) {
  const { isAdmin, isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const returnTo = `${location.pathname}${location.search}${location.hash}`;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F9F8]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#256E63] border-t-transparent" />
          <p className="text-sm text-gray-500">
            {requireAdmin ? "Checking admin session…" : "Checking session…"}
          </p>
        </div>
      </div>
    );
  }

  if (requireAdmin) {
    if (!isAdmin) {
      return (
        <Navigate
          to={loginRedirectPath("/login", returnTo)}
          replace
          state={{ from: returnTo }}
        />
      );
    }
  } else if (!isAuthenticated) {
    return (
      <Navigate
        to={loginRedirectPath("/creators/login", returnTo, {
          intent: "creator",
        })}
        replace
        state={{ from: returnTo, intent: "creator" }}
      />
    );
  }

  return <>{children}</>;
}
