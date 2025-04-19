"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { fetchAPI } from "@/lib/api"

export default function NewPostPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    published: false // Added published field to match BlogRequest
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form fields
    if (!formData.title.trim()) {
      toast({
        variant: "destructive",
        title: "Missing Title",
        description: "Please enter a title for your post",
      })
      return
    }

    if (!formData.content.trim()) {
      toast({
        variant: "destructive",
        title: "Missing Content",
        description: "Please write some content for your post",
      })
      return
    }

    setIsLoading(true)

    try {
      // Use the fetchAPI helper which handles auth headers automatically
      await fetchAPI("/blogs", {
        method: "POST",
        body: JSON.stringify(formData)
      })

      toast({
        title: "Post Created",
        description: "Your post has been published successfully",
      })
      router.push("/dashboard/posts")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create post"
      
      if (errorMessage.includes("403")) {
        toast({
          variant: "destructive",
          title: "Authentication Required",
          description: "Please login to create posts",
        })
        router.push("/login")
      } else if (errorMessage.includes("400")) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: "Please check your post data and try again",
        })
      } else {
        toast({
          variant: "destructive",
          title: "Creation Failed",
          description: errorMessage,
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => router.back()}
          className="rounded-full"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold">Create New Post</h1>
      </div>

      <Card className="shadow-lg">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle className="text-2xl">New Post Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-lg">
                Title*
              </Label>
              <Input
                id="title"
                name="title"
                placeholder="Enter a compelling title..."
                required
                value={formData.title}
                onChange={handleChange}
                className="text-lg py-4"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content" className="text-lg">
                Content*
              </Label>
              <Textarea
                id="content"
                name="content"
                placeholder="Write your amazing content here..."
                required
                className="min-h-[300px] text-base"
                value={formData.content}
                onChange={handleChange}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-4 border-t px-6 py-4">
            <Button 
              variant="outline" 
              type="button" 
              onClick={() => router.back()}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="min-w-[120px]"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                  Publishing...
                </span>
              ) : "Publish Post"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}