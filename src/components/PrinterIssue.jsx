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
          At Printer Expert, we hold the court in the competitive marketing world with our AI-Powered Printer Help Desk that acts as your personal printer support assistant for multiple leading printer brands and models. We provide professional troubleshooting and maintenance services for popular brands such as HP, Canon, Epson, Brother, Ricoh, Xerox, Samsung, Panasonic, Fujitsu, Kyocera, Konica Minolta, Tally, and many more.

From driver updates and connectivity issues to paper jams and performance errors, all you need to do is contact us and our experts will get back to yoy. Or you can just tell our own 
{" "}
          <span className="font-semibold text-black">
            “AI Bot Help Desk”
          </span>{" "}
          that we have customized and trained to behave as your personal online printer support hub.
        </p>

        {/* Bottom Line */}
        <div className="mt-8 sm:mt-10 w-[150px] sm:w-[200px] lg:w-[350px] h-[5px] bg-[#5695D0]" />
      </div>
    </section>
  );
};

export default PrinterIssue;
