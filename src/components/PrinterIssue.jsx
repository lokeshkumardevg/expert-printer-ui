import React from "react";

const PrinterIssue = () => {
  return (
 <section className="w-full bg-[#5695D0]/5 flex items-center min-h-[442px] lg:h-[442px] py-10 lg:py-0">
      <div className="w-full max-w-[1200px] mx-auto px-6 lg:px-0">
        
        {/* Small Upper Text */}
        <p
          className="
            font-['Inter']
            font-normal
            text-[16px] sm:text-[18px] lg:text-[20px]
            leading-[30px]
            tracking-[0.11em]
            uppercase
            text-[#4F86C6]
          "
        >
          Printer Issues? We’ve Got You Covered
        </p>

        {/* Main Heading */}
        <h1
          className="
            mt-6
            font-['Inter']
            font-medium
            text-[28px] sm:text-[34px] md:text-[38px] lg:text-[42px]
            leading-[38px] sm:leading-[44px] lg:leading-[52px]
            text-black
            max-w-[760px]
          "
        >
          Dependable Printer Support
          <br />
          That You Can Trust
        </h1>

        {/* Paragraph */}
        <p
          className="
            mt-6
            font-['Inter']
            font-normal
            text-[14px] sm:text-[15px] lg:text-[16px]
            leading-[22px] sm:leading-[24px] lg:leading-[26px]
            text-[#333]
            max-w-full
          "
        >
          At TechForCall, we provide premium, AI-powered printer diagnostic services that act as your personal tech hub. Our certified specialists provide 24/7 remote support for all leading brands including HP, Canon, Epson, Brother, Ricoh, Xerox, and many more.

          From wireless setup and driver installation to resolving 'Printer Offline' errors and complex hardware diagnostics, our team is ready to help at a moment's notice. You can contact us directly or interact with our intelligent
          {" "}
          <span className="font-semibold text-black">
            “AI Bot Help Desk”
          </span>{" "}
          to get step-by-step guidance for any printer model world-wide.
        </p>

        {/* Bottom Line */}
        <div className="mt-8 sm:mt-10 w-[150px] sm:w-[200px] lg:w-[350px] h-[5px] bg-[#5695D0]" />
      </div>
    </section>
  );
};

export default PrinterIssue;
