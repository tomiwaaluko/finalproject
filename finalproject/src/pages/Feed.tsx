import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useOwner } from "../hooks/useOwner";

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

// Available filter types with clean styling
const FILTER_OPTIONS = [
  { value: "recipe", label: "Recipe", icon: "🍽️" },
  { value: "tip", label: "Tip", icon: "💡" },
  { value: "question", label: "Question", icon: "❓" },
  { value: "review", label: "Review", icon: "⭐" },
  { value: "beginner", label: "Beginner", icon: "🌱" },
];

const Feed = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "most_upvoted">(
    "newest"
  );
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const {
    userId,
    isLoading: authLoading,
    error: authError,
    retry: retryAuth,
  } = useOwner();

  // Database query with proper filters and sorting
  const {
    data: posts = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["posts", searchTerm, sortBy, selectedFilters],
    queryFn: async () => {
      let query = supabase.from("posts").select("*");

      // Apply search filter
      if (searchTerm) {
        query = query.or(
          `title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`
        );
      }

      // Apply flag filters
      if (selectedFilters.length > 0) {
        query = query.contains("flags", selectedFilters);
      }

      // Apply sorting
      switch (sortBy) {
        case "newest":
          query = query.order("created_at", { ascending: false });
          break;
        case "oldest":
          query = query.order("created_at", { ascending: true });
          break;
        case "most_upvoted":
          query = query.order("upvotes", { ascending: false });
          break;
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Post[];
    },
    enabled: true, // Always run query - no authentication required
  });

  // Filter toggle function
  const toggleFilter = (filterValue: string) => {
    setSelectedFilters((prev) =>
      prev.includes(filterValue)
        ? prev.filter((f) => f !== filterValue)
        : [...prev, filterValue]
    );
  };
  // Time formatting utility
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

  return (
    <div className="min-h-screen bg-[#0B0F14] text-white">
      {/* Main container with max width and vertical rhythm */}
      <div className="mx-auto max-w-[960px] px-6 py-12 space-y-12">
        {/* Page header with clear hierarchy */}
        <header className="space-y-2">
          <h1 className="text-xl font-medium text-white">
            Latest Air Fryer Posts
          </h1>
          <p className="text-sm text-gray-400">
            Discover recipes, tips, and experiences from the community
          </p>
        </header>

        {/* Filters and search row */}
        <div className="space-y-4">
          {/* Filter chips - left aligned, wrap gracefully */}
          <div className="flex flex-wrap gap-2">
            {FILTER_OPTIONS.map((filter) => (
              <button
                key={filter.value}
                onClick={() => toggleFilter(filter.value)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 text-sm border border-[#1F2A35] rounded-md transition-colors min-h-[40px] ${
                  selectedFilters.includes(filter.value)
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "bg-[#10161C] text-gray-300 hover:bg-[#151B22] hover:border-gray-600"
                }`}
              >
                <span className="text-base leading-none">{filter.icon}</span>
                <span>{filter.label}</span>
              </button>
            ))}
          </div>

          {/* Search and sort row - responsive layout */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search input - spans remaining width */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 bg-[#10161C] border border-[#1F2A35] rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Sort select - aligned right */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-4 py-3 bg-[#10161C] border border-[#1F2A35] rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[140px]"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="most_upvoted">Most Upvoted</option>
            </select>
          </div>
        </div>

        {/* Authentication error state */}
        {authError && (
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-6">
            <p className="text-red-400">Authentication error: {authError}</p>
            <button
              onClick={retryAuth}
              className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors mr-3"
            >
              Retry Authentication
            </button>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm transition-colors"
            >
              Refresh Page
            </button>
          </div>
        )}

        {/* Authentication loading state */}
        {authLoading && (
          <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-6">
            <p className="text-blue-400">Authenticating...</p>
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-[#10161C] border border-[#1F2A35] rounded-lg p-6 animate-pulse"
              >
                <div className="h-5 bg-gray-700 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-700 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-6">
            <p className="text-red-400">Error loading posts: {error.message}</p>
          </div>
        )}

        {/* Posts list or empty state */}
        {!isLoading && !error && posts.length === 0 ? (
          /* Empty state with illustration placeholder */
          <div className="text-center py-16 space-y-6">
            <div className="w-16 h-16 mx-auto bg-[#10161C] rounded-lg flex items-center justify-center">
              <span className="text-2xl">🍟</span>
            </div>
            <div className="space-y-2">
              <p className="text-gray-300">
                {searchTerm || selectedFilters.length > 0
                  ? "No posts found matching your criteria"
                  : "No posts found yet"}
              </p>
              <div className="space-y-3">
                <Link
                  to="/create"
                  className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-md transition-colors min-h-[40px]"
                >
                  Create First Post
                </Link>
                {searchTerm || selectedFilters.length > 0 ? (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedFilters([]);
                    }}
                    className="block text-sm text-gray-400 hover:text-gray-300 transition-colors mx-auto"
                  >
                    Clear filters
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        ) : !isLoading && !error ? (
          /* Posts list */
          <div className="space-y-6">
            {/* Create post CTA - single primary action */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">
                {posts.length} posts
              </span>
              <Link
                to="/create"
                className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-md transition-colors min-h-[40px]"
              >
                Create Post
              </Link>
            </div>

            {/* Post cards */}
            <div className="space-y-4">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="bg-[#10161C] border border-[#1F2A35] rounded-lg p-6 hover:bg-[#151B22] transition-colors"
                >
                  {/* Post header */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/posts/${post.id}`}
                        className="text-white hover:text-blue-400 transition-colors"
                      >
                        <h2 className="text-base font-medium leading-snug line-clamp-2">
                          {post.title}
                        </h2>
                      </Link>

                      {/* Flags */}
                      {post.flags && post.flags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {post.flags.map((flag) => {
                            const flagOption = FILTER_OPTIONS.find(
                              (f) => f.value === flag
                            );
                            return flagOption ? (
                              <span
                                key={flag}
                                className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-[#1F2A35] text-gray-300 rounded"
                              >
                                <span className="text-xs leading-none">
                                  {flagOption.icon}
                                </span>
                                {flagOption.label}
                              </span>
                            ) : null;
                          })}
                        </div>
                      )}
                    </div>

                    {/* Upvotes */}
                    <div className="flex items-center gap-1 text-sm text-gray-400 shrink-0">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                      </svg>
                      {post.upvotes}
                    </div>
                  </div>

                  {/* Post content preview */}
                  {post.content && (
                    <p className="text-sm text-gray-300 leading-relaxed line-clamp-2 mb-4">
                      {post.content}
                    </p>
                  )}

                  {/* Link preview for reposts */}
                  {post.link_url && (
                    <div className="mb-4 p-3 bg-[#0B0F14] border border-[#1F2A35] rounded-md">
                      <div className="text-xs text-gray-400 mb-1">
                        Shared link
                      </div>
                      <a
                        href={post.link_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-400 hover:text-blue-300 transition-colors truncate block"
                      >
                        {post.link_url}
                      </a>
                    </div>
                  )}

                  {/* Image display */}
                  {post.image_url && (
                    <div className="mb-4">
                      <img
                        src={post.image_url}
                        alt={post.title}
                        className="w-full max-h-64 object-cover rounded-md"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    </div>
                  )}

                  {/* Post footer */}
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <time dateTime={post.created_at}>
                      {formatTimeAgo(post.created_at)}
                    </time>

                    <div className="flex items-center gap-4">
                      {post.user_id === userId && (
                        <Link
                          to={`/posts/${post.id}/edit`}
                          className="text-gray-400 hover:text-gray-300 transition-colors"
                        >
                          Edit
                        </Link>
                      )}
                      <Link
                        to={`/posts/${post.id}`}
                        className="text-gray-400 hover:text-gray-300 transition-colors"
                      >
                        View post →
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Feed;
