import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../../assets/logo.png";
import { useToast } from "@/hooks/use-toast";

function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const userRole = localStorage.getItem("userRole");

    if (token) {
      // Verify token validity with the server
      const verifyToken = async () => {
        try {
          // You can add a token verification endpoint call here
          // For now, we'll just check if token exists and redirect based on role
          if (userRole === "admin") {
            navigate("/dashboard");
          } else if (userRole === "user") {
            navigate("/notfound");
          }
        } catch (error) {
          // If token verification fails, clear localStorage
          localStorage.clear();
        }
      };

      verifyToken();
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post(
        "http://www.localhost:5000/api/auth/login",
        {
          identifier,
          password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Login response:", response.data); // Debug log

      if (response.data.success) {
        // Store tokens and user info
        localStorage.setItem("accessToken", response.data.accessToken);

        // Store user info
        localStorage.setItem("userId", response.data.user.id);
        localStorage.setItem("userName", response.data.user.name);
        localStorage.setItem("userEmail", response.data.user.email);
        localStorage.setItem("userRole", response.data.user.role);

        if (rememberMe) {
          // If remember me is checked, we set a longer expiration
          localStorage.setItem("rememberMe", "true");
        }

        // Show success message
        toast({
          title: "Login Successful",
          description: "Welcome back to Kisan Saathi dashboard!",
        });

        // Navigate based on role
        if (response.data.user.role === "admin") {
          navigate("/dashboard");
        } else {
          navigate("/notfound");
        }
      } else {
        // Handle server error message
        toast({
          variant: "destructive",
          title: "Login Failed",
          description:
            response.data.message || "Invalid credentials. Please try again.",
        });
      }
    } catch (error: any) {
      console.error("Login error:", error);

      // More detailed error handling
      let errorMessage = "An error occurred while logging in.";

      if (error.response) {
        console.log("Error response data:", error.response.data);
        console.log("Error response status:", error.response.status);

        if (error.response.status === 401) {
          errorMessage = "Invalid email or password. Please try again.";
        } else if (error.response.status === 429) {
          errorMessage = "Too many login attempts. Please try again later.";
        } else if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        console.log("Error request:", error.request);
        errorMessage = "Server not responding. Please check your connection.";
      }

      // Show error message
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen overflow-auto bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-sm">
        <div className="bg-gray-100 rounded-lg p-6 relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-xl font-medium text-gray-900">
              Welcome Kisan Saathi,
            </h2>
            <p className="text-gray-600">Admin</p>
          </div>
          {/* Decorative illustration */}
          <img
            src={logo}
            alt="kisan saathi logo"
            className="absolute right-0 top-0 h-full w-1/3 object-cover opacity-50"
          />
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="identifier"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email or Phone Number
              </label>
              <input
                id="identifier"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter your email or phone"
                required
                disabled={isLoading}
                autoComplete="username"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Enter your password"
                required
                disabled={isLoading}
                autoComplete="current-password"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              disabled={isLoading}
            />
            <label
              htmlFor="remember-me"
              className="ml-2 block text-sm text-gray-900"
            >
              Keep me logged in
            </label>
          </div>

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-70"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  LOGGING IN...
                </>
              ) : (
                "LOGIN"
              )}
            </button>
          </div>

          <div className="text-center">
            <a href="#" className="text-sm text-gray-600 hover:text-green-500">
              Forgot your password?
            </a>
          </div>
        </form>

        <div className="text-center text-sm text-gray-500">
          © {new Date().getFullYear()} - Kisan Saathi Dashboard
        </div>
      </div>
    </div>
  );
}

export default Login;
