const express = require("express")
const bcrypt = require("bcryptjs")
const User = require("../models/User")
const router = express.Router()

// GET user profile by ID
router.get("/profile/:userId", async (req, res) => {
  try {
    const { userId } = req.params

    const user = await User.findById(userId).select("-password")

    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    res.json(user)
  } catch (error) {
    console.error("Error fetching user profile:", error)
    res.status(500).json({ error: "Failed to fetch user profile" })
  }
})

// PUT update user profile
router.put("/profile/:userId", async (req, res) => {
  try {
    const { userId } = req.params
    const updateData = req.body

    // Remove sensitive fields that shouldn't be updated directly
    delete updateData.password
    delete updateData._id
    delete updateData.createdAt

    const user = await User.findByIdAndUpdate(
      userId,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true },
    ).select("-password")

    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    res.json({ success: true, message: "Profile updated successfully", user })
  } catch (error) {
    console.error("Error updating user profile:", error)
    if (error.name === "ValidationError") {
      return res.status(400).json({ error: error.message })
    }
    res.status(500).json({ error: "Failed to update profile" })
  }
})

// POST change password
router.post("/change-password", async (req, res) => {
  try {
    const { userId, currentPassword, newPassword } = req.body

    if (!userId || !currentPassword || !newPassword) {
      return res.status(400).json({ error: "All fields are required" })
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: "New password must be at least 6 characters long" })
    }

    // Get user with password
    const user = await User.findById(userId)

    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password)

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Current password is incorrect" })
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update password
    await User.findByIdAndUpdate(userId, {
      password: hashedPassword,
      updatedAt: new Date(),
    })

    res.json({ success: true, message: "Password updated successfully" })
  } catch (error) {
    console.error("Error changing password:", error)
    res.status(500).json({ error: "Failed to change password" })
  }
})

// DELETE user account
router.delete("/account/:userId", async (req, res) => {
  try {
    const { userId } = req.params

    const user = await User.findByIdAndDelete(userId)

    if (!user) {
      return res.status(404).json({ error: "User not found" })
    }

    res.json({ success: true, message: "Account deleted successfully" })
  } catch (error) {
    console.error("Error deleting user account:", error)
    res.status(500).json({ error: "Failed to delete account" })
  }
})

module.exports = router
