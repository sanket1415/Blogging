"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { ArrowLeft, ThumbsUp, MessageSquare, Calendar, User } from "lucide-react"
import { fetchAPI } from "@/lib/api" // Import your API helper

interface Post {
  id: number
  title: string
  content: string
  createdAt: string
  author: {
    id: number
    name: string
    avatarUrl: string
  }
  likes: number
  userLiked: boolean
}

interface Comment {
  id: number
  content: string
  createdAt: string
  author: {
    id: number
    name: string
    avatarUrl: string
  }
}

export default function PostPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newComment, setNewComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Check authentication status
    const token = localStorage.getItem("token")
    setIsAuthenticated(!!token)

    const fetchData = async () => {
      try {
        // Fetch post and comments in parallel
        const [postResponse, commentsResponse] = await Promise.all([
          fetchAPI(`/posts/${params.id}`),
          fetchAPI(`/posts/${params.id}/comments`)
        ])

        setPost(postResponse)
        setComments(commentsResponse)
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          variant: "destructive",
          title: "Error loading post",
          description: error instanceof Error ? error.message : "Failed to load post data"
        })
        router.push("/")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [params.id, router])

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Login required",
        description: "Please login to like posts",
        action: (
          <Link href="/login">
            <Button variant="outline" size="sm">
              Login
            </Button>
          </Link>
        )
      })
      return
    }

    try {
      await fetchAPI(`/posts/${params.id}/like`, {
        method: post?.userLiked ? "DELETE" : "POST"
      })

      setPost(prev => prev ? {
        ...prev,
        likes: prev.userLiked ? prev.likes - 1 : prev.likes + 1,
        userLiked: !prev.userLiked
      } : null)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error updating like",
        description: error instanceof Error ? error.message : "Failed to update like status"
      })
    }
  }

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newComment.trim()) {
      toast({
        variant: "destructive",
        title: "Empty comment",
        description: "Please enter a comment"
      })
      return
    }

    if (!isAuthenticated) {
      toast({
        title: "Login required",
        description: "Please login to post comments",
        action: (
          <Link href="/login">
            <Button variant="outline" size="sm">
              Login
            </Button>
          </Link>
        )
      })
      return
    }

    setIsSubmitting(true)

    try {
      const newCommentData = await fetchAPI(`/posts/${params.id}/comments`, {
        method: "POST",
        body: JSON.stringify({ content: newComment })
      })

      setComments(prev => [newCommentData, ...prev])
      setNewComment("")
      toast({
        title: "Comment added",
        description: "Your comment was posted successfully"
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error posting comment",
        description: error instanceof Error ? error.message : "Failed to post comment"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <p className="text-lg">Post not found</p>
        <Button onClick={() => router.push("/")}>Back to Home</Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Button 
        variant="ghost" 
        onClick={() => router.back()} 
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <article className="mb-12">
        <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
          <div className="flex items-center gap-1">
            <User className="h-4 w-4" />
            <span>{post.author.name}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="prose dark:prose-invert max-w-none">
          {post.content.split('\n').map((paragraph, i) => (
            <p key={i} className="mb-4 last:mb-0">
              {paragraph}
            </p>
          ))}
        </div>

        <div className="flex gap-4 mt-8">
          <Button
            variant={post.userLiked ? "default" : "outline"}
            size="sm"
            onClick={handleLike}
          >
            <ThumbsUp className="mr-2 h-4 w-4" />
            {post.likes} {post.likes === 1 ? "Like" : "Likes"}
          </Button>
        </div>
      </article>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Comments ({comments.length})</h2>
        
        <form onSubmit={handleCommentSubmit} className="mb-8">
          <Textarea
            placeholder="Write your comment..."
            className="mb-4"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={isSubmitting}
          />
          <Button type="submit" disabled={isSubmitting || !newComment.trim()}>
            {isSubmitting ? "Posting..." : "Post Comment"}
          </Button>
        </form>

        {comments.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          <div className="space-y-6">
            {comments.map(comment => (
              <Card key={comment.id}>
                <CardHeader className="flex flex-row items-center gap-3 pb-3">
                  <Avatar>
                    <AvatarImage src={comment.author.avatarUrl} />
                    <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{comment.author.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </CardHeader>
                <CardContent>
                  <p>{comment.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}