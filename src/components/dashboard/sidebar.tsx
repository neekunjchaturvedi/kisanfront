import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  Tags,
  LogOut,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import logo from "../../assets/logo.png";
import { Category } from "@/types/product";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";

const sidebarItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    title: "All Products",
    icon: Package,
    href: "/products",
  },
  {
    title: "Order List",
    icon: ClipboardList,
    href: "/orders",
  },
];

const mockCategories: Category[] = [
  { id: "1", name: "Lorem Ipsum", count: 24 },
  { id: "2", name: "Lorem Ipsum", count: 32 },
  { id: "3", name: "Lorem Ipsum", count: 18 },
  { id: "4", name: "Lorem Ipsum", count: 12 },
  { id: "5", name: "Lorem Ipsum", count: 8 },
  { id: "6", name: "Lorem Ipsum", count: 16 },
];

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);

      // Get the token from localStorage
      const token = localStorage.getItem("accessToken");

      // Call the logout API
      await axios.post(
        "http://www.localhost:5000/api/auth/logout",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Remove user data from localStorage
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userId");
      localStorage.removeItem("userEmail");

      // Show success notification
      toast({
        description: "Logged out successfully!",
      });

      // Redirect to login page
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);

      // Even if the API call fails, we should still clear local storage and redirect
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userId");
      localStorage.removeItem("userEmail");

      toast({
        variant: "destructive",
        description:
          "An error occurred during logout. You've been logged out locally.",
      });

      navigate("/login");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="flex h-screen flex-col border-r">
      <div className="p-2">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <img src={logo} alt="logo" className="max-w-[75%]" />
        </Link>
      </div>
      <ScrollArea className="flex-1 px-3">
        <div className="space-y-1">
          {sidebarItems.map((item) => (
            <Button
              key={item.href}
              variant={location.pathname === item.href ? "default" : "ghost"}
              className={cn("w-full justify-start gap-2", {
                "bg-[#007537] text-primary-foreground":
                  location.pathname === item.href,
              })}
              asChild
            >
              <Link to={item.href}>
                <item.icon className="h-4 w-4" />
                {item.title}
              </Link>
            </Button>
          ))}

          {/* Collapsible Categories section - commented out in original */}
        </div>
      </ScrollArea>
      <div className="p-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2"
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          <LogOut className="h-4 w-4" />
          {isLoggingOut ? "Logging out..." : "Logout"}
        </Button>
      </div>
    </div>
  );
}
