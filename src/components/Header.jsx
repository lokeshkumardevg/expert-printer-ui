import { useState, useEffect, useRef, useCallback } from "react";
import { Link, NavLink } from "react-router-dom";
import ContactPage from "./ContactPage";
import { motion, AnimatePresence } from "framer-motion";

import { useWishlistCount } from "./Printer_brands";
import WishlistDrawer from "./Wishlist";

function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const [openContact, setOpenContact] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const lastScrollY = useRef(0);

  // Live badge count
  const wishlistCount = useWishlistCount();

  // Badge pop animation on count increase
  const [prevCount, setPrevCount] = useState(wishlistCount);
  const [badgeBounce, setBadgeBounce] = useState(false);

  useEffect(() => {
    if (wishlistCount > prevCount) {
      setBadgeBounce(true);
      setTimeout(() => setBadgeBounce(false), 400);
    }
    setPrevCount(wishlistCount);
  }, [wishlistCount]);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Blog", path: "/blog" },
    { name: "Service", path: "/services" },
    { name: "FAQ", path: "/faq" },
  ];

  /* =========================
     Scroll hide/show (desktop only)
  ========================== */
  useEffect(() => {
    if (mobileMenuOpen || openContact || wishlistOpen) {
      setShowHeader(true);
      return;
    }
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const isDesktop = window.innerWidth >= 1024;
      if (!isDesktop || currentScrollY < 50) setShowHeader(true);
      else if (currentScrollY > lastScrollY.current) setShowHeader(false);
      else setShowHeader(true);
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [mobileMenuOpen, openContact, wishlistOpen]);

  /* =========================
     Lock body scroll
  ========================== */
  useEffect(() => {
    document.body.style.overflow =
      mobileMenuOpen || openContact || wishlistOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen, openContact, wishlistOpen]);

  /* =========================
     Close on ESC
  ========================== */
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setOpenContact(false);
        setMobileMenuOpen(false);
        setWishlistOpen(false);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (!element) return;
    const offset = 82;
    const targetPosition =
      element.getBoundingClientRect().top + window.scrollY - offset;
    const startPosition = window.scrollY;
    const distance = targetPosition - startPosition;
    const duration = 800;
    let startTime = null;
    const easeInOutQuad = (t) =>
      t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    const animation = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);
      window.scrollTo(0, startPosition + distance * easeInOutQuad(progress));
      if (timeElapsed < duration) requestAnimationFrame(animation);
    };
    requestAnimationFrame(animation);
    setMobileMenuOpen(false);
  };

  const closeWishlist = useCallback(() => setWishlistOpen(false), []);

  return (
    <>
      {/* ================= HEADER ================= */}
      <header
        className={`fixed left-0 w-full z-50 bg-white shadow-sm transition-transform duration-300 ${
          showHeader || mobileMenuOpen || openContact || wishlistOpen
            ? "translate-y-0"
            : "-translate-y-full"
        }`}
      >
        <div className="h-[82px] lg:h-[100px] flex items-center justify-between px-4 sm:px-6 lg:px-16 xl:px-24">

          {/* ── Logo ── */}
          <Link to="/" className="flex items-center flex-shrink-0">
            <img
              src="/logo.svg"
              alt="logo"
              className="h-12 lg:h-14 w-auto object-contain"
            />
          </Link>

          {/* ── Desktop Nav ── */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
            {navLinks.map((link, index) => (
              <div key={link.name} className="flex items-center gap-6 xl:gap-8">
                {link.name === "Home" || link.name === "Service" ? (
                  <NavLink
                    to={link.path}
                    className={({ isActive }) =>
                      `group relative h-6 overflow-hidden text-[15px] xl:text-[16px] font-medium transition-all duration-300 ${
                        isActive ? "text-[#007DBA]" : "text-black/80"
                      }`
                    }
                  >
                    <span className="block translate-y-0 transition duration-300 group-hover:-translate-y-[150%]">
                      {link.name}
                    </span>
                    <span className="absolute left-0 top-0 block translate-y-[150%] text-[#007DBA] transition duration-300 group-hover:translate-y-0">
                      {link.name}
                    </span>
                  </NavLink>
                ) : (
                  <button
                    onClick={() => scrollToSection(link.name.toLowerCase())}
                    className="group relative h-6 overflow-hidden text-[15px] xl:text-[16px] font-medium transition-all duration-300 text-black/80 cursor-pointer"
                  >
                    <span className="block translate-y-0 transition duration-300 group-hover:-translate-y-[150%]">
                      {link.name}
                    </span>
                    <span className="absolute left-0 top-0 block translate-y-[150%] text-[#007DBA] transition duration-300 group-hover:translate-y-0">
                      {link.name}
                    </span>
                  </button>
                )}
                {index < navLinks.length - 1 && (
                  <span className="text-black/20 select-none">|</span>
                )}
              </div>
            ))}
          </nav>

          {/* ── Right Side ── */}
          <div className="flex items-center gap-3">

            {/* Wishlist Icon — desktop */}
            <button
              onClick={() => setWishlistOpen(true)}
              aria-label="Open wishlist"
              className="relative hidden lg:flex items-center justify-center w-11 h-11 xl:w-12 xl:h-12 rounded-full bg-[#007DBA]/10 hover:bg-[#007DBA]/20 transition-colors duration-200 cursor-pointer flex-shrink-0"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="#007DBA"
                className="w-5 h-5 xl:w-6 xl:h-6"
              >
                <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
              </svg>

              {/* Live badge */}
              {wishlistCount > 0 && (
                <span
                  key={wishlistCount}
                  style={{
                    animation: badgeBounce
                      ? "badge-pop 0.4s cubic-bezier(0.34,1.56,0.64,1)"
                      : "none",
                  }}
                  className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center rounded-full bg-white border-2 border-[#007DBA]/20 text-[10px] font-bold text-[#007DBA]"
                >
                  {wishlistCount > 99 ? "99+" : wishlistCount}
                </span>
              )}
            </button>

            {/* Contact Us — unchanged */}
            <button
              style={{ backgroundColor: "var(--bg-color)" }}
              onClick={() => setOpenContact(true)}
              className="group relative hidden lg:flex h-11 xl:h-12 w-[120px] xl:w-[130px] flex-shrink-0 items-center justify-center overflow-hidden isolate rounded-full bg-[#007DBA] text-sm font-medium text-white cursor-pointer transition-all duration-300"

            >
              <span className="absolute inset-0 overflow-hidden rounded-full">
                <span className="absolute left-0 h-full w-full translate-x-full rounded-full bg-white transition-all duration-500 group-hover:translate-x-0 group-hover:scale-150" />
              </span>
              <span className="relative z-10 transition-colors duration-300 group-hover:text-[#007DBA]">
                Contact Us
              </span>
            </button>

            {/* Mobile Hamburger — unchanged */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              className="lg:hidden w-10 h-10 flex items-center justify-center cursor-pointer rounded-md transition-colors duration-200 hover:bg-black/5"
            >
              {mobileMenuOpen ? (
                <svg
                  width="20" height="20" viewBox="0 0 24 24"
                  stroke="#0a0f1a" fill="none" strokeWidth="2.5" strokeLinecap="round"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              ) : (
                <svg
                  width="27" height="20" stroke="#0a0f1a"
                  viewBox="0 0 27 20" fill="none" xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M11.5357 18.3929H25.25M1.25 9.82143H25.25M11.5357 1.25H25.25"
                    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ================= WISHLIST DRAWER ================= */}
      <WishlistDrawer open={wishlistOpen} onClose={closeWishlist} />

      {/* ================= CONTACT MODAL ================= */}
      <AnimatePresence>
        {openContact && (
          <div className="fixed inset-0 z-[100]">
            <ContactPage onClose={() => setOpenContact(false)} />
          </div>
        )}
      </AnimatePresence>

      {/* ================= MOBILE MENU ================= */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="lg:hidden fixed top-[82px] left-0 right-0 bottom-0 z-40 bg-[#0a0f1a]/60 backdrop-blur-2xl flex flex-col"
          >
            <nav className="flex flex-col pt-16 items-center flex-1 gap-2">
              {navLinks.map((link) => (
                <div key={link.name} className="flex items-center gap-6 xl:gap-8">
                  {link.name === "Home" || link.name === "Service" ? (
                    <NavLink
                      to={link.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) =>
                        `block w-full py-4 text-xl font-medium transition-colors duration-200 ${
                          isActive ? "text-[#007DBA]" : "text-white hover:text-[#007DBA]"
                        }`
                      }
                    >
                      {link.name}
                    </NavLink>
                  ) : (
                    <NavLink
                      onClick={() => scrollToSection(link.name.toLowerCase())}
                      className="block w-full py-4 text-xl text-center font-medium transition-colors duration-200 text-white hover:text-[#007DBA]"
                    >
                      {link.name}
                    </NavLink>
                  )}
                </div>
              ))}

              {/* Mobile Wishlist entry */}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setTimeout(() => setWishlistOpen(true), 350);
                }}
                className="flex items-center gap-2 py-4 text-xl font-medium text-white hover:text-[#007DBA] transition-colors duration-200 cursor-pointer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5"
                >
                  <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                </svg>
                Wishlist
                {wishlistCount > 0 && (
                  <span className="text-sm font-bold text-[#007DBA]">
                    ({wishlistCount})
                  </span>
                )}
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Badge pop keyframe */}
      <style>{`
        @keyframes badge-pop {
          0%   { transform: scale(0.3); }
          60%  { transform: scale(1.35); }
          100% { transform: scale(1); }
        }
      `}</style>
    </>
  );
}

export default Header;