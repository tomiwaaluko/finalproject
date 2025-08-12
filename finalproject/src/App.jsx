import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ThemeToggle from "./components/ThemeToggle";
import Feed from "./pages/Feed";
import CreatePost from "./pages/CreatePost";
import PostPage from "./pages/PostPage";
import EditPost from "./pages/EditPost";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="min-h-screen transition-colors">
          <header className="bg-[#0B0F14] border-b border-[#1F2A35]">
            <div className="max-w-[960px] mx-auto px-6 py-4 flex justify-between items-center">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white">
                  AirFryHub 🍟
                </h1>
                <p className="text-sm sm:text-base text-gray-400">
                  Mini forum for air-fryer recipes, tips, and pics
                </p>
              </div>
              <ThemeToggle />
            </div>
          </header>

          <Routes>
            <Route path="/" element={<Feed />} />
            <Route path="/create" element={<CreatePost />} />
            <Route path="/posts/:id" element={<PostPage />} />
            <Route path="/posts/:id/edit" element={<EditPost />} />
          </Routes>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
