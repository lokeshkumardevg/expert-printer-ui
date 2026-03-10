import React,{useState, useEffect} from "react";
import { TestimonialsData } from "../jsondata/TestimonialsData";


const testimonials = TestimonialsData;


const Testimonials = () => {
  const text = "Customer Experiences That Speak for Themselves";
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
    <section className="bg-white py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-black">
            {displayText}
            <span className="animate-pulse ">|</span>
          </h2>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
            Real feedback from customers who trust Expert Printer for fast, reliable, and professional printer support.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl shadow-sm border border-gray-200 transition overflow-hidden flex flex-col p-6 hover:-translate-y-2 hover:shadow-2xl shadow-md"
            >
              {/* User Info */}
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-semibold text-black">{item.name}</h4>
                  <p className="text-sm text-gray-500">{item.role}</p>
                </div>
              </div>

              {/* Message */}
              <p className="text-gray-700 text-sm leading-relaxed">
                “{item.message}”
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
