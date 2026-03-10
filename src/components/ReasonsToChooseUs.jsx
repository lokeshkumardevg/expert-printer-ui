import React from "react";

const ReasonsToChooseUs = () => {
  const scrollToHero = () => {
    const section = document.getElementById("printer-support-hero");
    section?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="w-full py-12 bg-[#007DBA0D]">
      <div className="w-full max-w-[94%] mx-auto px-4 sm:px-6 lg:px-10 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:items-stretch">
        {/* Left Image */}
        <div className="w-full overflow-hidden rounded-3xl h-full min-h-[300px] max-h-[700px]">
          <img
            src="/reason.png"
            alt="Printer Support"
            className="w-full h-full object-cover hover:scale-110 transition"
          />
        </div>

        {/* Right Content */}
        <div style={{ backgroundColor: "var(--bg-color)" }} className="rounded-3xl p-6 md:p-10 text-white flex flex-col h-full">
          <div>
            <h2 className="text-3xl md:text-5xl mb-4 text-center">
              Why Expert Printer?
            </h2>

            <p className="text-md lg:text-lg leading-relaxed mb-4 text-center">
              At Expert Printer, you are more than just a customer—you are our top priority. Unlike generic services that treat clients as numbers, we focus on delivering personalized, hassle-free printing solutions tailored to your needs. Whether it’s a jammed printer, connectivity issues, or advanced settings, our expert team ensures your problems are resolved efficiently and with minimal effort on your part.
            </p>

            <p className="text-md lg:text-lg leading-relaxed mb-4 text-center">
              Our intelligent chatbot instantly understands your printer issue and guides you step by step toward the right solution, saving you both time and frustration. With Expert Printer, you benefit from multi-brand expertise, fast and reliable support, and secure remote assistance available 24/7. No matter the printer make or model, we provide professional help whenever and wherever you need it.{" "}
              
              <span className="font-semibold">“What you see is what you pay.”</span>

            </p>
          </div>

          {/* Button */}
          <button
            onClick={scrollToHero}
            className="mt-10 bg-white text-[#5A96D1] font-medium px-6 py-3 rounded-xl hover:bg-gray-100 transition cursor-pointer"
          >
            Fix It Now
          </button>
        </div>
      </div>
    </section>
  );
};

export default ReasonsToChooseUs;
