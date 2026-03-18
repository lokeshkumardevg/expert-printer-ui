import React, { useState, useEffect } from "react";
import { API_BASE } from "../lib/constants";

const RecentBlogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const text = " Insights, Updates & Technical Resources";
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [index, setIndex] = useState(0);

  const [activeBlog, setActiveBlog] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/blogs`);
        const data = await res.json();
        setBlogs(data.blogs.slice(0, 3) || []);
      } catch (e) {
        console.error("Failed to fetch blogs:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    const typingSpeed = isDeleting ? 30 : 60;
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        setDisplayText(text.slice(0, index + 1));
        setIndex(index + 1);
        if (index + 1 === text.length) setTimeout(() => setIsDeleting(true), 1000);
      } else {
        setDisplayText(text.slice(0, index - 1));
        setIndex(index - 1);
        if (index - 1 === 0) setIsDeleting(false);
      }
    }, typingSpeed);
    return () => clearTimeout(timeout);
  }, [index, isDeleting]);

  const openModal = (blog) => setActiveBlog(blog);
  const closeModal = () => setActiveBlog(null);

  return (
    <section id="blog" className="bg-[#007DBA0D] py-16 px-4 relative z-0">
      <div className="max-w-7xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-black min-h-[48px]">
            {displayText}
            <span className="animate-pulse ">|</span>
          </h2>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
            Explore our latest articles, firmware updates, and expert tips to keep your printer running smoothly.
          </p>
        </div>

        {/* Blog Cards */}
        {loading ? (
           <div className="flex justify-center p-10 text-gray-400 font-medium">Loading articles...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((blog) => (
              <div
                key={blog._id}
                className="bg-white rounded-3xl shadow-sm border border-gray-200 transition overflow-hidden flex flex-col hover:-translate-y-2 hover:shadow-2xl group"
              >
                <div className="h-56 w-full overflow-hidden">
                   <img
                    src={blog.image || "/blog_placeholder.png"}
                    alt={blog.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#5695D0] bg-blue-50 px-2 py-1 rounded inline-block w-fit">
                    {blog.category}
                  </span>
                  <h3 className="mt-3 text-xl font-bold text-black leading-snug line-clamp-2 h-14">
                    {blog.title}
                  </h3>
                  <p className="mt-3 text-gray-600 text-sm flex-1 line-clamp-3">
                    {blog.content}
                  </p>

                  <button
                    style={{ backgroundColor: "var(--bg-color)" }}
                    onClick={() => openModal(blog)}
                    className="mt-6 hover:opacity-90 transition text-white py-3 rounded-xl font-medium cursor-pointer shadow-md"
                  >
                    Read More
                  </button>
                </div>
              </div>
            ))}
            {blogs.length === 0 && !loading && (
               <div className="col-span-full text-center py-10 text-gray-400">No blogs published yet.</div>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {activeBlog && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 sm:p-6"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[92vh] relative overflow-hidden flex flex-col animate-fadeIn border border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            {/* STICKY HEADER */}
            <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-20">
               <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-2.5 py-1.5 rounded-lg border border-blue-100">
                    {activeBlog.category}
                  </span>
                  <span className="text-[11px] text-gray-400 font-medium">
                    {new Date(activeBlog.created_at).toLocaleDateString(undefined, { dateStyle: 'long' })}
                  </span>
               </div>
               <button 
                  onClick={closeModal}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-black transition-all cursor-pointer border border-gray-100"
               >✕</button>
            </div>

            {/* Scrollable Content Area */}
            <div className="overflow-y-auto overflow-x-hidden">
              <div className="p-8 sm:p-12 pt-6">
                <div className="relative mb-10 group">
                   <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                   <img
                    src={activeBlog.image || "/blog_placeholder.png"}
                    alt={activeBlog.title}
                    className="relative w-full h-56 sm:h-96 object-cover rounded-2xl shadow-2xl border border-gray-100"
                  />
                </div>
                
                <h2 className="text-3xl sm:text-5xl font-black text-gray-900 leading-[1.15] mb-8 tracking-tight">
                  {activeBlog.title}
                </h2>
                
                <div className="markdown-container text-gray-700 leading-relaxed text-lg sm:text-xl whitespace-pre-wrap mb-16 pb-12 border-b border-gray-50">
                   {activeBlog.content}
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-8 bg-gray-50 rounded-3xl border border-gray-100">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center font-black text-2xl text-blue-600 shadow-sm border border-gray-100">
                      {activeBlog.author[0]}
                    </div>
                    <div>
                      <p className="font-extrabold text-gray-900 text-lg uppercase tracking-tight">{activeBlog.author}</p>
                      <p className="text-blue-500 font-bold text-xs uppercase tracking-widest mt-0.5">Certified Tech Specialist</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                       <span className="text-xl font-black text-gray-900">100%</span>
                       <span className="text-[10px] text-gray-400 uppercase font-bold">Accuracy</span>
                    </div>
                    <div className="h-10 w-px bg-gray-200"></div>
                    <div className="flex flex-col items-center">
                       <span className="text-xl font-black text-gray-900">24/7</span>
                       <span className="text-[10px] text-gray-400 uppercase font-bold">Support</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .animate-fadeIn {
          animation: fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        @keyframes fadeIn {
          0% { opacity: 0; transform: scale(0.95) translateY(10px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </section>
  );
};

export default RecentBlogs;
