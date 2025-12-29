import { Navigate } from "react-router-dom";
import { useAuth } from "../../authentication/AuthContext.jsx";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  console.log("ProtectedRoute rendered");
  console.log("User:", user);
  console.log("Loading:", loading);

  if (loading) {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <div className="animate-spin rounded-full h-14 w-14 border-4 border-gray-300 border-t-green-600"></div>
      <p className="mt-4 text-gray-700 font-medium">Loading your dashboard...</p>
    </div>
  );
}


  return user ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
