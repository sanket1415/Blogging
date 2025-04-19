"use client"

import { useState, useEffect } from "react"
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

export default function EditPostPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
  })

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const data = await fetchAPI(`/blogs/${params.id}`)
        setFormData({
          title: data.title,
          content: data.content,
        })
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Could not load the post"
        
        // Don't redirect if it's just a missing post (404)
        if (!errorMessage.includes("404")) {
          toast({
            variant: "destructive",
            title: "Failed to fetch post",
            description: errorMessage,
          })
          router.push("/dashboard/posts")
        } else {
          toast({
            variant: "destructive",
            title: "Post not found",
            description: "The post you're trying to edit doesn't exist",
          })
          router.push("/dashboard/posts")
        }
      } finally {
        setIsFetching(false)
      }
    }

    fetchPost()
  }, [params.id, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Title is required",
      })
      return
    }

    if (!formData.content.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Content is required",
      })
      return
    }

    setIsLoading(true)

    try {
      await fetchAPI(`/blogs/${params.id}`, {
        method: "PUT",
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          // Include any other required fields from your BlogRequest DTO
        }),
      })

      toast({
        title: "Post updated",
        description: "Your post has been updated successfully",
      })
      router.push("/dashboard/posts")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update post"
      
      if (errorMessage.includes("403")) {
        toast({
          variant: "destructive",
          title: "Permission Denied",
          description: "You don't have permission to edit this post",
        })
      } else {
        toast({
          variant: "destructive",
          title: "Update Failed",
          description: errorMessage,
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (isFetching) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
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
        <h1 className="text-3xl font-bold">Edit Post</h1>
      </div>

      <Card className="shadow-lg">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle className="text-2xl">Edit Post Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-lg">
                Title
              </Label>
              <Input
                id="title"
                name="title"
                placeholder="Enter post title"
                required
                value={formData.title}
                onChange={handleChange}
                className="text-lg py-4"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content" className="text-lg">
                Content
              </Label>
              <Textarea
                id="content"
                name="content"
                placeholder="Write your post content here..."
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
                  Updating...
                </span>
              ) : "Update Post"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}