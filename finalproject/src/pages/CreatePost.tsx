import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useOwner } from "../hooks/useOwner";
import { createPostSchema } from "../lib/validations";
import FlagSelector from "../components/FlagSelector";
import ImageUpload from "../components/ImageUpload";
import LinkPreview from "../components/LinkPreview";

const CreatePost = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [selectedFlags, setSelectedFlags] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { userId, isLoading, error, retry } = useOwner();

  const createPostMutation = useMutation({
    mutationFn: async (postData: {
      title: string;
      content: string;
      image_url?: string;
      link_url?: string;
      flags?: string[];
    }) => {
      console.log("Starting post creation with data:", postData);

      // Validate data using Zod
      const validationResult = createPostSchema.safeParse({
        title: postData.title,
        content: postData.content,
        image_url: postData.image_url || null,
        link_url: postData.link_url || null,
        flags: postData.flags || [],
      });

      if (!validationResult.success) {
        console.error("Validation failed:", validationResult.error);
        const errorMap: Record<string, string> = {};
        validationResult.error.issues.forEach((issue) => {
          if (issue.path[0]) {
            errorMap[issue.path[0] as string] = issue.message;
          }
        });
        throw new Error(JSON.stringify(errorMap));
      }

      console.log("Validation passed, attempting database insert...");

      // (user_id default now handled at DB level via auth.uid())

      const insertData: Record<string, any> = {
        title: validationResult.data.title,
        content: validationResult.data.content,
        image_url: validationResult.data.image_url,
        link_url: validationResult.data.link_url,
        flags: validationResult.data.flags,
      };

      // Only attach user_id if we actually have an authenticated user; otherwise rely on DB default
      if (userId) {
        insertData.user_id = userId;
      }

      console.log("Insert data:", insertData);

      const { data, error } = await supabase
        .from("posts")
        .insert([insertData])
        .select()
        .single();

      if (error) {
        console.error("Database error:", error);
        console.error("Error code:", error.code);
        console.error("Error message:", error.message);
        console.error("Error details:", error.details);
        console.error("Error hint:", error.hint);
        throw error;
      }

      console.log("Insert successful:", data);
      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch posts
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["posts-count"] });
      setSuccessMessage("Post created successfully! Redirecting...");
      setTimeout(() => navigate("/"), 1500);
    },
    onError: (error: Error) => {
      setIsSubmitting(false);
      console.error("Full error object:", error);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);

      try {
        const errorMap = JSON.parse(error.message);
        setErrors(errorMap);
      } catch {
        // If it's not a validation error, handle as general error
        console.error("Error creating post:", error);
        setErrors({
          general: `Failed to create post: ${error.message}. Check console for details.`,
        });
      }
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({}); // Clear previous errors

    if (isLoading) {
      setErrors({ general: "Please wait for authentication to complete" });
      return;
    }

    if (error) {
      setErrors({ general: error });
      return;
    }

    // Remove strict authentication requirement for testing
    // if (!userId) {
    //   setErrors({ general: "Authentication failed. Please refresh the page." });
    //   return;
    // }

    setIsSubmitting(true);

    const postData = {
      title: title.trim(),
      content: content.trim(),
      image_url: imageUrl.trim() || undefined,
      link_url: linkUrl.trim() || undefined,
      flags: selectedFlags,
    };

    createPostMutation.mutate(postData);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Create New Post
        </h2>
        <Link
          to="/"
          className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100"
        >
          ← Back to Feed
        </Link>
      </div>

      {isLoading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-blue-600">Authenticating...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-600">{error}</p>
          <button
            onClick={retry}
            className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
          >
            Retry Authentication
          </button>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-green-600">{successMessage}</p>
        </div>
      )}

      {(errors.general || createPostMutation.error) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-600">
            {errors.general ||
              `Error creating post: ${createPostMutation.error?.message}`}
          </p>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6"
      >
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
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
            className={`w-full border rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-600 ${
              errors.title
                ? "border-red-300"
                : "border-gray-300 dark:border-gray-600"
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
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Content
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            disabled={isSubmitting}
            className={`w-full border rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-600 ${
              errors.content
                ? "border-red-300"
                : "border-gray-300 dark:border-gray-600"
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
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Link URL (for reposts)
          </label>
          <input
            type="url"
            id="linkUrl"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            disabled={isSubmitting}
            className={`w-full border rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-600 ${
              errors.link_url
                ? "border-red-300"
                : "border-gray-300 dark:border-gray-600"
            }`}
            placeholder="https://example.com/article-to-share"
          />
          {errors.link_url && (
            <p className="text-red-600 text-sm mt-1">{errors.link_url}</p>
          )}
          {linkUrl && (
            <div className="mt-3">
              <LinkPreview url={linkUrl} />
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Image Upload
          </label>
          <ImageUpload
            onImageUploaded={setImageUrl}
            onError={(error) => setErrors({ ...errors, image_upload: error })}
            disabled={isSubmitting}
            currentImageUrl={imageUrl}
          />
          {errors.image_upload && (
            <p className="text-red-600 text-sm mt-1">{errors.image_upload}</p>
          )}

          <div className="mt-4">
            <label
              htmlFor="imageUrl"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Or enter Image URL manually
            </label>
            <input
              type="url"
              id="imageUrl"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              disabled={isSubmitting}
              className={`w-full border rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-600 ${
                errors.image_url
                  ? "border-red-300"
                  : "border-gray-300 dark:border-gray-600"
              }`}
              placeholder="https://example.com/your-image.jpg"
            />
            {errors.image_url && (
              <p className="text-red-600 text-sm mt-1">{errors.image_url}</p>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating...
              </>
            ) : (
              "Create Post"
            )}
          </button>
          <Link
            to="/"
            className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors text-center"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;
