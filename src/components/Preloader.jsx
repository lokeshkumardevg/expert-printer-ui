import { useEffect, useState } from "react";

// Only keyframes & named animation classes — everything else is Tailwind
const keyframes = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400&display=swap');

  @keyframes expandRing {
    0%   { opacity: 0; transform: scale(0.6); }
    40%  { opacity: 1; }
    100% { opacity: 0; transform: scale(1.2); }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(-10px); }
  }
  @keyframes popIn {
    0%   { opacity: 0; transform: scale(0.4) rotate(-10deg); }
    100% { opacity: 1; transform: scale(1) rotate(0deg); }
  }
  @keyframes drawPath {
    to { stroke-dashoffset: 0; }
  }
  @keyframes fillIn {
    from { fill: transparent; }
    to   { fill: #5695D0; }
  }
  @keyframes blink {
    0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
    40%            { opacity: 1;   transform: scale(1.3); }
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes slide {
    0%   { transform: translateX(-120%); }
    100% { transform: translateX(300%); }
  }

  .ring        { animation: expandRing 3s ease-out infinite; }
  .ring-1      { animation-delay: 0s; }
  .ring-2      { animation-delay: 0.6s; }
  .ring-3      { animation-delay: 1.2s; }
  .ring-4      { animation-delay: 1.8s; }

  .icon-wrap   { animation: float 4s ease-in-out infinite, popIn 0.8s cubic-bezier(0.34,1.56,0.64,1) both; }

  .icon-path {
    fill: none;
    stroke: #5695D0;
    stroke-width: 1.5;
    stroke-dasharray: 1000;
    stroke-dashoffset: 1000;
    animation: drawPath 1.8s ease forwards 0.3s, fillIn 0.5s ease forwards 2.1s;
  }

  .dot         { animation: blink 1.4s ease-in-out infinite; }
  .dot-1       { animation-delay: 0s; }
  .dot-2       { animation-delay: 0.2s; }
  .dot-3       { animation-delay: 0.4s; }

  .pl-label    { animation: fadeUp 1s ease forwards 0.5s; opacity: 0; }
  .pl-track    { animation: fadeUp 1s ease forwards 0.7s; opacity: 0; }
  .pl-bar      { animation: slide 2s ease-in-out infinite 1s; }
`;

const RINGS = [
  { size: "w-[100px] h-[100px]", cls: "ring-1" },
  { size: "w-[160px] h-[160px]", cls: "ring-2" },
  { size: "w-[220px] h-[220px]", cls: "ring-3" },
  { size: "w-[280px] h-[280px]", cls: "ring-4" },
];

export default function Preloader({ label = "Loading" }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!document.getElementById("pl-keyframes")) {
      const tag = document.createElement("style");
      tag.id = "pl-keyframes";
      tag.textContent = keyframes;
      document.head.appendChild(tag);
    }
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div
      className="relative flex flex-col items-center justify-center w-full h-screen overflow-hidden bg-[#111724]"
      style={{ fontFamily: "'DM Mono', monospace" }}
    >
      {/* Grain overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-[100] opacity-40"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Pulse rings */}
      <div className="absolute flex items-center justify-center w-[300px] h-[300px]">
        {RINGS.map(({ size, cls }) => (
          <div
            key={cls}
            className={`ring ${cls} absolute rounded-full border border-[rgba(86,149,208,0.15)] ${size}`}
          />
        ))}
      </div>

      {/* Animated icon */}
      <div
        className="icon-wrap relative z-10"
        style={{ filter: "drop-shadow(0 0 18px rgba(86,149,208,0.45)) drop-shadow(0 0 40px rgba(86,149,208,0.2))" }}
      >
        <svg width="72" height="72" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            className="icon-path"
            d="M48.75 19.4976H47.6667V17.3312C47.6667 11.3584 42.8068 6.49919 36.8333 6.49919H28.1667V2.1664C28.1667 0.970545 27.1982 0 26 0C24.8018 0 23.8333 0.970545 23.8333 2.1664V6.49919H15.1667C9.19317 6.49919 4.33333 11.3584 4.33333 17.3312V19.4976H3.25C1.45817 19.4976 0 20.9555 0 22.7472V29.2463C0 31.038 1.45817 32.4959 3.25 32.4959H4.33333V34.6623C4.33333 40.6351 9.19317 45.4943 15.1667 45.4943H31.8435L40.43 51.2179C41.21 51.7379 42.1092 52 43.0105 52C43.7645 52 44.5185 51.818 45.2097 51.4476C46.7242 50.6352 47.6667 49.0645 47.6667 47.3444V32.4938H48.75C50.5418 32.4938 52 31.0358 52 29.2442V22.745C52 20.9534 50.5418 19.4954 48.75 19.4954V19.4976ZM43.3333 47.3466C43.3333 47.3942 43.3333 47.5394 43.1643 47.6282C42.991 47.7214 42.8697 47.6369 42.835 47.6131L33.7025 41.5255C33.3472 41.2893 32.929 41.1615 32.5 41.1615H15.1667C11.583 41.1615 8.66667 38.2456 8.66667 34.6623V17.3312C8.66667 13.7479 11.583 10.832 15.1667 10.832H36.8333C40.417 10.832 43.3333 13.7479 43.3333 17.3312V47.3466ZM15.1667 20.5808C15.1667 18.787 16.6227 17.3312 18.4167 17.3312C20.2107 17.3312 21.6667 18.787 21.6667 20.5808C21.6667 22.3745 20.2107 23.8304 18.4167 23.8304C16.6227 23.8304 15.1667 22.3745 15.1667 20.5808ZM36.8333 20.5808C36.8333 22.3745 35.3773 23.8304 33.5833 23.8304C31.7893 23.8304 30.3333 22.3745 30.3333 20.5808C30.3333 18.787 31.7893 17.3312 33.5833 17.3312C35.3773 17.3312 36.8333 18.787 36.8333 20.5808ZM36.5018 30.752C37.1388 31.7659 36.8312 33.1025 35.8193 33.7373C33.5725 35.1476 30.043 36.8287 26.0022 36.8287C21.9613 36.8287 18.4318 35.1476 16.185 33.7373C15.171 33.1025 14.8655 31.7637 15.5025 30.752C16.1395 29.7403 17.4763 29.4327 18.4882 30.0674C20.254 31.1766 22.9927 32.4959 26.0043 32.4959C29.016 32.4959 31.7525 31.1766 33.5205 30.0674C34.5302 29.4305 35.8713 29.7381 36.5062 30.752H36.5018Z"
          />
        </svg>
      </div>

      {/* Bouncing dots */}
      <div className="relative z-10 flex gap-[10px] mt-9">
        <span className="dot dot-1 block w-[6px] h-[6px] rounded-full bg-[#5695D0]" />
        <span className="dot dot-2 block w-[6px] h-[6px] rounded-full bg-[#5695D0]" />
        <span className="dot dot-3 block w-[6px] h-[6px] rounded-full bg-[#5695D0]" />
      </div>

      {/* Label */}
      <p className="pl-label relative z-10 mt-5 text-[11px] tracking-[0.3em] uppercase text-[rgba(86,149,208,0.5)]">
        {label}
      </p>

      {/* Progress track */}
      <div className="pl-track relative z-10 mt-7 w-40 h-[2px] rounded-full overflow-hidden bg-[rgba(86,149,208,0.1)]">
        <div
          className="pl-bar h-full w-[60%] rounded-full"
          style={{ background: "linear-gradient(90deg, transparent, #5695D0, transparent)" }}
        />
      </div>
    </div>
  );
}