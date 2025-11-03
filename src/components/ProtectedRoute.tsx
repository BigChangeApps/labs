import { Navigate } from "react-router-dom";
import { isPrototypeVisible } from "@/data/prototypes";

interface ProtectedRouteProps {
  prototypeId: string;
  children: React.ReactNode;
}

/**
 * Route guard component that prevents access to internal prototypes
 * when VITE_SHOW_INTERNAL is set to false.
 */
export function ProtectedRoute({ prototypeId, children }: ProtectedRouteProps) {
  if (!isPrototypeVisible(prototypeId)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
