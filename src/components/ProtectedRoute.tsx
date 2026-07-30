import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

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
        <Navigate to="/login" replace state={{ from: location.pathname }} />
      );
    }
  } else if (!isAuthenticated) {
    return (
      <Navigate
        to="/creators/login"
        replace
        state={{ from: location.pathname, intent: "creator" }}
      />
    );
  }

  return <>{children}</>;
}
