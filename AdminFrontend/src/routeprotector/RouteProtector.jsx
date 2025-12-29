import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../authentication/AuthContext";

const ProtectedRoute = () => {
  const { admin, loading } = useAuth();

  if (loading) return <p>Loading...</p>;

  return admin ? <Outlet /> : <Navigate to="/" replace />;
};

export default ProtectedRoute;
