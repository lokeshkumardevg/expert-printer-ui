import { useEffect, useRef, useState } from "react";

export default function CertificateSection() {
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.3 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="w-full bg-[#007DBA0D] py-16 px-4 sm:px-6 flex items-center justify-center"
    >
      {/* Card */}
      <div
        className={`flex flex-col sm:flex-row items-center gap-6 sm:gap-10 rounded-3xl px-6 sm:px-10 md:px-12 py-8 sm:py-10 w-full max-w-4xl
          transition-all duration-700 ease-out
          ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        style={{ backgroundColor: "var(--bg-color, #1e3a5f)" }}
      >
        {/* Badge */}
        <div
          className={`flex-shrink-0 transition-all duration-700 ease-out delay-200
            ${visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"}`}
        >
          <div
            className="bg-white rounded-full flex items-center justify-center overflow-hidden
              hover:scale-110 hover:rotate-6 hover:shadow-2xl
              transition-all duration-300 ease-out cursor-pointer"
            style={{ width: 200, height: 200 }}
          >
            <img
              src="/certification.png"
              alt="CompTIA A+ Certification"
              className={`transition-all duration-700 ease-out delay-300
                ${visible ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-50 rotate-180"}`}
              style={{ width: 150, height: 150, objectFit: "contain" }}
            />
          </div>
        </div>

        {/* Text */}
        <div
          className={`text-white text-center sm:text-left transition-all duration-700 ease-out delay-300
            ${visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}
        >
          <p
            className={`text-xs font-semibold tracking-widest mb-2 uppercase transition-all duration-700 delay-400
              ${visible ? "opacity-75" : "opacity-0"}`}
          >
            Certificate
          </p>
          <h2
            className={`text-2xl sm:text-3xl font-bold text-white mb-3 leading-tight
              transition-all duration-700 ease-out delay-500
              ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            CompTIA Certified Experts
          </h2>
          <p
            className={`text-sm leading-relaxed transition-all duration-700 ease-out delay-700
              ${visible ? "opacity-85 translate-y-0" : "opacity-0 translate-y-4"}`}
            style={{ color: "rgba(255,255,255,0.85)", maxWidth: 420 }}
          >
            Our specialists hold industry-standard certifications to ensure your
            devices are handled with professional care.
          </p>
        </div>
      </div>
    </section>
  );
}