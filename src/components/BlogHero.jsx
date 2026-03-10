import React from "react";

const BlogHero = ({ heroData }) => {
  return (
    <section className="relative w-full flex items-center bg-black min-h-[422px] mt-8 lg:mt-20">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${heroData.backgroundImage})`,
        }}
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-[1440px] mx-auto px-4 py-[70px] text-white text-center">
        <p className="text-sm opacity-90 mb-3">
          {heroData.date}
        </p>

        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[40px] font-bold leading-tight mx-auto max-w-4xl">
          {heroData.title}
        </h1>

        <p className="mt-5 mx-auto max-w-3xl text-sm sm:text-base opacity-90">
          {heroData.description}
        </p>
      </div>
    </section>
  );
};

export default BlogHero;




// import React from "react";

// const BlogPrinter = () => {
//   return (
//     <section className="relative w-full flex items-center bg-black min-h-[422px] mt-8 lg:mt-20">
//       {/* Background */}
//       <div
//         className="absolute inset-0 bg-cover bg-center bg-no-repeat"
//         style={{
//           backgroundImage:
//             'url("/bloghero.png")',
//           opacity: 1,
//         }}
//       />

//       {/* Overlay */}
//       <div className="absolute inset-0 bg-black/60" />

//       {/* Content */}
      
// <div
//   className="
//     relative z-10 w-full
//     max-w-[1440px] mx-auto
//     px-0
//     py-[70px]
//     text-white
//     text-center
//   "
// >
//   <p className="text-sm opacity-90 mb-3">
//     July 3, 2025
//   </p>

//   <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[40px] font-bold leading-tight mx-auto max-w-4xl">
//     Troubleshooting Printer Connection Drops
//     <br className="hidden sm:block" />
//     on Wireless Networks
//   </h1>

//   <p className="mt-5 mx-auto max-w-3xl text-sm sm:text-base opacity-90">
//     Printer connection drops on Wi-Fi is a very common problem. Almost
//     everyone who has a wireless printer faces this issue. When the printer
//     is connected to the wireless router for a long time, these issues
//     become repetitive. If you are facing such a printer network problem
//     while connecting to wireless networks, your devices might need a
//     reset. In this blog, we will guide you through the process of
//     resetting all your devices that help the printer stay online.
//   </p>
// </div>

//     </section>
//   );
// };

// export default BlogPrinter;
