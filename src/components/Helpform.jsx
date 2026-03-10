// src/components/Helpform.jsx
// Saves form submission to MongoDB via POST /api/chats/new (same as PrinterBot)
// AND sends email via EmailJS (if configured).
// If backend is unreachable, falls back to EmailJS only.

import React, { useState } from "react";
import emailjs from "@emailjs/browser";
import { API_BASE } from "../lib/constants";

const Helpform = () => {
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", model: "", message: "",
  });
  const [errors,    setErrors]    = useState({});
  const [loading,   setLoading]   = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitErr, setSubmitErr] = useState("");

  // ── Validation ──────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!formData.name.trim() || formData.name.trim().length < 2)
      e.name = "Please enter your full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(formData.email.trim()))
      e.email = "Please enter a valid email address.";
    const digits = formData.phone.replace(/\D/g, "");
    if (digits.length < 7 || digits.length > 15)
      e.phone = "Phone must be 7–15 digits.";
    if (!formData.model.trim())
      e.model = "Please enter your device model.";
    if (!formData.message.trim() || formData.message.trim().length < 10)
      e.message = "Please describe your issue (at least 10 characters).";
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
    setSubmitErr("");
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/[^\d\s\-\+\(\)]/g, "");
    setFormData(prev => ({ ...prev, phone: value }));
    if (errors.phone) setErrors(prev => ({ ...prev, phone: "" }));
  };

  // ── Save to MongoDB ──────────────────────────────────────────────────────────
  const saveToDb = async () => {
    const res = await fetch(`${API_BASE}/api/chats/new`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer: formData.name.trim(),
        email:    formData.email.trim(),
        phone:    formData.phone.trim(),
        location: "",
        printer:  formData.model.trim(),
        issue:    formData.message.trim(),
        history:  [
          { sender: "customer", text: `Device: ${formData.model}. Issue: ${formData.message}`, created_at: new Date().toISOString() },
        ],
      }),
    });
    if (!res.ok) throw new Error(`DB save failed: ${res.status}`);
    return res.json();
  };

  // ── Submit ───────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitErr("");
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    let dbOk    = false;
    let emailOk = false;

    // 1. Save to DB
    try {
      await saveToDb();
      dbOk = true;
    } catch (err) {
      console.warn("[Helpform] DB save failed:", err.message);
    }

    // 2. Send email via EmailJS
    try {
      await emailjs.send(
        "YOUR_SERVICE_ID",
        "YOUR_TEMPLATE_ID",
        {
          name:    formData.name,
          email:   formData.email,
          phone:   formData.phone,
          model:   formData.model,
          message: formData.message,
        },
        "YOUR_PUBLIC_KEY"
      );
      emailOk = true;
    } catch (err) {
      console.warn("[Helpform] EmailJS failed:", err.message);
    }

    setLoading(false);

    if (dbOk || emailOk) {
      setFormData({ name: "", email: "", phone: "", model: "", message: "" });
      setErrors({});
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 5000);
    } else {
      setSubmitErr("Submission failed. Please try again or call us directly.");
    }
  };

  // ── Field helper ─────────────────────────────────────────────────────────────
  const inputCls = (field) =>
    `mt-1 w-full h-[46px] border rounded-lg px-4 text-sm focus:outline-none focus:ring-1 transition ${
      errors[field]
        ? "border-red-400 focus:ring-red-300 bg-red-50"
        : "border-gray-300 focus:ring-[#5695D0] focus:border-[#5695D0]"
    }`;

  return (
    <section className="w-full flex items-center justify-center px-4 py-10">
      <div
        className="w-full max-w-4xl bg-white rounded-4xl flex flex-col lg:flex-row gap-6 overflow-hidden px-6 py-8 sm:px-10 sm:py-10"
        style={{ boxShadow: "0 8px 30px rgba(0,0,0,0.12), 0 -8px 30px rgba(0,0,0,0.06), 8px 0 30px rgba(0,0,0,0.06), -8px 0 30px rgba(0,0,0,0.06)" }}
      >
        {/* LEFT IMAGE */}
        <div className="w-full lg:w-[380px] h-[240px] lg:h-auto lg:self-stretch shrink-0">
          <img src="/public/help.png" alt="Printer Support" className="w-full h-full object-cover rounded-[20px]"/>
        </div>

        {/* RIGHT FORM */}
        <div className="flex-1">
          <h2 className="text-[26px] font-semibold text-black mb-1">
            Book Your Free Consultation Today
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Need assistance today? Fill in the details and our best expert will reach out to you for your free consultation.
          </p>

          {submitted && (
            <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg">
              ✅ Your request has been submitted! We'll contact you shortly.
            </div>
          )}
          {submitErr && (
            <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
              {submitErr}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">

            {/* Name */}
            <div>
              <label className="text-sm font-medium text-black">Name <span className="text-red-400">*</span></label>
              <input type="text" name="name" value={formData.name} onChange={handleChange}
                placeholder="Enter your full name" className={inputCls("name")}/>
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="text-sm font-medium text-black">Email <span className="text-red-400">*</span></label>
              <input type="email" name="email" value={formData.email} onChange={handleChange}
                placeholder="Enter your email address" className={inputCls("email")}/>
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="text-sm font-medium text-black">Phone Number <span className="text-red-400">*</span></label>
              <input type="tel" name="phone" value={formData.phone} onChange={handlePhoneChange}
                placeholder="Enter your phone number" className={inputCls("phone")}/>
              {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
            </div>

            {/* Device Model */}
            <div>
              <label className="text-sm font-medium text-black">Device Model <span className="text-red-400">*</span></label>
              <input type="text" name="model" value={formData.model} onChange={handleChange}
                placeholder="e.g. HP LaserJet Pro M404n" className={inputCls("model")}/>
              {errors.model && <p className="text-xs text-red-500 mt-1">{errors.model}</p>}
            </div>

            {/* Issue */}
            <div>
              <label className="text-sm font-medium text-black">Describe Your Issue <span className="text-red-400">*</span></label>
              <textarea name="message" value={formData.message} onChange={handleChange}
                placeholder="Describe the problem you're experiencing..." rows="4"
                className={`mt-1 w-full border rounded-lg px-4 py-3 text-sm resize-none focus:outline-none focus:ring-1 transition ${
                  errors.message ? "border-red-400 focus:ring-red-300 bg-red-50" : "border-gray-300 focus:ring-[#5695D0] focus:border-[#5695D0]"
                }`}/>
              {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message}</p>}
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading}
              className={`w-full h-[48px] rounded-lg text-white text-sm font-medium transition cursor-pointer ${
                loading ? "bg-gray-400 cursor-not-allowed" : "bg-[#007DBA] hover:bg-[#4A8AC4]"
              }`}>
              {loading ? "Submitting…" : "Submit"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Helpform;