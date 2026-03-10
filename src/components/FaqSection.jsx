import React, { useState, useEffect } from "react";
import { FaqData } from "../jsondata/TestimonialsData";

const faqs = FaqData;

const FaqSection = () => {
  const [openIndex, setOpenIndex] = useState(0);
  const text = "Frequently Asked Questions";
  
    const [displayText, setDisplayText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [index, setIndex] = useState(0);
  
    useEffect(() => {
      const typingSpeed = isDeleting ? 30 : 60;
  
      const timeout = setTimeout(() => {
        if (!isDeleting) {
          // Typing forward
          setDisplayText(text.slice(0, index + 1));
          setIndex(index + 1);
  
          if (index + 1 === text.length) {
            setTimeout(() => setIsDeleting(true), 1000); // pause before delete
          }
        } else {
          // Deleting
          setDisplayText(text.slice(0, index - 1));
          setIndex(index - 1);
  
          if (index - 1 === 0) {
            setIsDeleting(false);
          }
        }
      }, typingSpeed);
  
      return () => clearTimeout(timeout);
    }, [index, isDeleting]);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="bg-[#007DBA0D] py-16 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-black">
              {displayText}
          <span className="animate-pulse">|</span>
          </h2>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
           Check out the answers to some of the common questions about our AI-powered printer help desk and expert assistance.
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-5">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-gray-200 transition overflow-hidden flex flex-col p-0 rounded-2xl shadow-sm bg-white hover:-translate-y-2 hover:shadow-2xl shadow-md"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex justify-between items-center p-6 text-left cursor-pointer"
              >
                <h3 className="text-lg md:text-xl font-semibold text-black">
                  {faq.question}
                </h3>
                <span className="text-2xl font-bold">
                  {openIndex === index ? "−" : "+"}
                </span>
              </button>

             <div
  className={`px-6 overflow-hidden transition-all duration-300 ease-in-out text-gray-700 text-sm leading-relaxed
    ${
      openIndex === index
        ? "max-h-[500px] opacity-100 pb-6"
        : "max-h-0 opacity-0 pb-0"
    }`}
>
  {faq.answer}
</div>

            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FaqSection;
