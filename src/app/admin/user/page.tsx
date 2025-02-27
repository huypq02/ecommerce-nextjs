"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import Input from "@/shared/Input/Input";
import Label from "@/components/Label/Label";
import Select from "@/shared/Select/Select";

// Define interfaces based on API responses
interface Role {
  id: number;
  role: string;
}

interface UserInfo {
  id?: number;
  fullName?: string;
  gender?: string;
  birthday?: string;
  address?: string;
  phone?: string;
  description?: string;
}

interface User {
  id: number;
  oauthId?: string;
  email: string;
  password?: string;
  role: Role;
  userInfo?: UserInfo | null;
}

interface ApiResponse {
  code: number;
  message: string | null;
  data: User[] | any;
}

  const AdminUserPage = () => {
  // Add this at the top of your component, before the return statement:
  const emailInputRef = React.useRef<HTMLInputElement>(null);
  const passwordInputRef = React.useRef<HTMLInputElement>(null);
  const confirmPasswordInputRef = React.useRef<HTMLInputElement>(null);

  // State for user form
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("ROLE_STAFF");
  
  // State for users list
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  
  // State for pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  
  // State for search/filter
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("");
  
  // State for user details modal
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isUserDetailsModalOpen, setIsUserDetailsModalOpen] = useState(false);
  
  // State for editing user
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    role: ""
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState({ type: "", text: "" });
  
  const router = useRouter();

  // Check if user is admin and fetch users on load
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    
    fetchUsers();
  }, [router]);

  // Fetch users from API
  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    setMessage({ type: "", text: "" });
    
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get<ApiResponse>(
        "http://localhost:8080/users",
        {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        }
      );
      
      if (response.data.code === 200) {
        setUsers(response.data.data);
      } else {
        setMessage({ type: "error", text: "Failed to fetch users" });
      }
    } catch (error: any) {
      console.error("Error fetching users:", error);
      setMessage({ 
        type: "error", 
        text: error.response?.data?.message || "Error fetching users. Please try again." 
      });
    } finally {
      setIsLoadingUsers(false);
    }
  };

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
        setMessage({ type: "success", text: `Successfully registered new ${role.replace('ROLE_', '').toLowerCase()} user` });
        // Reset form
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setRole("ROLE_STAFF");
        
        // Refresh user list
        fetchUsers();
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

  // Open modal with user details
  const openUserDetailsModal = (user: User) => {
    setSelectedUser(user);
    setIsUserDetailsModalOpen(true);
    setIsEditing(false);
    setUpdateMessage({ type: "", text: "" });
  };

  // Close user details modal
  const closeUserDetailsModal = () => {
    setIsUserDetailsModalOpen(false);
    setSelectedUser(null);
    setIsEditing(false);
    setUpdateMessage({ type: "", text: "" });
  };

  // Start editing a user
  const startEditing = React.useCallback(() => {
    if (!selectedUser) return;
    
    // Set form data once
    setEditFormData({
      email: selectedUser.email || "",
      password: "",
      confirmPassword: "",
      role: selectedUser.role.role
    });
    
    // Set editing mode
    setIsEditing(true);
    setUpdateMessage({ type: "", text: "" });
    
    // Focus on the email field after a slight delay to ensure render is complete
    setTimeout(() => {
      if (emailInputRef.current) {
        emailInputRef.current.focus();
      }
    }, 100);
  }, [selectedUser]);

  // Handle edit form changes
  const handleEditFormChange = React.useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Use functional update to ensure we always have the latest state
    setEditFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  }, []);

  // Handle updating user
  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset update message
    setUpdateMessage({ type: "", text: "" });
    
    // Basic validation
    if (editFormData.password && editFormData.password !== editFormData.confirmPassword) {
      setUpdateMessage({ type: "error", text: "Passwords do not match" });
      return;
    }

    if (editFormData.password && editFormData.password.length < 6) {
      setUpdateMessage({ type: "error", text: "Password must be at least 6 characters" });
      return;
    }
    
    if (!selectedUser) return;
    
    setIsUpdating(true);
    
    try {
      const token = localStorage.getItem("token");
      
      // Prepare update data - only include fields that have values
      const updateData: any = {};
      
      if (editFormData.email && editFormData.email !== selectedUser.email) {
        updateData.email = editFormData.email;
      }
      
      if (editFormData.password) {
        updateData.password = editFormData.password;
      }
      
      if (editFormData.role && editFormData.role !== selectedUser.role.role) {
        updateData.role = editFormData.role;
      }
      
      // Only make the API call if there are changes
      if (Object.keys(updateData).length === 0) {
        setUpdateMessage({ type: "info", text: "No changes were made" });
        setIsUpdating(false);
        return;
      }
      
      // Call API to update the user
      const response = await axios.patch<ApiResponse>(
        `http://localhost:8080/users/${selectedUser.id}`,
        updateData,
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );
      
      if (response.data.code === 200) {
        setUpdateMessage({ type: "success", text: "User updated successfully" });
        
        // Update the local user list to reflect changes
        setUsers(users.map(user => 
          user.id === selectedUser.id 
            ? { 
                ...user, 
                email: updateData.email || user.email,
                role: updateData.role 
                  ? { id: user.role.id, role: updateData.role } 
                  : user.role 
              } 
            : user
        ));
        
        // Update the selected user data
        if (selectedUser) {
          setSelectedUser({
            ...selectedUser,
            email: updateData.email || selectedUser.email,
            role: updateData.role 
              ? { id: selectedUser.role.id, role: updateData.role } 
              : selectedUser.role
          });
        }
        
        // Reset the form
        setEditFormData({
          email: updateData.email || selectedUser.email || "",
          password: "",
          confirmPassword: "",
          role: updateData.role || selectedUser.role.role
        });
        
        // Exit edit mode after a successful update
        setTimeout(() => {
          setIsEditing(false);
        }, 2000);
        
      } else {
        setUpdateMessage({ 
          type: "error", 
          text: response.data.message || "Failed to update user" 
        });
      }
    } catch (error: any) {
      console.error("Error updating user:", error);
      setUpdateMessage({ 
        type: "error", 
        text: error.response?.data?.message || "Error updating user. Please try again." 
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Format date from API to display nicely
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not set";
    
    try {
      // Handle both date-only and datetime formats
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (e) {
      return dateString;
    }
  };

  // Filter users based on search term and role filter
  const filteredUsers = users.filter(user => {
    const matchesSearch = searchTerm === "" || 
      (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.userInfo?.fullName && user.userInfo.fullName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRole = filterRole === "" || user.role.role === filterRole;
    
    return matchesSearch && matchesRole;
  });
  
  // Paginate users
  const paginatedUsers = filteredUsers.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );
  
  const totalPages = Math.ceil(filteredUsers.length / pageSize);

  // User Details Modal Component
  const UserDetailsModal = () => {
    if (!selectedUser) return null;
    
    return (
      <div className="fixed inset-0 bg-neutral-900 bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl max-w-lg w-full mx-auto overflow-hidden">
          <div className="flex justify-between items-center p-6 border-b border-neutral-200 dark:border-neutral-700">
            <h3 className="text-xl font-semibold">
              {isEditing ? "Edit User" : "User Details"}
            </h3>
            <button 
              onClick={closeUserDetailsModal}
              className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="p-6">
            {isEditing ? (
              /* Edit Form */
              <>
                {updateMessage.text && (
                  <div className={`mb-6 p-4 rounded-lg ${
                    updateMessage.type === "success"
                      ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : updateMessage.type === "info"
                        ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                        : "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                  }`}>
                    {updateMessage.text}
                  </div>
                )}
                
                <form onSubmit={handleUpdateUser} className="space-y-4">
                  <div>
                    <Label>User ID</Label>
                    <Input
                      type="text"
                      className="mt-1.5"
                      value={selectedUser.id}
                      disabled
                    />
                  </div>

                  <div>
                    <Label>Email Address</Label>
                    <Input
                      type="email"
                      name="email"
                      className="mt-1.5"
                      value={editFormData.email}
                      onChange={handleEditFormChange}
                      placeholder="user@example.com"
                      autoComplete="off"
                      ref={emailInputRef}
                    />
                  </div>

                  <div>
                    <Label>New Password (leave blank to keep current)</Label>
                    <Input
                      type="password"
                      name="password"
                      className="mt-1.5"
                      value={editFormData.password}
                      onChange={handleEditFormChange}
                      placeholder="••••••••"
                      minLength={editFormData.password ? 6 : 0}
                      autoComplete="new-password"
                      ref={passwordInputRef}
                    />
                    {editFormData.password && (
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                        Must be at least 6 characters
                      </p>
                    )}
                  </div>

                  {editFormData.password && (
                    <div>
                      <Label>Confirm New Password</Label>
                      <Input
                        type="password"
                        name="confirmPassword"
                        className="mt-1.5"
                        value={editFormData.confirmPassword}
                        onChange={handleEditFormChange}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        ref={confirmPasswordInputRef}
                      />
                    </div>
                  )}
                  <div>
                    <Label>Role</Label>
                    <Select
                      name="role"
                      className="mt-1.5"
                      value={editFormData.role}
                      onChange={handleEditFormChange}
                      required
                      key="role-select" // Add unique key
                    >
                      <option value="ROLE_USER">User</option>
                      <option value="ROLE_STAFF">Staff</option>
                      <option value="ROLE_ADMIN">Admin</option>
                    </Select>
                  </div>                  
                  {selectedUser.oauthId && (
                    <div className="pt-2">
                      <div className="p-4 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-lg">
                        <div className="flex">
                          <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          <div>
                            <p className="font-medium">OAuth User</p>
                            <p className="text-sm mt-1">
                              This user signed up with OAuth. Email and password changes may not apply to their external authentication method.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-end space-x-3 pt-3">
                    <ButtonPrimary 
                      type="button" 
                      className="!bg-neutral-200 !text-neutral-700 dark:!bg-neutral-700 dark:!text-neutral-300 hover:!bg-neutral-300 dark:hover:!bg-neutral-600" 
                      onClick={() => setIsEditing(false)}
                    >
                      Cancel
                    </ButtonPrimary>
                    <ButtonPrimary 
                      type="submit"
                      disabled={isUpdating}
                    >
                      {isUpdating ? "Saving..." : "Save Changes"}
                    </ButtonPrimary>
                  </div>
                </form>
              </>
            ) : (
              /* User Details View */
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">ID</p>
                    <p className="mt-1">{selectedUser.id}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Email</p>
                    <p className="mt-1">{selectedUser.email || "No email"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Role</p>
                    <p className="mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        selectedUser.role.role === 'ROLE_ADMIN'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          : selectedUser.role.role === 'ROLE_STAFF'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      }`}>
                        {selectedUser.role.role.replace('ROLE_', '')}
                      </span>
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Auth Type</p>
                    <p className="mt-1">{selectedUser.oauthId ? "OAuth" : "Password"}</p>
                  </div>
                </div>
                
                {selectedUser.userInfo ? (
                  <div className="mt-6">
                    <h4 className="text-lg font-medium mb-4">Personal Information</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Full Name</p>
                        <p className="mt-1">{selectedUser.userInfo.fullName || "Not set"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Gender</p>
                        <p className="mt-1">{selectedUser.userInfo.gender || "Not set"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Birthday</p>
                        <p className="mt-1">{formatDate(selectedUser.userInfo.birthday)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Phone</p>
                        <p className="mt-1">{selectedUser.userInfo.phone || "Not set"}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Address</p>
                        <p className="mt-1">{selectedUser.userInfo.address || "Not set"}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Description</p>
                        <p className="mt-1">{selectedUser.userInfo.description || "Not set"}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-6 text-center py-4 text-neutral-500 dark:text-neutral-400">
                    No additional user information available
                  </div>
                )}
              </>
            )}
          </div>
          
          <div className="border-t border-neutral-200 dark:border-neutral-700 p-6 flex justify-end space-x-3">
            {!isEditing && (
              <ButtonPrimary 
                onClick={startEditing}
                className="!bg-blue-600 hover:!bg-blue-700 dark:!bg-blue-700 dark:hover:!bg-blue-800"
              >
                Edit User
              </ButtonPrimary>
            )}
            <ButtonPrimary 
              onClick={closeUserDetailsModal}
              className={isEditing ? "!bg-neutral-200 !text-neutral-700 dark:!bg-neutral-700 dark:!text-neutral-300" : ""}
            >
              Close
            </ButtonPrimary>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="nc-AdminUserPage container py-16 lg:pb-28 lg:pt-20">
      <div className="mb-14 lg:mb-16">
        <h2 className="block text-2xl sm:text-3xl lg:text-4xl font-semibold">
          User Management
        </h2>
        <div className="mt-3 sm:mt-5 text-neutral-500 dark:text-neutral-400 text-sm sm:text-base">
          Create new users and manage existing accounts
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User Creation Form */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl p-6">
            <h3 className="text-xl font-semibold mb-6">Register New User</h3>
            
            {message.text && (
              <div className={`mb-6 p-4 rounded-lg ${
                message.type === "success" 
                  ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
                  : "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400"
              }`}>
                {message.text}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-5">
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
                  <option value="ROLE_USER">User</option>
                </Select>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  Select appropriate access level
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
                <strong>User:</strong> Standard customer account.
              </p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                <strong>Staff:</strong> Can manage products and orders.
              </p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                <strong>Admin:</strong> Has full access to all features.
              </p>
            </div>
          </div>
        </div>
        
        {/* User List */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">User Accounts</h3>
              <div className="flex items-center mt-4 sm:mt-0">
                <ButtonPrimary 
                  onClick={fetchUsers}
                  className="text-sm h-10 px-4"
                >
                  Refresh List
                </ButtonPrimary>
              </div>
            </div>
            
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
              <div className="flex-grow">
                <Input
                  type="text"
                  placeholder="Search by email or name"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="w-full sm:w-48">
                <Select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                >
                  <option value="">All Roles</option>
                  <option value="ROLE_USER">Users</option>
                  <option value="ROLE_STAFF">Staff</option>
                  <option value="ROLE_ADMIN">Admins</option>
                </Select>
              </div>
            </div>
            
            {/* Users Table */}
            {isLoadingUsers ? (
              <div className="flex justify-center items-center py-10">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-neutral-300 border-t-primary-600"></div>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-700">
                    <thead className="bg-neutral-50 dark:bg-neutral-800">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">
                          ID
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">
                          Email
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">
                          Role
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">
                          Full Name
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">
                          Phone
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">
                          Auth Type
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-300 uppercase tracking-wider">
                          Details
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-neutral-900 divide-y divide-neutral-200 dark:divide-neutral-700">
                      {paginatedUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800 transition duration-150">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-300">
                            {user.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900 dark:text-white">
                            {user.email || "No email"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-300">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user.role.role === 'ROLE_ADMIN'
                                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                : user.role.role === 'ROLE_STAFF'
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                  : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            }`}>
                              {user.role.role.replace('ROLE_', '')}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-300">
                            {user.userInfo?.fullName || "Not set"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-300">
                            {user.userInfo?.phone || "Not set"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-300">
                            {user.oauthId ? "OAuth" : "Password"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-300">
                            <button 
                              className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                              onClick={() => openUserDetailsModal(user)}
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {filteredUsers.length === 0 && (
                  <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
                    No users found
                  </div>
                )}
                
                {/* Pagination */}
                <div className="flex items-center justify-between border-t border-neutral-200 dark:border-neutral-700 mt-6 pt-6">
                  <div className="text-sm text-neutral-700 dark:text-neutral-300">
                    Showing {paginatedUsers.length > 0 ? currentPage * pageSize + 1 : 0} to {Math.min((currentPage + 1) * pageSize, filteredUsers.length)} of {filteredUsers.length} users
                  </div>
                  <div className="flex items-center space-x-4">
                    <select 
                      className="form-select rounded-md border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 dark:bg-neutral-800"
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(parseInt(e.target.value));
                        setCurrentPage(0);
                      }}
                    >
                      <option value="5">5 per page</option>
                      <option value="10">10 per page</option>
                      <option value="20">20 per page</option>
                      <option value="50">50 per page</option>
                    </select>
                    
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                        disabled={currentPage === 0}
                        className={`px-3 py-1 rounded-md ${
                          currentPage === 0
                            ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-600 cursor-not-allowed"
                            : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                        }`}
                      >
                        Previous
                      </button>
                      <span className="text-neutral-700 dark:text-neutral-300">
                        Page {currentPage + 1} of {totalPages || 1}
                      </span>
                      <button 
                        onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                        disabled={currentPage >= totalPages - 1}
                        className={`px-3 py-1 rounded-md ${
                          currentPage >= totalPages - 1
                            ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-600 cursor-not-allowed"
                            : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                        }`}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* User Details Modal */}
      {isUserDetailsModalOpen && <UserDetailsModal />}
    </div>
  );
};

export default AdminUserPage;