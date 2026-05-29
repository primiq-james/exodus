import type { ReactElement } from "react";
import { Navigate, useLocation } from "react-router-dom";
import {
  getAdminBasePath,
  getValidAdminIdToken,
  isAdminAllowed,
  setAdminPostLoginPath,
} from "../lib/adminAuth";

type Props = {
  children: ReactElement;
};

export default function AdminRoute({ children }: Props) {
  const location = useLocation();
  const token = getValidAdminIdToken();
  const admin = isAdminAllowed();

  if (!token || !admin) {
    setAdminPostLoginPath(location.pathname);
    return <Navigate to={`${getAdminBasePath()}/login`} replace />;
  }

  return children;
}
