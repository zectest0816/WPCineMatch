"use client"

import { useState, useEffect } from "react"
import { userApi } from "./api"
import "./styles/profile.css"
import Navbar from "./Navbar";


const Profile = () => {
  // State for user data
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // State for edit mode
  const [isEditing, setIsEditing] = useState(false)
  const [editedUser, setEditedUser] = useState({})

  // State for password change
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  // State for delete account confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Fetch user data on component mount
  console.log("Fetching user data...")
  const userId = localStorage.getItem('userId');
  console.log("userId", userId)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        console.log("Fetching user data from mockdata.json...");
  
        // Fetch the mock data
        const response = await fetch("/mockdata.json");
        const userData = await response.json();
  
        setUser(userData);
        console.log("Fetched user data:", userData);
        setEditedUser(userData);
      } catch (err) {
        setError("Failed to load profile data. Please try again later.");
        console.error("Error fetching user data:", err);
      } finally {
        setLoading(false);
      }
    };
  
    fetchUserData();
  }, []);

  // Handle input changes for profile edit
  const handleEditChange = (e) => {
    const { name, value } = e.target
    setEditedUser((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Handle password form input changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Save profile changes
  const saveProfileChanges = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      await userApi.updateProfile(editedUser)
      setUser(editedUser)
      setIsEditing(false)
      alert("Profile updated successfully!")
    } catch (err) {
      alert("Failed to update profile. Please try again.")
      console.error("Error updating profile:", err)
    } finally {
      setLoading(false)
    }
  }

  // Change password
  const changePassword = async (e) => {
    e.preventDefault()

    // Validation
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New passwords do not match!")
      return
    }

    if (passwordData.newPassword.length < 6) {
      alert("Password must be at least 6 characters long!")
      return
    }

    try {
      setLoading(true)
      await userApi.changePassword(passwordData)
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
      setShowPasswordForm(false)
      alert("Password changed successfully!")
    } catch (err) {
      alert("Failed to change password. Please check your current password and try again.")
      console.error("Error changing password:", err)
    } finally {
      setLoading(false)
    }
  }

  // Delete account
  const deleteAccount = async () => {
    try {
      setLoading(true)
      await userApi.deleteAccount()
      alert("Account deleted successfully!")
      // Redirect to login page or home page after deletion
      window.location.href = "/login"
    } catch (err) {
      alert("Failed to delete account. Please try again.")
      console.error("Error deleting account:", err)
    } finally {
      setLoading(false)
    }
  }

  if (loading && !user) {
    return (
      <div className="netflix-profile">
        <div className="loading-spinner">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="netflix-profile">
        <div className="error-message">{error}</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="netflix-profile">
        <div className="error-message">User not found. Please log in again.</div>
      </div>
    )
  }

  return (
    
    <div className="netflix-profile">
        <Navbar className="navbar navbar-dark bg-black border-bottom border-secondary px-3">
        <a className="navbar-brand fw-bold fs-3 text-danger" href="#">
          🎬 MovieExplorer
        </a>
        <button
          className="btn btn-outline-light ms-auto"
          onClick={() => navigate("/search")}
        >
          🔍 Search
        </button>
      </Navbar>
      <div className="profile-header">
        <h1>Account</h1>
        <div className="membership-since">
          <span>Member since {new Date(user.createdAt).toLocaleDateString()}</span>
          <span className="plan-badge">{user.plan || "Standard"}</span>
        </div>
      </div>

      <div className="profile-section">
        <h2>Profile</h2>

        {!isEditing ? (
          <div className="profile-info">
            <div className="info-row">
              <div className="info-label">Name</div>
              <div className="info-value">{user.name}</div>
            </div>
            <div className="info-row">
              <div className="info-label">Email</div>
              <div className="info-value">{user.email}</div>
            </div>
            <div className="info-row">
              <div className="info-label">Phone</div>
              <div className="info-value">{user.phoneNumber || "Not provided"}</div>
            </div>
            <button className="netflix-button secondary" onClick={() => setIsEditing(true)} disabled={loading}>
              Edit Profile
            </button>
          </div>
        ) : (
          <form className="edit-form" onSubmit={saveProfileChanges}>
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={editedUser.name || ""}
                onChange={handleEditChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={editedUser.email || ""}
                onChange={handleEditChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="phoneNumber">Phone</label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={editedUser.phoneNumber || ""}
                onChange={handleEditChange}
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="netflix-button primary" disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </button>
              <button
                type="button"
                className="netflix-button secondary"
                onClick={() => {
                  setIsEditing(false)
                  setEditedUser({ ...user })
                }}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="profile-section">
        <h2>Security</h2>

        {!showPasswordForm ? (
          <button className="netflix-button secondary" onClick={() => setShowPasswordForm(true)} disabled={loading}>
            Change Password
          </button>
        ) : (
          <form className="password-form" onSubmit={changePassword}>
            <div className="form-group">
              <label htmlFor="currentPassword">Current Password</label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                required
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="netflix-button primary" disabled={loading}>
                {loading ? "Updating..." : "Update Password"}
              </button>
              <button
                type="button"
                className="netflix-button secondary"
                onClick={() => {
                  setShowPasswordForm(false)
                  setPasswordData({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                  })
                }}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="profile-section danger-zone">
        <h2>Account Management</h2>

        {!showDeleteConfirm ? (
          <button className="netflix-button danger" onClick={() => setShowDeleteConfirm(true)} disabled={loading}>
            Delete Account
          </button>
        ) : (
          <div className="delete-confirmation">
            <p>Are you sure you want to delete your account? This action cannot be undone.</p>
            <div className="form-actions">
              <button className="netflix-button danger" onClick={deleteAccount} disabled={loading}>
                {loading ? "Deleting..." : "Yes, Delete My Account"}
              </button>
              <button
                className="netflix-button secondary"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Profile
