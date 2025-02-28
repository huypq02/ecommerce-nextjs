"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import ButtonPrimary from "@/shared/Button/ButtonPrimary";
import Input from "@/shared/Input/Input";
import Label from "@/components/Label/Label";
import Select from "@/shared/Select/Select";
import Link from "next/link";

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
  
  // State for user editing
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<User | null>(null);
  const [showEditPage, setShowEditPage] = useState(false);
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editRole, setEditRole] = useState("");
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
  };

  // Close user details modal
  const closeUserDetailsModal = () => {
    setIsUserDetailsModalOpen(false);
    setSelectedUser(null);
  };

  // Open user edit page
  const openEditPage = (user: User) => {
    setSelectedUserForEdit(user);
    setEditEmail(user.email || "");
    setEditRole(user.role.role || "");
    setEditPassword(""); // Don't pre-fill password for security
    setShowEditPage(true);
    setUpdateMessage({ type: "", text: "" });
  };

  // Close user edit page
  const closeEditPage = () => {
    setShowEditPage(false);
    setSelectedUserForEdit(null);
    setUpdateMessage({ type: "", text: "" });
  };

  // Handle user update form submission
  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUserForEdit) return;
    
    setIsUpdating(true);
    setUpdateMessage({ type: "", text: "" });
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setUpdateMessage({ type: "error", text: "You must be logged in as admin" });
        setIsUpdating(false);
        return;
      }
      
      // Prepare request data
      const userData: any = {
        email: editEmail,
        role: editRole
      };
      
      // Only include password if it was changed
      if (editPassword) {
        if (editPassword.length < 6) {
          setUpdateMessage({ type: "error", text: "Password must be at least 6 characters" });
          setIsUpdating(false);
          return;
        }
        userData.password = editPassword;
      }
      
      // Call API to update user
      const response = await axios.patch(
        `http://localhost:8080/users/${selectedUserForEdit.id}`,
        userData,
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );
      
      if (response.status === 200) {
        setUpdateMessage({ type: "success", text: "User updated successfully" });
        
        // Refresh user list after brief delay
        setTimeout(() => {
          fetchUsers();
          closeEditPage();
        }, 1500);
      } else {
        throw new Error(response.data?.message || "Failed to update user");
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
                User Details
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
            </div>
            
            <div className="border-t border-neutral-200 dark:border-neutral-700 p-6 flex justify-end space-x-3">
              <ButtonPrimary onClick={closeUserDetailsModal}>
                Close
              </ButtonPrimary>
            </div>
          </div>
        </div>
      );
    };
  
    // Render main content or edit page
    if (showEditPage) {
      return (
        <div className="nc-AdminUserPage container py-16 lg:pb-28 lg:pt-20">
          <div className="mb-14 flex flex-col sm:flex-row sm:items-center justify-between">
            <div>
              <h2 className="block text-2xl sm:text-3xl lg:text-4xl font-semibold">
                Edit User
              </h2>
              <div className="mt-2 text-neutral-500 dark:text-neutral-400 text-sm sm:text-base">
                Update user information
              </div>
            </div>
            <div className="mt-4 sm:mt-0">
              <ButtonPrimary 
                onClick={closeEditPage}
                className="!bg-neutral-200 !text-neutral-700 dark:!bg-neutral-700 dark:!text-neutral-300"
              >
                Back to User List
              </ButtonPrimary>
            </div>
          </div>
          
          {!selectedUserForEdit ? (
            <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl p-10 text-center">
              <div className="text-xl">User not found</div>
              <ButtonPrimary 
                onClick={closeEditPage}
                className="mt-6"
              >
                Back to User List
              </ButtonPrimary>
            </div>
          ) : (
            <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl p-8">
              {updateMessage.text && (
                <div className={`mb-6 p-4 rounded-lg ${
                  updateMessage.type === "success" 
                    ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
                    : "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                }`}>
                  {updateMessage.text}
                </div>
              )}
              
              <form onSubmit={handleUpdateUser} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <div>
                      <Label>User ID</Label>
                      <Input
                        type="text"
                        className="mt-1.5 bg-neutral-100 dark:bg-neutral-800"
                        value={selectedUserForEdit.id.toString()}
                        disabled
                      />
                    </div>
                    
                    <div className="mt-6">
                      <Label>Email Address</Label>
                      <Input
                        type="email"
                        className="mt-1.5"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        required
                        placeholder="user@example.com"
                      />
                    </div>
                    
                    <div className="mt-6">
                      <Label>New Password (Leave blank to keep unchanged)</Label>
                      <Input
                        type="password"
                        className="mt-1.5"
                        value={editPassword}
                        onChange={(e) => setEditPassword(e.target.value)}
                        placeholder="••••••••"
                        minLength={6}
                      />
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                        {editPassword ? "Must be at least 6 characters" : "Leave blank to keep current password"}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <div>
                      <Label>Role</Label>
                      <Select
                        className="mt-1.5"
                        value={editRole}
                        onChange={(e) => setEditRole(e.target.value)}
                        required
                      >
                        <option value="ROLE_USER">User</option>
                        <option value="ROLE_STAFF">Staff</option>
                        <option value="ROLE_ADMIN">Admin</option>
                      </Select>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                        Sets user permissions level
                      </p>
                    </div>
                    
                    <div className="mt-6">
                      <Label>OAuth Status</Label>
                      <Input
                        type="text"
                        className="mt-1.5 bg-neutral-100 dark:bg-neutral-800"
                        value={selectedUserForEdit.oauthId ? "OAuth Account" : "Password Account"}
                        disabled
                      />
                      {selectedUserForEdit.oauthId && (
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                          Note: OAuth users cannot have their passwords changed manually
                        </p>
                      )}
                    </div>
                    
                    <div className="mt-6">
                      <Label>User Info</Label>
                      <Input
                        type="text"
                        className="mt-1.5 bg-neutral-100 dark:bg-neutral-800"
                        value={selectedUserForEdit.userInfo ? "Has profile information" : "No profile information"}
                        disabled
                      />
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                        User profile data can be edited by the user in their account settings
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-neutral-200 dark:border-neutral-700 pt-8 flex justify-end space-x-4">
                  <ButtonPrimary 
                    type="button"
                    onClick={closeEditPage}
                    className="!bg-neutral-200 !text-neutral-700 dark:!bg-neutral-700 dark:!text-neutral-300"
                  >
                    Cancel
                  </ButtonPrimary>
                  <ButtonPrimary 
                    type="submit"
                    disabled={isUpdating}
                  >
                    {isUpdating ? "Saving Changes..." : "Save Changes"}
                  </ButtonPrimary>
                </div>
              </form>
            </div>
          )}
        </div>
      );
    }
  
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
                            Actions
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
                              <div className="flex space-x-4">
                                <button 
                                  className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                                  onClick={() => openUserDetailsModal(user)}
                                >
                                  View
                                </button>
                                {!user.oauthId && (
                                  <button 
                                    className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                                    onClick={() => openEditPage(user)}
                                  >
                                    Edit
                                  </button>
                                )}
                              </div>
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