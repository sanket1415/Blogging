"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { PlusCircle, Edit, Trash2, ThumbsUp, MessageSquare, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { fetchAPI } from "@/lib/api"

interface Post {
  id: number
  title: string
  content: string
  createdAt: string
  likes: number
  comments: number
}

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  const fetchPosts = async () => {
    try {
      setIsLoading(true)
      
      try {
        const data = await fetchAPI("/blogs")
        setPosts(data)
        setFilteredPosts(data)
        return
      } catch (error) {
        console.error("API request failed:", error)
        throw error // Re-throw to trigger fallback
      }
    } catch (error) {
      // Fallback to sample data if API fails
      const samplePosts = [
        {
          id: 1,
          title: "Getting Started with React",
          content: "React is a popular JavaScript library for building user interfaces...",
          createdAt: "2023-05-15T10:30:00Z",
          likes: 24,
          comments: 8,
        },
        {
          id: 2,
          title: "Spring Boot Best Practices",
          content: "Spring Boot makes it easy to create stand-alone, production-grade Spring based Applications...",
          createdAt: "2023-06-22T14:15:00Z",
          likes: 18,
          comments: 5,
        },
        {
          id: 3,
          title: "JavaScript ES6 Features",
          content: "ES6 introduced many new features to JavaScript including arrow functions, template literals...",
          createdAt: "2023-07-10T09:45:00Z",
          likes: 32,
          comments: 12,
        },
      ]

      setPosts(samplePosts)
      setFilteredPosts(samplePosts)
      toast({
        title: "Using Sample Data",
        description: "Could not connect to the server. Displaying sample posts.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredPosts(posts)
    } else {
      const filtered = posts.filter(
        (post) =>
          post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.content.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setFilteredPosts(filtered)
    }
  }, [searchQuery, posts])

  const handleDeletePost = async (id: number) => {
    if (!confirm("Are you sure you want to delete this post?")) return

    try {
      await fetchAPI(`/blogs/${id}`, {
        method: "DELETE"
      })
      
      setPosts(posts.filter((post) => post.id !== id))
      toast({
        title: "Post Deleted",
        description: "Your post has been successfully deleted",
      })
    } catch (error) {
      console.error("Error deleting post:", error)
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: error instanceof Error ? error.message : "Could not delete post",
      })
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
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">My Posts</h1>
        <Link href="/dashboard/posts/new">
          <Button className="w-full sm:w-auto">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Post
          </Button>
        </Link>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
        <Input
          placeholder="Search posts by title or content..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {filteredPosts.length === 0 ? (
        <div className="text-center py-16 space-y-2">
          <p className="text-gray-500 text-lg">No posts found</p>
          {searchQuery && (
            <Button variant="ghost" onClick={() => setSearchQuery("")}>
              Clear search
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredPosts.map((post) => (
            <Card key={post.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="line-clamp-1 text-lg">{post.title}</CardTitle>
                <CardDescription>
                  {new Date(post.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-4 text-gray-700">{post.content}</p>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="flex space-x-4 text-sm text-gray-600">
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
                    <Button variant="ghost" size="icon" title="Edit">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleDeletePost(post.id)}
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}