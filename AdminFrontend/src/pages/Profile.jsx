import { useState } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/authentication/AuthContext"
import { useNavigate } from "react-router-dom"
import { toast, Toaster } from "sonner"
import { Eye, EyeOff } from "lucide-react"

export default function ProfileSettings() {
  const API = import.meta.env.VITE_API_URL || "http://localhost:5001"
  const { admin, setAdmin, logout } = useAuth()
  const navigate = useNavigate()

  /* ------------------ STATES ------------------ */
  const [name, setName] = useState(admin?.name || "")

  // Password Data States
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  // Password Visibility States (New)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [loading, setLoading] = useState(false)

  /* ------------------ UPDATE PROFILE ------------------ */
  const handleProfileUpdate = async () => {
    console.log("Updating profile...")
    try {
      setLoading(true)
      const formData = new FormData()
      formData.append("name", name)

      const { data } = await axios.put(
        `${API}/api/admin/profile`,
        formData,
        { withCredentials: true }
      )

      setAdmin(data.admin)
      toast.success("Profile updated successfully")

    } catch (error) {
        console.log(error)
      toast.error("Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  /* ------------------ CHANGE PASSWORD ------------------ */
  const handleChangePassword = async () => {
    console.log("Changing password...")
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    try {
      setLoading(true)

      await axios.put(
        `${API}/api/admin/change-password`,
        {
          currentPassword,
          newPassword
        },
        { withCredentials: true }
      )

      toast.success("Password changed. Please login again.")
      setTimeout(async () => {
        await logout()
        navigate("/")
      }, 2000)

    } catch (error) {
      const status = error.response?.status
      if (status === 400) {
        toast.error("Current password is incorrect")
        return
      }
      toast.error("Failed to change password")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Toaster richColors />
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Profile Settings</h1>

        {/* BASIC INFO */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              value={admin?.email || ""}
              disabled
            />
            <Button onClick={handleProfileUpdate}>
              Save Changes
            </Button>
          </CardContent>
        </Card>

        {/* CHANGE PASSWORD */}
        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            
            {/* 1. CURRENT PASSWORD */}
            <div className="relative">
              <Input
                type={showCurrentPassword ? "text" : "password"}
                placeholder="Current Password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                {showCurrentPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>

            {/* 2. NEW PASSWORD */}
            <div className="relative">
              <Input
                type={showNewPassword ? "text" : "password"}
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>

            {/* 3. CONFIRM PASSWORD */}
            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>

            <Button
              variant="destructive"
              onClick={handleChangePassword}
            >
              Update Password
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  )
}