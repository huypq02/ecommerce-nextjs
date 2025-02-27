"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import Input from "@/shared/Input/Input";
import Label from "@/components/Label/Label";
import Select from "@/shared/Select/Select";

// Define interfaces
interface User {
  id: number;
  email: string;
  role: string;
  createdAt: string;
}

interface ApiResponse {
  code: number;
  message: string;
  data: any;
}

const AdminUserPage = () => {
  // State for user form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("ROLE_STAFF");
  
  // State for users list (if you want to display existing users)
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  
  const router = useRouter();

  // Check if user is admin
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    }
    // In a real app, you'd verify the token has admin privileges
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset message
    setMessage({ type: "", text: "" });
    
    // Validate form
    if (password !== confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match" });
      return;
    }

    if (password.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters" });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMessage({ type: "error", text: "You must be logged in as admin" });
        setIsSubmitting(false);
        return;
      }
      
      // Prepare request data
      const userData = {
        email,
        password,
        role
      };
      
      // Call API to register new staff/admin
      const response = await axios.post<ApiResponse>(
        "http://localhost:8080/register/staff",
        userData,
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );
      
      if (response.data.code === 200) {
        setMessage({ type: "success", text: `Successfully registered new ${role === "ROLE_ADMIN" ? "admin" : "staff"} user` });
        // Reset form
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setRole("ROLE_STAFF");
        
        // Optionally refresh user list if you implement that feature
        // fetchUsers();
      } else {
        setMessage({ type: "error", text: response.data.message || "Failed to register user" });
      }
    } catch (error: any) {
      console.error("Error registering user:", error);
      setMessage({ 
        type: "error", 
        text: error.response?.data?.message || "Error registering user. Please try again." 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="nc-AdminUserPage container py-16 lg:pb-28 lg:pt-20">
      <div className="mb-14 lg:mb-16">
        <h2 className="block text-2xl sm:text-3xl lg:text-4xl font-semibold">
          User Management
        </h2>
        <div className="mt-3 sm:mt-5 text-neutral-500 dark:text-neutral-400 text-sm sm:text-base">
          Create new staff and admin users
        </div>
      </div>
      
      <div className="max-w-lg mx-auto">
        <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl p-8">
          <h3 className="text-xl sm:text-2xl font-semibold mb-6">Register New User</h3>
          
          {message.text && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.type === "success" 
                ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
                : "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400"
            }`}>
              {message.text}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label>Email Address</Label>
              <Input
                type="email"
                className="mt-1.5"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="staff@example.com"
              />
            </div>
            
            <div>
              <Label>Password</Label>
              <Input
                type="password"
                className="mt-1.5"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                minLength={6}
              />
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Must be at least 6 characters
              </p>
            </div>
            
            <div>
              <Label>Confirm Password</Label>
              <Input
                type="password"
                className="mt-1.5"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>
            
            <div>
              <Label>Role</Label>
              <Select
                className="mt-1.5"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
              >
                <option value="ROLE_STAFF">Staff</option>
                <option value="ROLE_ADMIN">Admin</option>
              </Select>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Staff can manage products and orders. Admins have full access.
              </p>
            </div>
            
            <ButtonPrimary 
              className="w-full"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Registering..." : "Register User"}
            </ButtonPrimary>
          </form>

          <div className="mt-6 border-t border-neutral-200 dark:border-neutral-700 pt-6">
            <h4 className="text-lg font-medium mb-2">About User Roles</h4>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              <strong>Staff:</strong> Can manage products, process orders, and handle customer inquiries.
            </p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              <strong>Admin:</strong> Has full access including user management and system settings.
            </p>
          </div>
        </div>
      </div>
      
      {/* You can add a user list section here if needed */}
    </div>
  );
};

export default AdminUserPage;