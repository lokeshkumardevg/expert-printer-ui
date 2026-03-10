import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function DisclaimerModal({ isOpen, onClose }) {
  const location = useLocation();

  // Only show if path is /support
  if (location.pathname !== "/support") return null;

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleEsc);
    }

    return () => {
      document.body.style.overflow = "auto";
      window.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onClose]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${
        isOpen ? "opacity-100 visible" : "opacity-0 invisible"
      }`}
    >
      {/* Blur Overlay */}
      <div
        onClick={onClose}
        className={`absolute inset-0 backdrop-blur-md bg-white/30 transition-all duration-300 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Modal */}
      <div
        className={`relative bg-white/80 backdrop-blur-xl w-full max-w-3xl mx-4 rounded-2xl shadow-2xl p-8 max-h-[80vh] overflow-y-auto transform transition-all duration-300 ${
          isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-xl cursor-pointer"
        >
          ✕
        </button>

        <h1 className="text-2xl font-bold mb-6">Master Disclaimer</h1>

        <section className="mb-6">
          <h2 className="font-semibold mb-2">
            1. Company Status and Independence
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            TechAssist USA is an independent third-party provider of online
            systems assistance and technical support services.
          </p>
          <p className="text-gray-600 text-sm leading-relaxed mt-2">
            While we are an authorized reseller partner of Hewlett-Packard (HP)
            and employ CompTIA Certified specialists, our services remain independent.
          </p>
          <p className="text-gray-600 text-sm leading-relaxed mt-2">
            We are not affiliated with, endorsed by, or sponsored by Microsoft
            or any other brand unless explicitly stated.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="font-semibold mb-2">2. Trademarks</h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            All trademarks, logos, and brand names are the property of their
            respective owners and are used for identification purposes only.
          </p>
        </section>

        <section>
          <h2 className="font-semibold mb-2">3. Limitation of Liability</h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            Services are provided without warranties of any kind. TechAssist USA
            shall not be liable for indirect or consequential damages arising
            from the use of our services.
          </p>
        </section>
      </div>
    </div>
  );
}