import React, { useEffect, useRef, useState } from "react";
import { PrinterRepairServicesData } from "../jsondata/PrintersData";

export default function PrinterRepairServices() {
  const features = PrinterRepairServicesData.map((item) => ({
    ...item,
    icon: item.bgIcon ? (
      <div className="relative w-12 h-12 sm:w-16 sm:h-16">
        <img
          src={item.bgIcon}
          alt="bg"
          className="w-full h-full object-contain"
        />

        <img
          src={item.icon}
          alt={item.title}
          className="absolute inset-0 m-auto w-6 h-6 sm:w-8 sm:h-8 object-contain"
        />
      </div>
    ) : (
      <img
        src={item.icon}
        alt={item.title}
        className="w-12 h-12 sm:w-16 sm:h-16 object-contain"
      />
    ),
  }));

  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [counts, setCounts] = useState(features.map(() => 0));

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );

    if (sectionRef.current) observer.observe(sectionRef.current);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    features.forEach((feature, index) => {
      let start = 0;
      const end = feature.value;
      const duration = 3000; // slow & smooth
      const increment = Math.ceil(end / 60);

      const counter = setInterval(() => {
        start += increment;
        if (start >= end) {
          start = end;
          clearInterval(counter);
        }

        setCounts((prev) => {
          const updated = [...prev];
          updated[index] = start;
          return updated;
        });
      }, duration / 60);
    });
  }, [isVisible]);

    const text = "Trusted AI-Powered Online Printer Support";
    const [displayText, setDisplayText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [index, setIndex] = useState(0);
  
    // State to control modal
  
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

  return (
    <div ref={sectionRef} className="bg-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <h1 className="text-center text-3xl md:text-4xl font-bold text-black">
          {displayText}
            <span className="animate-pulse ">|</span>
        </h1>

        {/* Description */}
        <p className="text-center mt-4 text-gray-600 text-base md:text-lg leading-relaxed max-w-5xl mx-auto mb-16">
          We are known to set clear benchmarks through the quality and
          reliability of our printer support, which is backed up by our
          AI-Powered Printer Help Desk.
        </p>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-3xl p-12 text-center transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl shadow-md"
            >
              {/* Icon */}
              <div className="w-20 h-20 mx-auto mb-8 text-blue-500">
                {feature.icon}
              </div>

              {/* Number */}
              <div className="text-5xl font-bold text-gray-900 mb-4">
                {counts[index]}
                {feature.suffix}
              </div>

              {/* Title */}
              <div className="text-xl text-gray-600 font-medium">
                {feature.title}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
