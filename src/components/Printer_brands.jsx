import { useState, useEffect } from "react";

// ─── Temp placeholder image (replace with real scraped image URLs) ────────────
const PLACEHOLDER_IMG = "https://images-cdn.ubuy.co.in/67cdb26d5af3ca779640523e-hp-officejet-3830-all-in-one-printer.jpg";

// ─── Sample data — structure matches your Python scraper output ───────────────
const scrapedPrinters = [
  {
    id: "hp-officejet-pro-8139e-1",
    name: "HP OfficeJet Pro 8139e Wireless All-in-One Printer with 1 Full Year Instant Ink with HP+, AI-enabled",
    price: 349.0,
    original_price: 499.0,
    image: PLACEHOLDER_IMG,
    in_stock: true,
  },
  {
    id: "hp-officejet-pro-8139e-2",
    name: "HP OfficeJet Pro 8139e Wireless All-in-One Printer with 1 Full Year Instant Ink with HP+, AI-enabled",
    price: 349.0,
    original_price: 499.0,
    image: PLACEHOLDER_IMG,
    in_stock: true,
  },
  {
    id: "hp-officejet-pro-8139e-3",
    name: "HP OfficeJet Pro 8139e Wireless All-in-One Printer with 1 Full Year Instant Ink with HP+, AI-enabled",
    price: 349.0,
    original_price: 499.0,
    image: PLACEHOLDER_IMG,
    in_stock: true,
  },
  {
    id: "hp-officejet-pro-8139e-4",
    name: "HP OfficeJet Pro 8139e Wireless All-in-One Printer with 1 Full Year Instant Ink with HP+, AI-enabled",
    price: 349.0,
    original_price: 499.0,
    image: PLACEHOLDER_IMG,
    in_stock: true,
  },
  {
    id: "hp-officejet-pro-8139e-5",
    name: "HP OfficeJet Pro 8139e Wireless All-in-One Printer with 1 Full Year Instant Ink with HP+, AI-enabled",
    price: 349.0,
    original_price: 499.0,
    image: PLACEHOLDER_IMG,
    in_stock: true,
  },
  {
    id: "hp-officejet-pro-8139e-6",
    name: "HP OfficeJet Pro 8139e Wireless All-in-One Printer with 1 Full Year Instant Ink with HP+, AI-enabled",
    price: 349.0,
    original_price: 499.0,
    image: PLACEHOLDER_IMG,
    in_stock: true,
  },
];

// =============================================================================
// WISHLIST HELPERS
// Exported so Header.jsx and WishlistPage.jsx can import them too
// =============================================================================

/** Read wishlist array from localStorage */
export const getWishlist = () =>
  JSON.parse(localStorage.getItem("wishlist") || "[]");

/** Save wishlist + fire "storage" event so Header badge updates instantly */
export const saveWishlist = (items) => {
  localStorage.setItem("wishlist", JSON.stringify(items));
  window.dispatchEvent(new Event("storage"));
};

/** Check if product already in wishlist */
export const isInWishlist = (id) =>
  getWishlist().some((item) => item.id === id);

/** Add product with quantity=1 (skips if already present) */
export const addToWishlist = (product) => {
  const current = getWishlist();
  if (!current.find((item) => item.id === product.id)) {
    saveWishlist([...current, { ...product, quantity: 1 }]);
  }
};

/** Remove product by id */
export const removeFromWishlist = (id) =>
  saveWishlist(getWishlist().filter((item) => item.id !== id));

/** Update quantity; removes item if qty reaches 0 */
export const updateWishlistQty = (id, qty) => {
  if (qty <= 0) { removeFromWishlist(id); return; }
  saveWishlist(
    getWishlist().map((item) =>
      item.id === id ? { ...item, quantity: qty } : item
    )
  );
};

/** Total quantity across ALL wishlist items (used for header badge) */
export const getWishlistTotalQty = () =>
  getWishlist().reduce((sum, item) => sum + (item.quantity || 1), 0);

// =============================================================================
// CUSTOM HOOK — useWishlistCount
// =============================================================================
export function useWishlistCount() {
  const [count, setCount] = useState(getWishlistTotalQty);

  useEffect(() => {
    const sync = () => setCount(getWishlistTotalQty());
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  return count;
}

// =============================================================================
// PRINTER CARD
// =============================================================================
function PrinterCard({ product }) {
  const [inWishlist, setInWishlist] = useState(false);
  const [quantity, setQuantity] = useState(1);

  // Sync card state with localStorage on mount + on any storage change
  useEffect(() => {
    const sync = () => {
      const inList = isInWishlist(product.id);
      setInWishlist(inList);
      if (inList) {
        const item = getWishlist().find((i) => i.id === product.id);
        if (item) setQuantity(item.quantity);
      } else {
        setQuantity(1);
      }
    };
    sync();
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, [product.id]);

  const handleAdd = () => {
    addToWishlist(product);
    setInWishlist(true);
    setQuantity(1);
  };

  const handleIncrease = () => {
    const newQty = quantity + 1;
    setQuantity(newQty);
    updateWishlistQty(product.id, newQty);
  };

  const handleDecrease = () => {
    const newQty = quantity - 1;
    if (newQty <= 0) {
      removeFromWishlist(product.id);
      setInWishlist(false);
      setQuantity(1);
    } else {
      setQuantity(newQty);
      updateWishlistQty(product.id, newQty);
    }
  };

  return (
    <div
      className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden"
      style={{ transition: 'transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease' }
      }
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-6px)';
        e.currentTarget.style.boxShadow = '0 20px 40px rgba(53, 62, 71, 0.2)';
        e.currentTarget.querySelector('img').style.transform = 'scale(1.06)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '';
        e.currentTarget.style.borderColor = '';
        e.currentTarget.querySelector('img').style.transform = 'scale(1)';
      }}
    >

      {/* Image */}
      < div className="bg-[#f7f7f7] flex items-center justify-center px-6 py-5 h-70 overflow-hidden" >
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover"
          style={{ transition: 'transform 0.35s ease' }}
          onError={(e) => { e.target.src = PLACEHOLDER_IMG; }}
        />
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 px-4 pt-4 pb-5 gap-3" >

        {/* Name */}
        < p className="text-[13.5px] font-semibold text-gray-800 leading-snug line-clamp-4" >
          {product.name}
        </p>

        {/* Price */}
        <div className="flex items-center gap-2 mt-auto" >
          <span className="text-[#5695D0] font-bold text-[15px]" >
            ${product.price.toFixed(2)}
          </span>
          {
            product.original_price > product.price && (
              <span className="text-gray-400 text-[13px] line-through" >
                ${product.original_price.toFixed(2)}
              </span>
            )
          }
        </div>

        {/* Wishlist Button  OR  Quantity Selector */}
        {
          !inWishlist ? (
            <button
            style={{ backgroundColor: "var(--bg-color)" }}
              onClick={handleAdd}
              className="w-full h-12 rounded-lg hover:opacity-90 text-white text-sm font-medium transition-colors duration-200 cursor-pointer "
            >
              Add to Wishlist
            </button>
          ) : (
            <div className="flex items-center gap-2 w-full" >
              <button
              style={{ backgroundColor: "var(--bg-color)" }}
                onClick={handleDecrease}
                className="flex-[0.8] h-11 rounded-lg hover:opacity-90 text-white text-xl font-bold flex items-center justify-center transition-colors duration-200 cursor-pointer"
              >
                −
              </button>
              < div className="flex-1 h-11 flex items-center justify-center text-sm font-semibold text-gray-800 border border-gray-200 rounded-lg bg-white select-none" >
                {String(quantity).padStart(2, "0")}
              </div>
              < button
              style={{ backgroundColor: "var(--bg-color)" }}
                onClick={handleIncrease}
                className="flex-[0.8] h-11 hover:opacity-90 rounded-lg text-white text-xl font-bold flex items-center justify-center transition-colors duration-200 cursor-pointer"
              >
                +
              </button>
            </div>
          )
        }
      </div>
    </div>
  );
}

// =============================================================================
// MAIN EXPORT
// Usage:  <PrinterListing printers={yourScrapedData} />
// If no prop is passed, the sample scrapedPrinters array is used as default.
// =============================================================================
export default function PrinterListing({ printers = scrapedPrinters }) {
  const text = "Pick Your Printer";
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
    <section className="py-14 px-4" >
      <div className="max-w-7xl mx-auto" >
        <div className="text-center mb-10" >
          <h2 className="text-3xl md:text-4xl font-bold text-black" >
            {displayText}
            < span className="animate-pulse" >| </span>
          </h2>
          < p className="mt-4 text-gray-600 max-w-2xl mx-auto" >
            Discover the Right Printing Partner from Leading Brands
          </p>
        </div>
        < div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" >
          {
            printers.map((printer) => (
              <PrinterCard key={printer.id} product={printer} />
            ))
          }
        </div>
      </div>
    </section>
  );
}