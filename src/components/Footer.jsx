import { Link } from "react-router-dom";
import { useState } from "react";
import ContactPage from "./ContactPage";
import DisclaimerModal from "./Disclaimer";
import { motion, AnimatePresence } from "framer-motion";

function Footer({colorClass}) {
  const [openContact, setOpenContact] = useState(false);
  const navLinks = [
    { label: "Privacy Policy ", path: "/" },
    { label: "Terms of Service  ", path: "/" },
    { label: "Refund Policy ", path: "/" },
    { label: "Shipping Policy ", path: "/" },
  ];
  const [open, setOpen] = useState(false);
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (!element) return;

    const offset = 82; // header height
    const targetPosition = element.getBoundingClientRect().top + window.scrollY - offset;
    const startPosition = window.scrollY;
    const distance = targetPosition - startPosition;
    const duration = 800; // in milliseconds, increase for slower scroll
    let startTime = null;

    const easeInOutQuad = (t) =>
      t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

    const animation = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);
      const run = startPosition + distance * easeInOutQuad(progress);
      window.scrollTo(0, run);
      if (timeElapsed < duration) requestAnimationFrame(animation);
    };

  };
  return (
    <footer className={`w-full ${colorClass} text-black flex justify-center`}>
      <div className="w-full flex flex-col items-center px-6 pb-8 sm:pb-10">
        <div className="w-full max-w-[1240px] min-h-[401px] px-6 sm:px-10 lg:px-[60px] py-[40px] flex flex-col gap-[35px]">
          {/* TOP ROW */}
          <div className="flex flex-col items-center text-center gap-5 sm:flex-row sm:items-start sm:justify-between sm:text-left">
            <img
              src="/logo.svg"
              alt="logo"
              className="h-18 lg:h-18 w-auto object-contain"
            />
          </div>

          <AnimatePresence mode="wait">
            {openContact && (
              <ContactPage onClose={() => setOpenContact(false)} />
            )}
          </AnimatePresence>

          {/* LINKS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-[35px] text-center md:text-left">
            {/* IMPORTANT LINKS */}
            <div>
              <h4 className="text-sm font-semibold mb-4">Important Links</h4>
              <ul className="space-y-2 flex flex-col items-center md:items-start">
                {navLinks.map((item, i) => (
                  <li key={i}>
                    <button
                      onClick={() => setOpenContact(true)}
                      className="group relative inline-flex h-5 overflow-hidden text-sm font-medium cursor-pointer"
                    >
                      <span className="translate-y-0 transition duration-300 group-hover:-translate-y-[150%]">
                        {item.label}
                      </span>
                      <span
                        style={{ color: "var(--bg-color)" }}
                        className="absolute translate-y-[150%] transition duration-300 group-hover:translate-y-0">
                        {item.label}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* SERVICE SUITE */}
            <div>
              <h4 className="text-sm font-semibold mb-4">Master Disclaimer</h4>
              <ul className="space-y-2 flex flex-col items-center md:items-start">
                <li>
                  <button
                  onClick={() => setOpen(true)}
                    className="group relative inline-flex h-5 overflow-hidden text-sm font-medium cursor-pointer"
                  >
                    <span className="translate-y-0 transition duration-300 group-hover:-translate-y-[150%]">
                      Disclaimer
                    </span>
                    <span
                      style={{ color: "var(--bg-color)" }}
                      className="absolute translate-y-[150%] transition duration-300 group-hover:translate-y-0">
                      Disclaimer
                    </span>
                  </button>
                </li>
              </ul>
            </div>
            <DisclaimerModal isOpen={open} onClose={() => setOpen(false)} />

            {/* OTHER LINKS */}
            <div className="flex flex-col gap-6">
              <div>
                <h4 className="text-sm font-semibold mb-4">Contact Us</h4>

                <ul className="space-y-2 text-sm">
                  <li>(702) 555-0122</li>
                  <li>help@techassistusa.com</li>
                  <li>123 Tech Way, Suite 100</li>
                </ul>
              </div>

              {/* SOCIAL ICON */}
              <div className="flex gap-4 justify-center md:justify-start">
                <a
                  href=""
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 rounded-xl border border-white/10 flex items-center justify-center transition-all hover:scale-105"
                  style={{ backgroundColor: "var(--bg-color)" }}
                >
                  <svg
                    width="56"
                    height="56"
                    viewBox="0 0 56 56"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      width="55.3333"
                      height="55.3333"
                      rx="10"
                      fill="#5695D0"
                      fill-opacity="0.2"
                    />
                    <path
                      d="M36.8 18H32.9L27.9 24.3L22.9 18H18.5L25.8 27.4L18.9 36H22.8L27.9 29.8L33 36H37.4L30 26.7L36.8 18Z"
                      fill="white"
                    />
                  </svg>
                </a>
                <a
                  href=""
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 rounded-xl border border-white/10 flex items-center justify-center transition-all hover:scale-105"
                  style={{ backgroundColor: "var(--bg-color)" }}
                >
                  <svg
                    width="56"
                    height="56"
                    viewBox="0 0 56 56"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      width="55.3333"
                      height="55.3333"
                      rx="10"
                      fill="#5695D0"
                      fill-opacity="0.2"
                    />
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M39 39H34.6V31.3011C34.6 29.1891 33.6683 28.0107 31.9974 28.0107C30.1791 28.0107 29.1 29.2386 29.1 31.3011V39H24.7V24.7H29.1V26.3081C29.1 26.3081 30.4805 23.8857 33.5913 23.8857C36.7032 23.8857 39 25.7847 39 29.7139V39ZM19.6862 22.413C18.2023 22.413 17 21.2009 17 19.706C17 18.2122 18.2023 17 19.6862 17C21.169 17 22.3713 18.2122 22.3713 19.706C22.3724 21.2009 21.169 22.413 19.6862 22.413ZM17 39H22.5V24.7H17V39Z"
                      fill="white"
                    />
                  </svg>
                </a>
                <a
                  href=""
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-11 h-11 rounded-xl border border-white/10 flex items-center justify-center transition-all hover:scale-105"
                  style={{ backgroundColor: "var(--bg-color)" }}
                >
                  <svg
                    width="56"
                    height="56"
                    viewBox="0 0 56 56"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      width="55.3333"
                      height="55.3333"
                      rx="10"
                      fill="#5695D0"
                      fill-opacity="0.2"
                    />
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M27.4998 34.2306C31.2171 34.2306 34.2306 31.2171 34.2306 27.4998C34.2306 23.7825 31.2171 20.769 27.4998 20.769C23.7825 20.769 20.769 23.7825 20.769 27.4998C20.769 31.2171 23.7825 34.2306 27.4998 34.2306ZM27.4998 31.987C29.978 31.987 31.987 29.978 31.987 27.4998C31.987 25.0216 29.978 23.0126 27.4998 23.0126C25.0216 23.0126 23.0126 25.0216 23.0126 27.4998C23.0126 29.978 25.0216 31.987 27.4998 31.987Z"
                      fill="white"
                    />
                    <path
                      d="M34.2306 19.8076C33.6995 19.8076 33.269 20.2381 33.269 20.7692C33.269 21.3002 33.6995 21.7307 34.2306 21.7307C34.7616 21.7307 35.1921 21.3002 35.1921 20.7692C35.1921 20.2381 34.7616 19.8076 34.2306 19.8076Z"
                      fill="white"
                    />
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M15.7431 18.7228C15 20.1813 15 22.0906 15 25.9091V29.0909C15 32.9094 15 34.8188 15.7431 36.2772C16.3968 37.5601 17.4399 38.6032 18.7228 39.2568C20.1813 40 22.0906 40 25.9091 40H29.0909C32.9094 40 34.8188 40 36.2772 39.2568C37.5601 38.6032 38.6032 37.5601 39.2568 36.2772C40 34.8188 40 32.9094 40 29.0909V25.9091C40 22.0906 40 20.1813 39.2568 18.7228C38.6032 17.4399 37.5601 16.3968 36.2772 15.7431C34.8188 15 32.9094 15 29.0909 15H25.9091C22.0906 15 20.1813 15 18.7228 15.7431C17.4399 16.3968 16.3968 17.4399 15.7431 18.7228ZM29.0909 17.2727H25.9091C23.9623 17.2727 22.6389 17.2745 21.616 17.3581C20.6196 17.4395 20.11 17.587 19.7546 17.7681C18.8993 18.2039 18.2039 18.8993 17.7681 19.7546C17.587 20.11 17.4395 20.6196 17.3581 21.616C17.2745 22.6389 17.2727 23.9623 17.2727 25.9091V29.0909C17.2727 31.0377 17.2745 32.361 17.3581 33.384C17.4395 34.3805 17.587 34.89 17.7681 35.2455C18.2039 36.1007 18.8993 36.796 19.7546 37.2318C20.11 37.413 20.6196 37.5606 21.616 37.6419C22.6389 37.7255 23.9623 37.7273 25.9091 37.7273H29.0909C31.0377 37.7273 32.361 37.7255 33.384 37.6419C34.3805 37.5606 34.89 37.413 35.2455 37.2318C36.1007 36.796 36.796 36.1007 37.2318 35.2455C37.413 34.89 37.5606 34.3805 37.6419 33.384C37.7255 32.361 37.7273 31.0377 37.7273 29.0909V25.9091C37.7273 23.9623 37.7255 22.6389 37.6419 21.616C37.5606 20.6196 37.413 20.11 37.2318 19.7546C36.796 18.8993 36.1007 18.2039 35.2455 17.7681C34.89 17.587 34.3805 17.4395 33.384 17.3581C32.361 17.2745 31.0377 17.2727 29.0909 17.2727Z"
                      fill="white"
                    />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full max-w-[1240px] h-px bg-black/20 my-10" />

        <p className="text-center text-xs mb-4 sm:mb-6">
          © 2026 <span className="font-semibold">Expert Printer</span> All
          Rights Reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
