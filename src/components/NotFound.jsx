import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="relative flex items-center justify-center min-h-screen bg-white overflow-hidden">

      {/* Floating Background Blobs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#5695D0] opacity-20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-[#5695D0] opacity-20 rounded-full blur-3xl animate-pulse delay-1000"></div>

      {/* Glass Card */}
      <div className="relative z-10 backdrop-blur-lg bg-white/80 shadow-2xl rounded-3xl px-10 py-16 text-center max-w-lg w-[90%]">

        <h1 className="text-8xl md:text-9xl font-extrabold bg-gradient-to-r from-[#5695D0] to-blue-300 bg-clip-text text-transparent">
          404
        </h1>

        <h2 className="text-2xl md:text-3xl font-semibold text-[#5695D0] mt-4">
          Oops! You’re Lost
        </h2>

        <p className="text-gray-600 mt-4 leading-relaxed">
          The page you are looking for might have been removed,
          renamed, or is temporarily unavailable.
        </p>

        <Link
          to="/"
          className="inline-block mt-8 px-8 py-3 bg-[#5695D0] text-white font-semibold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
        >
          🚀 Go Back Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
