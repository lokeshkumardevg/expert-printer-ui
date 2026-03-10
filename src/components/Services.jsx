import { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
const services = [
    {
        title: "On Site Repair",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do.",
        image: "/onsite.png",
        showPin: true,
    },
    {
        title: "Printer Setup & Connectivity",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do.",
        image: "printer_setup.png",
        showPin: false,
    },
    {
        title: "System Speed & Health",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do.",
        image: "system_speed.png",
        showPin: false,
    },
    {
        title: "Security & Antivirus",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do.",
        image: "/s&a.png",
        showPin: false,
    },
];

const PinIcon = () => (
    <div
        style={{
            width: 40,
            height: 40,
            background: "#1a7fd4",
            borderRadius: "50% 50% 50% 0",
            transform: "rotate(-45deg)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.35)",
        }}
    >
        <svg
            style={{ transform: "rotate(45deg)", width: 18, height: 18, fill: "white" }}
            viewBox="0 0 24 24"
        >
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" />
        </svg>
    </div>
);

const ServiceCard = ({ title, description, image, showPin }) => {
    const [hovered, setHovered] = useState(false);

    return (
        <div
            className="relative rounded-2xl overflow-hidden cursor-pointer"
            style={{ height: 340 }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {/* Image */}
            <img
                src={image}
                alt={title}
                className="w-full h-full object-cover"
                style={{
                    transition: "transform 0.4s ease",
                    transform: hovered ? "scale(1.05)" : "scale(1)",
                }}
            />

            {/* Gradient Overlay */}
            <div
                className="absolute bottom-0 left-0 right-0 text-white text-left"
                style={{
                    padding: "20px 18px 22px",
                    background:
                        "linear-gradient(to top, rgba(10,50,90,0.92) 0%, rgba(10,50,90,0.5) 60%, transparent 100%)",
                }}
            >
                <h3 className="font-bold text-sm uppercase tracking-wide mb-2 leading-snug">
                    {title}
                </h3>
                <p className="text-xs leading-relaxed opacity-90 font-normal">
                    {description}
                </p>
            </div>
        </div>
    );
};

export default function ServicesSection({colorClass}) {
      const text = "Our Services";
      const [displayText, setDisplayText] = useState("");
      const [isDeleting, setIsDeleting] = useState(false);
      const [index, setIndex] = useState(0);
    
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
        <section className={`w-full ${colorClass} py-16 px-10`}>
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-gray-900 mb-4"> {displayText} < span className="animate-pulse" >| </span></h2>
                    <p className="text-gray-500 text-base max-w-lg mx-auto leading-relaxed">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod
                        tempor incididunt ut labore et dolore magna aliqua.
                    </p>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
                    {services.map((service, index) => (
                        <ServiceCard key={index} {...service} />
                    ))}
                </div>

                {/* Button */}

                <div className="flex justify-center">
                    <NavLink to="/services">
                    <button
                        style={{ backgroundColor: "var(--bg-color)" }}
                        className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-lg cursor-pointer px-6 font-medium text-white"
                    >
                        <span>View All Services</span>

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
            </div>
        </section>
    );
}