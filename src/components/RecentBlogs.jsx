import React, { useState, useEffect } from "react";
import blogsData from "../jsondata/BlogsData"; // JSON with full blog details

const blogs = [
  {
    id: 1,
    slug: "fix",
    image: "/memory.png",
    date: "July 3, 2025",
    title: "How to Fix Printer “Memory Full” Error on Windows 10",
    description:
      "If your printer is showing a “Memory Full” error on Windows 10, it usually means the printer’s internal memory is overloaded or there’s a large print...",
  },
  {
    id: 2,
    slug: "troubleshooting",
    image: "/trouble.png",
    date: "July 1, 2025",
    title: "Troubleshooting Printer Connection Drops",
    description:
      "Printer connection drops on Wi-Fi is a very common problem. Almost everyone who has a wireless printer faces this issue. When the printer...",
  },
  {
    id: 3,
    slug: "blackink",
    image: "/ink.png",
    date: "June 29, 2025",
    title: "Printer Not Printing Black Ink After Cartridge?",
    description:
      "If your printer is showing a “Memory Full” error on Windows 10, it usually means the printer’s internal memory is overloaded or there’s a large print...",
  },
];

const RecentBlogs = () => {
  const text = " Insights, Updates & Technical Resources";
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [index, setIndex] = useState(0);

  // State to control modal
  const [activeBlogSlug, setActiveBlogSlug] = useState(null);

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

  const openModal = (slug) => setActiveBlogSlug(slug);
  const closeModal = () => setActiveBlogSlug(null);

  return (
    <section id="blog" className="bg-[#007DBA0D] py-16 px-4 relative z-0">
      <div className="max-w-7xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-black">
            {displayText}
            <span className="animate-pulse ">|</span>
          </h2>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
            Explore our latest articles, firmware updates, and expert tips to keep your printer running smoothly.
          </p>
        </div>

        {/* Blog Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map((blog) => (
            <div
              key={blog.id}
              className="bg-white rounded-3xl shadow-sm border border-gray-200 transition overflow-hidden flex flex-col hover:-translate-y-2 hover:shadow-2xl"
            >
              <img
                src={blog.image}
                alt={blog.title}
                className="h-56 w-full object-cover"
              />
              <div className="p-6 flex flex-col flex-1">
                <span className="text-sm text-[#5695D0] font-medium">{blog.date}</span>
                <h3 className="mt-3 text-xl font-bold text-black leading-snug">{blog.title}</h3>
                <p className="mt-3 text-gray-600 text-sm flex-1">{blog.description}</p>

                <button
                  style={{ backgroundColor: "var(--bg-color)" }}
                  onClick={() => openModal(blog.slug)}
                  className="mt-6 hover:opacity-90 transition text-white py-3 rounded-xl font-medium cursor-pointer"
                >
                  Read More
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {activeBlogSlug && (
        <div
          className="fixed inset-0 z-1000 flex items-center justify-center bg-black/40 backdrop-blur-sm p-6"
          onClick={closeModal} // clicking on backdrop closes modal
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-3xl w-full p-6 relative overflow-y-auto max-h-[70vh] animate-fadeIn"
            onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside modal
          >
            {/* Close Button */}
{/* <button
  onClick={closeModal}
  className="
    fixed
    top-4
    right-4
    md:top-[15%] 
    md:right-[25.5%] 
    cursor-pointer 
    text-gray-500 
    hover:text-gray-800 
    text-xl 
    font-bold
  "
>
  ✕
</button> */}


            {/* Hero Section */}
            <img
              src={blogsData[activeBlogSlug].hero.backgroundImage}
              alt={blogsData[activeBlogSlug].hero.title}
              className="w-full h-48 md:h-56 object-cover rounded-xl mb-4"
            />
            <span className="text-sm text-blue-600 font-medium">
              {blogsData[activeBlogSlug].hero.date}
            </span>
            <h2 className="text-2xl md:text-3xl font-bold mt-2 text-gray-900">
              {blogsData[activeBlogSlug].hero.title}
            </h2>
            <p className="mt-3 text-gray-700">{blogsData[activeBlogSlug].hero.description}</p>

            {/* Steps */}
            <div className="mt-6 space-y-6">
              {blogsData[activeBlogSlug].steps.map((step, idx) => (
                <div key={idx} className="flex flex-col md:flex-row items-start md:items-center gap-4">
                  <img
                    src={step.image}
                    alt={step.step}
                    className="w-full md:w-32 rounded-xl object-cover shadow"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">{step.step}</h4>
                    <p className="text-gray-700">{step.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Modal Fade Animation */}
          <style>
            {`
        .animate-fadeIn {
          animation: fadeIn 0.25s ease-out;
        }
        @keyframes fadeIn {
          0% {opacity: 0; transform: translateY(-10px);}
          100% {opacity: 1; transform: translateY(0);}
        }
      `}
          </style>
        </div>
      )}

    </section>
  );
};

export default RecentBlogs;
