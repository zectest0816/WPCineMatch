"use client"

import { useState, useEffect } from "react"
import { userApi } from "./api"
import "./styles/profile.css"
import Navbar from "./Navbar"
import { useNavigate } from "react-router-dom"

const Profile = () => {
  const navigate = useNavigate()

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
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true)
        const userEmail = localStorage.getItem("userEmail")

        if (!userEmail) {
          setError("User not logged in. Please log in to view profile.")
          navigate("/login")
          return
        }

        console.log("Fetching user data for email:", userEmail)

        // First, try to get user by email to get the userId
        try {
          const response = await fetch(`http://localhost:3001/users/by-email/${userEmail}`)
          if (response.ok) {
            const userData = await response.json()
            console.log("Fetched user data:", userData)

            // Store the userId for future use
            if (userData._id) {
              localStorage.setItem("userId", userData._id)
            }

            setUser(userData)
            setEditedUser(userData)
          } else {
            throw new Error("User not found")
          }
        } catch (emailError) {
          console.log("Email lookup failed, trying direct user lookup...")

          // Fallback: try to get user data directly if we have userId
          const userId = localStorage.getItem("userId")
          if (userId) {
            const userData = await userApi.getUserProfile(userId)
            setUser(userData)
            setEditedUser(userData)
          } else {
            throw new Error("Cannot find user data")
          }
        }
      } catch (err) {
        setError("Failed to load profile data. Please try again later.")
        console.error("Error fetching user data:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [navigate])

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

      // Use the existing updateProfile function from your api.js
      const updatedUser = await userApi.updateProfile(user._id, editedUser)
      setUser(updatedUser)
      setEditedUser(updatedUser)
      setIsEditing(false)
      alert("Profile updated successfully!")
    } catch (err) {
      alert(`Failed to update profile: ${err.message}`)
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

      // Use the existing changePassword function from your api.js
      await userApi.changePassword(user._id, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      })

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
      setShowPasswordForm(false)
      alert("Password changed successfully!")
    } catch (err) {
      alert(`Failed to change password: ${err.message}`)
      console.error("Error changing password:", err)
    } finally {
      setLoading(false)
    }
  }

  // Delete account
  const deleteAccount = async () => {
    try {
      setLoading(true)

      // Use the existing deleteAccount function from your api.js
      await userApi.deleteAccount(user._id)
      alert("Account deleted successfully!")
      // Clear local storage
      localStorage.removeItem("userId")
      localStorage.removeItem("userEmail")
      // Redirect to login page after deletion
      navigate("/login")
    } catch (err) {
      alert(`Failed to delete account: ${err.message}`)
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
      <Navbar />
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
