import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useOwner } from "../hooks/useOwner";
import { createPostSchema } from "../lib/validations";
import FlagSelector from "../components/FlagSelector";

interface Post {
  id: string;
  title: string;
  content: string;
  image_url?: string;
  link_url?: string;
  flags?: string[];
  user_id: string;
  created_at: string;
  upvotes: number;
}

const EditPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { userId } = useOwner();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [selectedFlags, setSelectedFlags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState("");

  // Fetch post data
  const {
    data: post,
    isLoading,
    error,
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
    enabled: !!id && !!userId,
  });

  // Pre-fill form when post loads
  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setContent(post.content || "");
      setImageUrl(post.image_url || "");
      setLinkUrl(post.link_url || "");
      setSelectedFlags(post.flags || []);
    }
  }, [post]);

  // Update post mutation
  const updatePostMutation = useMutation({
    mutationFn: async (postData: {
      title: string;
      content: string;
      image_url?: string;
      link_url?: string;
      flags?: string[];
    }) => {
      // Validate data using Zod
      const validationResult = createPostSchema.safeParse({
        title: postData.title,
        content: postData.content,
        image_url: postData.image_url || null,
        link_url: postData.link_url || null,
        flags: postData.flags || [],
      });

      if (!validationResult.success) {
        const errorMap: Record<string, string> = {};
        validationResult.error.issues.forEach((issue) => {
          if (issue.path[0]) {
            errorMap[issue.path[0] as string] = issue.message;
          }
        });
        throw new Error(JSON.stringify(errorMap));
      }

      // Perform update without selecting the result to avoid RLS issues with returning the row
      const { error } = await supabase
        .from("posts")
        .update({
          title: validationResult.data.title,
          content: validationResult.data.content,
          image_url: validationResult.data.image_url,
          link_url: validationResult.data.link_url,
          flags: validationResult.data.flags,
        })
        .eq("id", id);

      if (error) throw error;

      // Return a success indicator since we can't return the updated row due to RLS
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post", id] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      setSuccessMessage("Post updated successfully! Redirecting...");
      setTimeout(() => navigate(`/posts/${id}`), 1500);
    },
    onError: (error: any) => {
      setIsSubmitting(false);
      console.error("Update post error:", error);
      // If validation error (JSON map), parse; else show message
      if (typeof error?.message === "string") {
        try {
          const errorMap = JSON.parse(error.message);
          setErrors(errorMap);
          return;
        } catch {
          /* not validation */
        }
      }
      setErrors({ general: error?.message || "Failed to update post." });
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
      navigate("/");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({}); // Clear previous errors

    setIsSubmitting(true);

    const postData = {
      title: title.trim(),
      content: content.trim(),
      image_url: imageUrl.trim() || undefined,
      link_url: linkUrl.trim() || undefined,
      flags: selectedFlags,
    };

    updatePostMutation.mutate(postData);
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

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-10 bg-gray-200 rounded w-full mb-4"></div>
          <div className="h-32 bg-gray-200 rounded w-full mb-4"></div>
          <div className="h-10 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-600">Post not found or error loading post.</p>
          <Link
            to="/"
            className="text-blue-600 hover:text-blue-800 mt-2 inline-block"
          >
            ← Back to Feed
          </Link>
        </div>
      </div>
    );
  }

  // Check if user owns this post
  if (post.user_id !== userId) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-600">
            You don't have permission to edit this post.
          </p>
          <Link
            to={`/posts/${id}`}
            className="text-blue-600 hover:text-blue-800 mt-2 inline-block"
          >
            ← Back to Post
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Edit Post</h2>
        <Link to={`/posts/${id}`} className="text-gray-600 hover:text-gray-800">
          ← Back to Post
        </Link>
      </div>

      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-green-600">{successMessage}</p>
        </div>
      )}

      {(errors.general ||
        updatePostMutation.error ||
        deletePostMutation.error) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-600 whitespace-pre-wrap text-sm">
            {errors.general ||
              updatePostMutation.error?.message ||
              deletePostMutation.error?.message}
          </p>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow p-6 space-y-4"
      >
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Title *
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            disabled={isSubmitting}
            className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 ${
              errors.title ? "border-red-300" : "border-gray-300"
            }`}
            placeholder="What's your air fryer tip or recipe?"
          />
          {errors.title && (
            <p className="text-red-600 text-sm mt-1">{errors.title}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="content"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Content
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            disabled={isSubmitting}
            className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 ${
              errors.content ? "border-red-300" : "border-gray-300"
            }`}
            placeholder="Share your experience, recipe, or tip..."
          />
          {errors.content && (
            <p className="text-red-600 text-sm mt-1">{errors.content}</p>
          )}
        </div>

        {/* Flag Selector */}
        <FlagSelector
          selectedFlags={selectedFlags}
          onFlagsChange={setSelectedFlags}
          disabled={isSubmitting}
        />

        {/* Link URL */}
        <div>
          <label
            htmlFor="linkUrl"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Link URL (for reposts)
          </label>
          <input
            type="url"
            id="linkUrl"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            disabled={isSubmitting}
            className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 ${
              errors.link_url ? "border-red-300" : "border-gray-300"
            }`}
            placeholder="https://example.com/article-to-share"
          />
          {errors.link_url && (
            <p className="text-red-600 text-sm mt-1">{errors.link_url}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="imageUrl"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Image URL
          </label>
          <input
            type="url"
            id="imageUrl"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            disabled={isSubmitting}
            className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 ${
              errors.image_url ? "border-red-300" : "border-gray-300"
            }`}
            placeholder="https://example.com/your-image.jpg"
          />
          {errors.image_url && (
            <p className="text-red-600 text-sm mt-1">{errors.image_url}</p>
          )}
          {imageUrl && (
            <div className="mt-2">
              <img
                src={imageUrl}
                alt="Preview"
                className="w-full h-48 object-cover rounded-lg"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
          )}
        </div>

        <div className="flex justify-between pt-4">
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </>
              ) : (
                "Update Post"
              )}
            </button>
            <Link
              to={`/posts/${id}`}
              className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </Link>
          </div>

          <button
            type="button"
            onClick={handleDelete}
            disabled={deletePostMutation.isPending}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
          >
            {deletePostMutation.isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Deleting...
              </>
            ) : (
              "Delete Post"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditPost;
