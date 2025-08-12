import { useState, useEffect } from "react";

interface LinkPreviewProps {
  url: string;
  className?: string;
}

interface LinkPreviewData {
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
  favicon?: string;
}

const LinkPreview = ({ url, className = "" }: LinkPreviewProps) => {
  const [previewData, setPreviewData] = useState<LinkPreviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchPreview = async () => {
      try {
        setIsLoading(true);
        setError(false);

        // Mock preview data since we can't fetch cross-origin in browser
        // In a real app, you'd have a backend service to fetch this data
        const domain = new URL(url).hostname;

        // Simulate loading delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Mock data based on domain
        const mockData: LinkPreviewData = {
          title: `Content from ${domain}`,
          description:
            "This is a preview of the linked content. In a real implementation, this would be fetched from the actual URL.",
          image:
            "https://via.placeholder.com/400x200/3B82F6/FFFFFF?text=Link+Preview",
          siteName: domain,
          favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=32`,
        };

        setPreviewData(mockData);
      } catch (err) {
        setError(true);
        console.error("Error fetching link preview:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (url) {
      fetchPreview();
    }
  }, [url]);

  if (!url) return null;

  if (isLoading) {
    return (
      <div
        className={`border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800 animate-pulse ${className}`}
      >
        <div className="flex space-x-3">
          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !previewData) {
    return (
      <div
        className={`border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-800 ${className}`}
      >
        <div className="flex items-center text-gray-600 dark:text-gray-400">
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
            />
          </svg>
          <span className="text-sm">{url}</span>
        </div>
      </div>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`block border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors ${className}`}
    >
      <div className="flex space-x-3">
        {previewData.image && (
          <div className="flex-shrink-0">
            <img
              src={previewData.image}
              alt=""
              className="w-16 h-16 object-cover rounded"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            {previewData.favicon && (
              <img
                src={previewData.favicon}
                alt=""
                className="w-4 h-4"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            )}
            <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {previewData.siteName || new URL(url).hostname}
            </span>
          </div>

          {previewData.title && (
            <h3 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 mb-1">
              {previewData.title}
            </h3>
          )}

          {previewData.description && (
            <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">
              {previewData.description}
            </p>
          )}
        </div>
      </div>
    </a>
  );
};

export default LinkPreview;
