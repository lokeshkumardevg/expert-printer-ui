import React, { useEffect, useRef, useState } from "react";
import { AchievementsData } from "../jsondata/PrintersData";

// import { Printer, Award, ThumbsUp, Trophy } from "lucide-react";

function AchievementsPage() {
  const stats = AchievementsData.map((item) => ({
    ...item,
    icon: (
      <img
        src={item.icon}
        alt={item.label}
        className="w-12 h-12 sm:w-16 sm:h-16 object-contain"
      />
    ),
  }));

  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [counts, setCounts] = useState(stats.map(() => 0));

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

    stats.forEach((stat, index) => {
      let start = 0;
      const end = stat.value;
      const duration = 3000;
      const stepTime = Math.max(10, duration / end);

      const counter = setInterval(() => {
        start += Math.ceil(end / 60);
        if (start >= end) {
          start = end;
          clearInterval(counter);
        }

        setCounts((prev) => {
          const updated = [...prev];
          updated[index] = start;
          return updated;
        });
      }, stepTime);
    });
  }, [isVisible]);

  return (
    <div
      ref={sectionRef}
      className="bg-white py-12 sm:py-16 lg:py-20 px-6 sm:px-10 lg:px-20"
    >
      <div className="max-w-7xl mx-auto w-full py-12 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-28 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            <div className="space-y-2">
              <h3
              style={{ color: "var(--bg-color)" }}
              className="uppercase tracking-wider text-lg">
                Printer Issues? We’ve Got You Covered
              </h3>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-gray-900 leading-tight">
                Dependable Printer Support
                <br />
                That You Can Trust
              </h1>
            </div>

            <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
              At Printer Expert, we hold the court in the competitive marketing
              world with our AI-Powered Printer Help Desk that acts as your
              personal printer support assistant for multiple leading printer
              brands and models. We provide professional troubleshooting and
              maintenance services for popular brands such as HP, Canon, Epson,
              Brother, Ricoh, Xerox, Samsung, Panasonic, Fujitsu, Kyocera,
              Konica Minolta, Tally, and many more. From driver updates and
              connectivity issues to paper jams and performance errors, all you
              need to do is contact us and our experts will get back to yoy. Or
              you can just tell our own “AI Bot Help Desk” that we have
              customized and trained to behave as your personal online printer
              support hub.
            </p>
            <div style={{ backgroundColor: "var(--bg-color)" }} className="w-40 sm:w-60 lg:w-80 h-1"></div>
          </div>

          {/* Right Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white rounded-3xl p-5 sm:p-8 border border-gray-200 shadow-[6px_6px_0_#007DBA] hover:shadow-[8px_8px_0_#007DBA] transition-all duration-300"
              >
                <div className="flex flex-col items-center text-center space-y-4">
                  <div>{stat.icon}</div>
                  <div className="space-y-2">
                    <div className="text-4xl font-bold text-gray-900">
                      {counts[index].toLocaleString()}
                      {stat.suffix}
                    </div>

                    <div className="text-gray-700 text-base font-medium">
                      {stat.label}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AchievementsPage;
