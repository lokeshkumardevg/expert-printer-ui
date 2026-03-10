import React, { useState } from "react";
import { createPortal } from "react-dom";
import emailjs from "@emailjs/browser";
import { motion } from "framer-motion";

const ContactPage = ({ onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    setFormData({ ...formData, phone: value });
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
          phone: formData.phone,
          message: formData.message,
        },
        "YOUR_PUBLIC_KEY"
      );
      setFormData({ name: "", email: "", phone: "", message: "" });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      style={{ zIndex: 99999 }}
      className="fixed inset-0 bg-black/70 flex items-center justify-center px-4 sm:px-6"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        key="contactModal"
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 40 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="relative w-full max-w-4xl bg-white rounded-2xl px-6 py-4 sm:px-8 sm:py-6 lg:px-10 lg:py-8 flex flex-col lg:flex-row gap-6 max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-black/70 hover:text-black text-xl z-10 cursor-pointer"
        >
          ✕
        </button>

        {/* LEFT IMAGE */}
        <div className="w-full lg:w-[400px] h-[260px] lg:h-auto lg:self-stretch">
          <motion.img
            src="/public/contact.png"
            alt="Printer Support"
            className="w-full h-full object-cover rounded-[24px]"
            initial={{ opacity: 0, scale: 0.9 }}      // Start invisible and slightly smaller
            animate={{ opacity: 1, scale: 1 }}        // Animate to fully visible and normal size
            transition={{ duration: 0.6, delay: 0.9, ease: "easeOut" }} // Delay for nice staggered effect
          />
        </div>

        {/* RIGHT FORM */}
        <div className="flex-1 overflow-y-auto pr-1">
          <h2 className="text-[28px] font-semibold text-black mb-2">
            Having trouble with your printer?
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Please provide details about the issue you are experiencing with
            your printer. Our technical support team will review your complaint
            and contact you promptly to assist.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Printer Brand */}
            <div>
              <label className="text-sm font-medium text-black">Printer Brand</label>
              <select required className="mt-1 w-full h-[46px] border border-gray-300 rounded-lg px-4 text-sm outline-none focus:ring-1 focus:ring-[#5695D0] focus:border-[#5695D0] transition">
                <option value="">Select your printer brand</option>
                <option>HP</option>
                <option>Canon</option>
                <option>Epson</option>
                <option>Brother</option>
                <option>Panasonic</option>
                <option>Konica Minolta</option>
                <option>Tally</option>
                <option>Xerox</option>
                <option>FUJITSU</option>
                <option>Kyocera</option>
                <option>Samsung</option>
                <option>Ricoh</option>
              </select>
            </div>

            {/* Printer Issue */}
            <div>
              <label className="text-sm font-medium text-black">Printer Issue</label>
              <select required className="mt-1 w-full h-[46px] border border-gray-300 rounded-lg px-4 text-sm outline-none focus:ring-1 focus:ring-[#5695D0] focus:border-[#5695D0] transition">
                <option value="">Select the issue you're facing</option>
                <option>Paper Jam</option>
                <option>Ink Issue</option>
                <option>Not Printing</option>
              </select>
            </div>

            {/* Full Name */}
            <div>
              <label className="text-sm font-medium text-black">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
                className="mt-1 w-full h-[46px] border border-gray-300 rounded-lg px-4 text-sm focus:outline-none focus:ring-1 focus:ring-[#5695D0] focus:border-[#5695D0] transition"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="text-sm font-medium text-black">Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handlePhoneChange}
                placeholder="Enter your contact number"
                maxLength={10}
                className="mt-1 w-full h-[46px] border border-gray-300 rounded-lg px-4 text-sm focus:outline-none focus:ring-1 focus:ring-[#5695D0] focus:border-[#5695D0] transition"
              />
            </div>

            {/* Complaint */}
            <div>
              <label className="text-sm font-medium text-black">Complaint Details</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Type your message..."
                rows="4"
                required
                className="mt-1 w-full border border-gray-300 rounded-lg px-4 py-3 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-[#5695D0] focus:border-[#5695D0] transition"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full h-[48px] rounded-lg text-white text-sm font-medium transition cursor-pointer ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-[#5B9BD5] hover:bg-[#4A8AC4]"
                }`}
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          </form>
        </div>
      </motion.div>
    </motion.section>,
    document.body
  );
};

export default ContactPage;