import React, { useState } from "react";
import { SeniorPost, mockedSeniorPosts } from "../data/seniorsOpinion";
import { 
  ArrowLeft, 
  Search, 
  MessageSquare, 
  ThumbsUp, 
  Paperclip,
  PlusCircle,
  GraduationCap
} from "lucide-react";
import { db } from "../firebase";
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";

interface SeniorsOpinionPageProps {
  onNavigate: (view: "landing" | "study-material-page") => void;
}

const ALL_TAGS = ["All", "Strategy", "Physics", "Chemistry", "Math", "Revision", "Motivation"];

const SeniorsOpinionPage: React.FC<SeniorsOpinionPageProps> = ({ onNavigate }) => {
  const { currentUser, userProfile } = useAuth();
  const [activeTag, setActiveTag] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [posts, setPosts] = useState<SeniorPost[]>([]);

  // Fetch posts from Firestore
  React.useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedPosts: SeniorPost[] = [];
      snapshot.forEach((doc) => {
        fetchedPosts.push({ id: doc.id, ...doc.data() } as SeniorPost);
      });
      setPosts(fetchedPosts.length > 0 ? fetchedPosts : mockedSeniorPosts); // fallback to mock if empty
    });
    return () => unsubscribe();
  }, []);

  // Filter posts
  const filteredPosts = posts.filter((post) => {
    const matchesTag = activeTag === "All" || post.tags.includes(activeTag);
    const matchesSearch = 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      post.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTag && matchesSearch;
  });

  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePostSubmit = async () => {
    if (!newTitle.trim() || !newContent.trim()) {
      alert("Please fill in both title and content.");
      return;
    }
    
    if (!currentUser) {
      alert("Please log in to share your advice!");
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "posts"), {
        authorName: currentUser.displayName || userProfile?.name || currentUser.email?.split("@")[0] || "Anonymous",
        authorCredential: userProfile?.activePlan === "Free" ? "Student" : "Pro Member",
        title: newTitle,
        content: newContent,
        tags: [activeTag === "All" ? "General" : activeTag],
        upvotes: 0,
        datePosted: new Date().toLocaleDateString(),
        createdAt: serverTimestamp(),
      });
      
      setNewTitle("");
      setNewContent("");
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error adding post: ", error);
      alert("Failed to submit post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans pb-16">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigate("landing")}
              className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors text-gray-600 "
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center gap-2">
                <GraduationCap className="w-6 h-6 text-blue-600" />
                Seniors Opinion
              </h1>
              <p className="text-xs text-gray-500 hidden sm:block">Advice and notes from top graduates</p>
            </div>
          </div>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Share Advice</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Search and Filter */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search advice, strategies, notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm shadow-sm"
            />
          </div>

          <div className="flex overflow-x-auto pb-2 gap-2 hide-scrollbar">
            {ALL_TAGS.map(tag => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTag === tag 
                    ? "bg-blue-100 text-blue-800 border border-blue-200" 
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 "
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Posts Feed */}
        <div className="space-y-6">
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post) => (
              <article key={post.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6">
                  {/* Post Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-1">{post.title}</h2>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium text-blue-600">{post.authorName}</span>
                        <span className="text-gray-300">•</span>
                        <span className="text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md text-xs font-semibold">{post.authorCredential}</span>
                        <span className="text-gray-300">•</span>
                        <span className="text-gray-400 text-xs">{post.datePosted}</span>
                      </div>
                    </div>
                  </div>

                  {/* Post Content - rendering minimal bold tags */}
                  <div className="prose prose-blue max-w-none text-gray-700 text-sm sm:text-base leading-relaxed mb-6 whitespace-pre-line" 
                       dangerouslySetInnerHTML={{ 
                         __html: post.content.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-gray-900 ">$1</strong>').replace(/\*(.*?)\*/g, '<em class="italic">$1</em>') 
                       }} 
                  />

                  {/* Attachments */}
                  {post.attachments && post.attachments.length > 0 && (
                    <div className="mb-6 flex flex-wrap gap-3">
                      {post.attachments.map((file, idx) => (
                        <a 
                          key={idx} 
                          href={file.url} 
                          onClick={(e) => { e.preventDefault(); alert("Downloading mocked attachment..."); }}
                          className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-100 transition-colors group"
                        >
                          <Paperclip className="w-4 h-4 text-blue-500 group-hover:text-blue-700" />
                          <span className="text-sm font-medium text-blue-700">{file.name}</span>
                        </a>
                      ))}
                    </div>
                  )}

                  {/* Tags & Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 ">
                    <div className="flex gap-2">
                      {post.tags.map(tag => (
                        <span key={tag} className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                          #{tag}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <button className="flex items-center gap-1.5 text-gray-500 hover:text-blue-600 transition-colors">
                        <ThumbsUp className="w-4 h-4" />
                        <span className="text-sm font-semibold">{post.upvotes}</span>
                      </button>
                      <button className="flex items-center gap-1.5 text-gray-500 hover:text-gray-900 transition-colors">
                        <MessageSquare className="w-4 h-4" />
                        <span className="text-sm font-semibold">Reply</span>
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 ">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 ">No advice found</h3>
              <p className="text-gray-500 mt-1">Try adjusting your search or filters.</p>
            </div>
          )}
        </div>
      </main>

      {/* Mock Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 ">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-600" />
                Share Advice as a Senior
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-200">
                <strong>Note:</strong> Currently in prototype mode. Submissions will not be saved permanently until the database is connected.
              </p>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input 
                  type="text" 
                  placeholder="e.g., How to revise Organic Chemistry" 
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Advice / Content</label>
                <textarea 
                  rows={5} 
                  placeholder="Share your strategy, tips, or attach notes..." 
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Attach Notes (Optional)</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors cursor-pointer">
                  <Paperclip className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                  <span className="text-sm text-gray-500 ">Click to upload PDF or Images</span>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handlePostSubmit}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm disabled:opacity-50"
              >
                {isSubmitting ? "Posting..." : "Post Advice"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeniorsOpinionPage;
