"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle, Edit, Trash2, ThumbsUp, MessageSquare } from "lucide-react"
import { fetchAPI, mockAPI, shouldUseMockData, mockData } from "@/lib/api"
import { toast } from "@/components/ui/use-toast"

interface Post {
  id: number
  title: string
  content: string
  createdAt: string
  likes: number
  comments: number
}

export default function DashboardPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalPosts: 0,
    totalLikes: 0,
    totalComments: 0,
  })

  useEffect(() => {
    async function loadPosts() {
      setIsLoading(true)
      try {
        let data

        if (shouldUseMockData()) {
          data = await mockAPI("/blogs", mockData.posts)
        } else {
          data = await fetchAPI("/blogs")
        }

        setPosts(data)

        // Calculate stats
        setStats({
          totalPosts: data.length,
          totalLikes: data.reduce((sum: number, post: Post) => sum + post.likes, 0),
          totalComments: data.reduce((sum: number, post: Post) => sum + post.comments, 0),
        })
      } catch (error) {
        console.error("Error loading posts:", error)
        toast({
          variant: "destructive",
          title: "Failed to load posts",
          description: error instanceof Error ? error.message : "An unknown error occurred",
        })

        // Fallback to mock data if real API fails
        const data = mockData.posts
        setPosts(data)
        setStats({
          totalPosts: data.length,
          totalLikes: data.reduce((sum, post) => sum + post.likes, 0),
          totalComments: data.reduce((sum, post) => sum + post.comments, 0),
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadPosts()
  }, [])

  const handleDeletePost = async (id: number) => {
    if (!confirm("Are you sure you want to delete this post?")) return

    try {
      if (shouldUseMockData()) {
        await mockAPI(`/blogs/${id}`, { success: true })
        setPosts(posts.filter((post) => post.id !== id))
        setStats((prev) => ({
          ...prev,
          totalPosts: prev.totalPosts - 1,
        }))
        toast({
          title: "Post deleted",
          description: "Your post has been deleted successfully.",
        })
      } else {
        await fetchAPI(`/blogs/${id}`, { method: "DELETE" })
        setPosts(posts.filter((post) => post.id !== id))
        setStats((prev) => ({
          ...prev,
          totalPosts: prev.totalPosts - 1,
        }))
        toast({
          title: "Post deleted",
          description: "Your post has been deleted successfully.",
        })
      }
    } catch (error) {
      console.error("Error deleting post:", error)
      toast({
        variant: "destructive",
        title: "Failed to delete post",
        description: error instanceof Error ? error.message : "An unknown error occurred",
      })
    }
  }

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Link href="/dashboard/posts/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Post
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPosts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLikes}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Comments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalComments}</div>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-xl font-semibold mt-6">Recent Posts</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Card key={post.id}>
            <CardHeader>
              <CardTitle className="line-clamp-1">{post.title}</CardTitle>
              <CardDescription>{new Date(post.createdAt).toLocaleDateString()}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="line-clamp-3">{post.content}</p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="flex space-x-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <ThumbsUp className="mr-1 h-4 w-4" />
                  {post.likes}
                </div>
                <div className="flex items-center">
                  <MessageSquare className="mr-1 h-4 w-4" />
                  {post.comments}
                </div>
              </div>
              <div className="flex space-x-2">
                <Link href={`/dashboard/posts/edit/${post.id}`}>
                  <Button variant="ghost" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                </Link>
                <Button variant="ghost" size="icon" onClick={() => handleDeletePost(post.id)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
