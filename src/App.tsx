import {
  Routes,
  Route,
  BrowserRouter as Router,
  useLocation,
  Navigate,
  Outlet,
} from "react-router-dom";
import { Sidebar } from "./components/dashboard/sidebar";
import { ProductsPage } from "./pages/products";
import { OrdersPage } from "./pages/orders";
import { BellIcon } from "lucide-react";
import { Button } from "./components/ui/button";
import { DashboardPage } from "./pages/dashboard";
import AddProductPage from "./pages/addproduct";

import Login from "./components/login/Login";
import { useEffect } from "react";
// You'll need to create this page

// Auth check function
const isAuthenticated = () => {
  return localStorage.getItem("accessToken") !== null;
};

// Admin check function
const isAdmin = () => {
  return localStorage.getItem("userRole") === "admin";
};

// Protected Route component - redirects to login if not authenticated
function ProtectedRoute() {
  const isAuth = isAuthenticated();

  if (!isAuth) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

// Admin Route component - redirects to not-authorized if not admin
function AdminRoute() {
  const isAuth = isAuthenticated();
  const adminCheck = isAdmin();

  if (!isAuth) {
    return <Navigate to="/" replace />;
  }

  if (!adminCheck) {
    return <Navigate to="/not-authorized" replace />;
  }

  return <Outlet />;
}

// Layout component with Sidebar and Header
function DashboardLayout() {
  return (
    <div className="flex h-screen bg-background">
      <div className="w-[14rem] flex-none">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 border-b flex items-center justify-between px-6">
          <h1 className="font-bold text-[#007537] text-xl">Kisan Saathi</h1>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon">
              <BellIcon className="h-5 w-5" />
            </Button>
            <div className="h-8 w-8 rounded-full bg-primary">
              {/* You could display user initials here */}
              <span className="sr-only">User profile</span>
            </div>
          </div>
        </header>
        <Outlet />
      </div>
    </div>
  );
}

// Simple full-width layout for auth pages
function AuthLayout() {
  return <Outlet />;
}

function AppContent() {
  const location = useLocation();

  // Check for token expiration and role validity on route changes
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const role = localStorage.getItem("userRole");

    if (token) {
      // Basic validation - in a real app, you'd want to validate the JWT token
      if (!role || (role !== "admin" && role !== "user")) {
        // Invalid role, clear localStorage and redirect to login
        localStorage.clear();
        window.location.href = "/"; // Force a full page reload
      }

      // You could add JWT expiration validation here
      // If token is expired, clear localStorage and redirect
    }
  }, [location]);

  return (
    <Routes>
      {/* Auth routes with full-width layout */}
      <Route element={<AuthLayout />}>
        <Route
          path="/"
          element={
            isAuthenticated() ? <Navigate to="/dashboard" replace /> : <Login />
          }
        />
      </Route>

      {/* Not Authorized Page - accessible to authenticated users */}
      <Route element={<ProtectedRoute />}>
        <Route
          path="/not-authorized"
          element={
            <div className="h-screen flex items-center justify-center bg-gray-50">
              <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-sm text-center">
                <h1 className="text-2xl font-bold text-red-600 mb-4">
                  Access Denied
                </h1>
                <p className="mb-6">
                  You don't have permission to access the admin dashboard.
                </p>
                <button
                  onClick={() => {
                    localStorage.clear();
                    window.location.href = "/";
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Back to Login
                </button>
              </div>
            </div>
          }
        />
      </Route>

      {/* Admin-only routes with dashboard layout */}
      <Route element={<AdminRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/addproduct" element={<AddProductPage />} />
          <Route path="/orders" element={<OrdersPage />} />
        </Route>
      </Route>

      {/* Fallback route - redirect to dashboard if authenticated, otherwise to login */}
      <Route
        path="*"
        element={
          isAuthenticated() ? (
            isAdmin() ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/not-authorized" replace />
            )
          ) : (
            <Navigate to="/" replace />
          )
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
