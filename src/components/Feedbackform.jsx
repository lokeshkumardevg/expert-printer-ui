import React, { useState } from "react";
import emailjs from "@emailjs/browser";

const Feedbackform = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    rating: 0,
    comment: "",
  });
  const [hovered, setHovered] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await emailjs.send(
        "YOUR_SERVICE_ID",
        "YOUR_TEMPLATE_ID",
        {
          name: formData.name,
          email: formData.email,
          rating: formData.rating,
          comment: formData.comment,
        },
        "YOUR_PUBLIC_KEY"
      );
      setFormData({ name: "", email: "", rating: 0, comment: "" });
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 4000);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full flex items-center justify-center px-4 py-10">
      <div
        className="w-full max-w-4xl bg-white rounded-2xl flex flex-col lg:flex-row overflow-hidden"
        style={{
          boxShadow:
            "0 8px 30px rgba(0,0,0,0.12), 0 -8px 30px rgba(0,0,0,0.06), 8px 0 30px rgba(0,0,0,0.06), -8px 0 30px rgba(0,0,0,0.06)",
        }}
      >
        {/* LEFT IMAGE */}
        <div className="w-full lg:w-[360px] h-[260px] lg:h-auto shrink-0">
          <img
            src="/public/help.png"
            alt="Feedback"
            className="w-full h-full object-cover"
          />
        </div>

        {/* RIGHT FORM */}
        <div className="flex-1 px-8 py-10">
          <h2 className="text-[26px] font-semibold text-black mb-1">
            Share Your Feedback
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            We value your feedback and would love to hear about your experience with our printer support services. Your input helps us improve and serve you better.
          </p>

          {submitted && (
            <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg">
              ✅ Thank you! Your feedback has been submitted.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Name */}
            <div>
              <label className="text-sm font-medium text-black">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
                required
                className="mt-1 w-full h-[46px] border border-gray-300 rounded-lg px-4 text-sm focus:outline-none focus:ring-1 focus:ring-[#007DBA] focus:border-[#007DBA] transition"
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-sm font-medium text-black">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
                className="mt-1 w-full h-[46px] border border-gray-300 rounded-lg px-4 text-sm focus:outline-none focus:ring-1 focus:ring-[#007DBA] focus:border-[#007DBA] transition"
              />
            </div>

            {/* Star Rating */}
            <div>
              <label className="text-sm font-medium text-black">Rating</label>
              <div className="mt-2 flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData({ ...formData, rating: star })}
                    onMouseEnter={() => setHovered(star)}
                    onMouseLeave={() => setHovered(0)}
                    className="text-2xl focus:outline-none transition-transform hover:scale-110"
                  >
                    <span
                      style={{
                        color:
                          star <= (hovered || formData.rating)
                            ? "#007DBA"
                            : "#D1D5DB",
                        transition: "color 0.15s",
                      }}
                    >
                      ★
                    </span>
                  </button>
                ))}
              </div>
              {/* Hidden input for form validation */}
              <input
                type="number"
                value={formData.rating}
                onChange={() => {}}
                min="1"
                max="5"
                required
                className="sr-only"
                tabIndex={-1}
              />
            </div>

            {/* Comment */}
            <div>
              <label className="text-sm font-medium text-black">Comment</label>
              <textarea
                name="comment"
                value={formData.comment}
                onChange={handleChange}
                placeholder="Type here..."
                rows="4"
                required
                className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-3 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-[#007DBA] focus:border-[#007DBA] transition"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full h-[48px] rounded-lg text-white text-sm font-medium transition cursor-pointer ${
                loading ? "bg-gray-400 cursor-not-allowed" : "bg-[#007DBA] hover:bg-[#005f8e]"
              }`}
            >
              {loading ? "Submitting..." : "Submit Feedback"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Feedbackform;