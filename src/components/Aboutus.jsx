import React, { useEffect, useRef, useState } from "react";
import { AchievementsData } from "../jsondata/PrintersData";

// import { Printer, Award, ThumbsUp, Trophy } from "lucide-react";

function Aboutus() {
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
            className="bg-[#007DBA0D] py-12 sm:py-16 lg:py-20 px-6 sm:px-10 lg:px-20"
        >
            <div className="max-w-7xl mx-auto w-full py-12 sm:py-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-28 items-center">
                    {/* Left Content */}
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <h3
                                style={{ color: "var(--bg-color)" }}
                                className="uppercase tracking-wider text-lg">
                                about us
                            </h3>
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-gray-900 leading-tight">
                                Reliable Printer Support
                                <br />
                                You Can Count On
                            </h1>
                        </div>

                        <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                            Dealing with printer errors, slow performance, or constant connection issues? You don’t have to figure it out alone. Our expert printer support services are designed to quickly diagnose problems, fix errors, and keep your printer running smoothly—without the stress.
                            <br />
                            Whether it’s setup issues, driver problems, paper jams, or network errors, our skilled technicians provide clear, effective solutions tailored to your printer model. We focus on fast response, accurate troubleshooting, and long-term reliability so you can get back to work without interruptions.
                            <br /><br />
                            Contact Expert Printer Support at +1-702-555-0122 for dependable, straightforward assistance whenever you need it.
                        </p>
                        <div style={{ backgroundColor: "var(--bg-color)" }} className="w-40 sm:w-60 lg:w-80 h-1"></div>
                    </div>


                    <div className="w-full overflow-hidden rounded-3xl h-full max-h-[550px]">
                        <img
                            src="/aboutus.png"
                            alt="Printer Support"
                            className="w-full h-full object-cover hover:scale-110 transition"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Aboutus;
