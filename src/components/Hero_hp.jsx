import React from "react";

const Hero_hp = ({ themeImage, title, subtitle }) => {
  return (
    <section
      id="printer-support-hero"
      className="relative pt-20 flex items-center overflow-hidden"
    >
      {/* Background image */}
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center"
        style={{ backgroundImage: `url(${themeImage})` }}
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-[#007DBA80]" />

      {/* Content wrapper */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-16 sm:py-18 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* ── LEFT: Text content ── */}
          <div className="text-white space-y-5 sm:space-y-6">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-[47px] font-semibold">
              {title}
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-gray-200 leading-relaxed">
              {subtitle}
            </p>
          </div>

          {/* ── RIGHT: Image ── */}
          <div className="w-full flex justify-center lg:justify-end w-full h-full bg-cover">
            <img
              src="/printer_.png"
              alt="Printer"
              className="h-40 sm:h-48 md:h-60 lg:h-60 w-auto object-contain"
            />
          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero_hp;