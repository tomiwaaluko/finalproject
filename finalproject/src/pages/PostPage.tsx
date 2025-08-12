import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useOwner } from "../hooks/useOwner";

interface Post {
  id: string;
  title: string;
  content: string;
  image_url?: string;
  user_id: string;
  created_at: string;
  upvotes: number;
}

interface Comment {
  id: string;
  content: string;
  user_id: string;
  post_id: string;
  created_at: string;
}

const PostPage = () => {
  const { id } = useParams();
  const { userId } = useOwner();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [commentError, setCommentError] = useState<string | null>(null);
  const [upvoteError, setUpvoteError] = useState<string | null>(null);

  // Fetch post data
  const {
    data: post,
    isLoading: postLoading,
    error: postError,
  } = useQuery({
    queryKey: ["post", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as Post;
    },
    // Viewing a post should not require authentication
    enabled: !!id,
    retry: 1,
  });

  // Fetch comments
  const { data: comments = [], isLoading: commentsLoading } = useQuery({
    queryKey: ["comments", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .eq("post_id", id)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as Comment[];
    },
    // Allow public viewing of comments
    enabled: !!id,
  });

  // Upvote mutation
  const upvoteMutation = useMutation({
    mutationFn: async () => {
      if (!post) return;
      if (!userId) throw new Error("Not authenticated yet");

      const { data, error } = await supabase.rpc("increment_upvotes", {
        post_id: post.id,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post", id] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      setUpvoteError(null);
    },
    onError: (e: any) => {
      console.error("Upvote error", e);
      setUpvoteError(e?.message || "Failed to upvote");
    },
  });

  // Comment mutation
  const commentMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!userId) throw new Error("Not authenticated yet");
      const { data, error } = await supabase
        .from("comments")
        .insert([
          {
            content: content.trim(),
            user_id: userId!,
            post_id: id!,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", id] });
      setNewComment("");
      setIsSubmittingComment(false);
      setCommentError(null);
    },
    onError: (e: any) => {
      console.error("Comment insert error", e);
      setIsSubmittingComment(false);
      setCommentError(e?.message || "Failed to post comment");
    },
  });

  // Delete post mutation
  const deletePostMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("posts").delete().eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      // Navigate back to feed after successful deletion
      window.location.href = "/";
    },
  });

  const handleUpvote = () => {
    if (upvoteMutation.isPending || !post) return;
    upvoteMutation.mutate();
  };

  const handleDelete = () => {
    if (
      window.confirm(
        "Are you sure you want to delete this post? This action cannot be undone."
      )
    ) {
      deletePostMutation.mutate();
    }
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmittingComment) return;

    setIsSubmittingComment(true);
    commentMutation.mutate(newComment);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  if (postLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  // Distinguish between real error and not-yet-loaded/absent post
  if (postError) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Link to="/" className="text-gray-600 hover:text-gray-800">
            ← Back to Feed
          </Link>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-600">
            Error loading post: {postError.message}
          </p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Link to="/" className="text-gray-600 hover:text-gray-800">
            ← Back to Feed
          </Link>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <p className="text-yellow-700">Post not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <Link to="/" className="text-gray-600 hover:text-gray-800">
          ← Back to Feed
        </Link>
        {post.user_id === userId && (
          <div className="flex gap-2">
            <Link
              to={`/posts/${id}/edit`}
              className="text-blue-600 hover:text-blue-800 px-3 py-1 rounded border border-blue-600 hover:bg-blue-50 transition-colors"
            >
              Edit
            </Link>
            <button
              onClick={handleDelete}
              disabled={deletePostMutation.isPending}
              className="text-red-600 hover:text-red-800 px-3 py-1 rounded border border-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              {deletePostMutation.isPending ? "Deleting..." : "Delete"}
            </button>
          </div>
        )}
      </div>

      {/* Post Content */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h1 className="text-2xl font-bold mb-4">{post.title}</h1>

        {post.content && (
          <div className="prose max-w-none mb-4">
            <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
          </div>
        )}

        {post.image_url && (
          <div className="mb-4">
            <img
              src={post.image_url}
              alt={post.title}
              className="w-full max-w-lg rounded-lg"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleUpvote}
              disabled={upvoteMutation.isPending || !userId}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
              </svg>
              <span>{post.upvotes}</span>
            </button>
          </div>
          <span className="text-sm text-gray-500">
            {formatTimeAgo(post.created_at)}
          </span>
        </div>
      </div>

      {/* Comments Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">
          Comments ({comments.length})
        </h3>

        {/* Comment Form */}
        <form onSubmit={handleCommentSubmit} className="mb-6">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            rows={3}
            disabled={isSubmittingComment || !userId}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
          <div className="flex justify-end mt-2">
            <button
              type="submit"
              disabled={!newComment.trim() || isSubmittingComment || !userId}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
            >
              {isSubmittingComment ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Posting...
                </>
              ) : (
                "Post Comment"
              )}
            </button>
          </div>
        </form>

        {/* Comments List */}
        {commentsLoading ? (
          <div className="space-y-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        ) : comments.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="border-b border-gray-100 pb-4 last:border-b-0"
              >
                <p className="text-gray-700 whitespace-pre-wrap mb-2">
                  {comment.content}
                </p>
                <p className="text-sm text-gray-500">
                  {formatTimeAgo(comment.created_at)}
                </p>
              </div>
            ))}
          </div>
        )}

        {(commentMutation.error || commentError) && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-4">
            <p className="text-red-600 text-sm">
              {commentError || "Error posting comment."}
            </p>
          </div>
        )}
        {upvoteError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-4">
            <p className="text-red-600 text-sm">{upvoteError}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostPage;
