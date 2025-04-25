"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "@/components/ui/use-toast"
import { fetchAPI } from "@/lib/api"

interface User {
  id: number
  name: string
  email: string
  bio: string
  avatarUrl: string
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    bio: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoading(true)
        const data = await fetchAPI("/users/profile")
        
        setUser(data)
        setFormData({
          name: data.name,
          email: data.email,
          bio: data.bio || "",
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        })
      } catch (error) {
        console.error("Error fetching user profile:", error)
        
        // Fallback to localStorage if API fails
        const storedUser = localStorage.getItem("user")
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser)
          setUser(parsedUser)
          setFormData({
            name: parsedUser.name,
            email: parsedUser.email,
            bio: parsedUser.bio || "Software developer passionate about web technologies.",
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          })
        } else {
          toast({
            variant: "destructive",
            title: "Profile Error",
            description: "Could not load your profile information",
          })
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserProfile()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Name cannot be empty",
      })
      return
    }

    setIsUpdating(true)

    try {
      await fetchAPI("/users/profile", {
        method: "PUT",
        body: JSON.stringify({
          name: formData.name,
          bio: formData.bio,
        }),
      })

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully",
      })

      // Update user state
      if (user) {
        const updatedUser = {
          ...user,
          name: formData.name,
          bio: formData.bio
        }
        setUser(updatedUser)
        localStorage.setItem("user", JSON.stringify(updatedUser))
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update profile"
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: errorMessage.includes("403") 
          ? "You don't have permission to update this profile"
          : errorMessage,
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.currentPassword) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Current password is required",
      })
      return
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "New passwords don't match",
      })
      return
    }

    if (formData.newPassword.length < 8) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Password must be at least 8 characters",
      })
      return
    }

    setIsUpdating(true)

    try {
      await fetchAPI("/users/password", {
        method: "PUT",
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      })

      toast({
        title: "Password Updated",
        description: "Your password has been changed successfully",
      })

      // Clear password fields
      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }))
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update password"
      
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: errorMessage.includes("400") 
          ? "Current password is incorrect"
          : errorMessage,
      })
    } finally {
      setIsUpdating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto px-4 py-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Profile Settings</h1>
        <p className="text-gray-600">Manage your account information and security</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl">Profile Information</CardTitle>
            <CardDescription>Update your personal details</CardDescription>
          </CardHeader>
          <form onSubmit={handleProfileUpdate}>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user?.avatarUrl} alt={user?.name} />
                  <AvatarFallback className="text-2xl font-medium">
                    {user?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <Button variant="outline" size="sm" type="button">
                  Change Avatar
                </Button>
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange}
                  placeholder="Enter your full name"
                />
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email"
                  value={formData.email} 
                  disabled
                  className="opacity-75"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Contact support to change your email
                </p>
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="bio">Bio</Label>
                <Input 
                  id="bio" 
                  name="bio" 
                  value={formData.bio} 
                  onChange={handleChange}
                  placeholder="Tell us about yourself"
                />
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button type="submit" disabled={isUpdating} className="w-full sm:w-auto">
                {isUpdating ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                    Saving...
                  </span>
                ) : "Save Changes"}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl">Password</CardTitle>
            <CardDescription>Change your account password</CardDescription>
          </CardHeader>
          <form onSubmit={handlePasswordUpdate}>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  placeholder="Enter your current password"
                />
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="Enter your new password"
                />
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your new password"
                />
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button 
                type="submit" 
                disabled={isUpdating}
                className="w-full sm:w-auto"
              >
                {isUpdating ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                    Updating...
                  </span>
                ) : "Update Password"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}