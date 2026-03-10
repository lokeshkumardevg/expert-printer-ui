import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";

const PrinterSupportHero = () => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    let newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.phone))
      newErrors.phone = "Phone number must be 10 digits";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email))
      newErrors.email = "Enter a valid email address";
    if (!formData.message.trim()) newErrors.message = "Message is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      setLoading(true);
      const response = await fetch("https://your-api-endpoint.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error("Failed to submit");
      setFormData({ name: "", phone: "", email: "", message: "" });
      setShowPopup(true);
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5695D0] focus:border-[#5695D0] transition";

  return (
    <>
      <section
        id="printer-support-hero"
        className="relative pt-10 min-h-screen flex items-center overflow-hidden"
      >
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url("/home_bg.png")' }}
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-[#007DBA80]" />

        {/* Content wrapper */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-20 sm:py-24 lg:py-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

            {/* ── LEFT: Text content ── */}
            <div className="text-white space-y-5 sm:space-y-6">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                Expert Systems Assistance & Authorized Hardware Solutions.
              </h1>

              <p className="text-sm sm:text-base lg:text-lg text-gray-200 leading-relaxed">
                Patient, live online guidance for seniors and home offices. We help you stay connected without the frustration.
              </p>
              <NavLink to="/support">
              <button
                style={{ backgroundColor: "var(--bg-color)" }}
                className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-lg cursor-pointer px-6 font-medium text-white"
              >
                <span>Get Live Help Now</span>

                <div className="w-0 translate-x-[100%] pl-0 opacity-0 transition-all duration-200 group-hover:w-5 group-hover:translate-x-0 group-hover:pl-1 group-hover:opacity-100">
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 15 15"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                  >
                    <path
                      d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z"
                      fill="currentColor"
                      fillRule="evenodd"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </button>
             </NavLink>
            </div>

            {/* ── RIGHT: Form ── */}
            <div className="w-full">
              <div className="bg-white rounded-3xl shadow-xl p-5 sm:p-7 lg:p-9 transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-2xl">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-1.5 sm:mb-2">
                  Having trouble with your printer?
                </h2>

                <p className="text-xs sm:text-sm lg:text-base text-gray-600 mb-4 sm:mb-6 leading-relaxed">
                  Please provide details about the issue you are experiencing.
                  Our technical support team will contact you promptly.
                </p>

                <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your name"
                      className={inputClass}
                      required
                    />
                    {errors.name && (
                      <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter your phone number"
                      className={inputClass}
                      required
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      className={inputClass}
                      required
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                    )}
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-xs sm:text-sm font-semibold mb-1">
                      Looking For?
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows="3"
                      placeholder="Describe your issue"
                      className={inputClass}
                      required
                    />
                    {errors.message && (
                      <p className="text-red-500 text-xs mt-1">{errors.message}</p>
                    )}
                  </div>

                  {/* Submit */}
                  <button
                    style={{ backgroundColor: "var(--bg-color)" }}
                    type="submit"
                    disabled={loading}
                    className={`w-full text-white py-3 sm:py-4 rounded-lg font-semibold text-sm sm:text-base transition shadow-lg ${loading
                      ? "cursor-not-allowed"
                      : "hover:opacity-90 cursor-pointer"
                      }`}
                  >
                    {loading ? "Submitting..." : "Submit"}
                  </button>
                </form>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Success Popup */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-sm text-center shadow-2xl">
            <div className="text-4xl mb-3">🎉</div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2 text-gray-800">
              Form Submitted Successfully!
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-5">
              Our expert will contact you shortly.
            </p>
            <button
              onClick={() => setShowPopup(false)}
              className="bg-[#5695D0] text-white px-6 py-2.5 rounded-lg hover:opacity-90 transition text-sm sm:text-base font-medium w-full sm:w-auto"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default PrinterSupportHero;