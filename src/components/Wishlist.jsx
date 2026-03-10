import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getWishlist,
  removeFromWishlist,
  saveWishlist,
} from "./Printer_brands";

const PLACEHOLDER_IMG =
  "https://images-cdn.ubuy.co.in/67cdb26d5af3ca779640523e-hp-officejet-3830-all-in-one-printer.jpg";

function WishlistDrawer({ open, onClose }) {
  const [items, setItems] = useState(getWishlist());
  const [removingIds, setRemovingIds] = useState([]);

  // Sync with localStorage
  useEffect(() => {
    const sync = () => setItems([...getWishlist()]);
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  // Lock body scroll
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Close on ESC
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const handleRemove = (id) => {
    setRemovingIds((prev) => [...prev, id]);
    setTimeout(() => {
      removeFromWishlist(id);
      setItems([...getWishlist()]);
      setRemovingIds((prev) => prev.filter((r) => r !== id));
    }, 300);
  };

  const handleClearAll = () => {
    if (!window.confirm("Remove all items from your wishlist?")) return;
    saveWishlist([]);
    setItems([]);
  };

  const total = items.reduce(
    (sum, i) => sum + i.price * (i.quantity || 1),
    0
  );

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[90] bg-[#0a0f1a]/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.38 }}
            className="fixed top-0 right-0 bottom-0 z-[95] w-full max-w-[420px] bg-white shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div>
                <h2 className="text-[17px] font-bold text-[#0a0f1a]">
                  My Wishlist
                </h2>
                <p className="text-[12px] text-gray-400 mt-0.5">
                  {items.length === 0
                    ? "No items saved"
                    : `${items.length} item${
                        items.length !== 1 ? "s" : ""
                      } saved`}
                </p>
              </div>

              <button
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/5"
              >
                ✕
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
              {items.length === 0 ? (
                <div className="text-center mt-10 text-gray-400">
                  Your wishlist is empty
                </div>
              ) : (
                items.map((item, i) => {
                  const isRemoving = removingIds.includes(item.id);

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{
                        opacity: isRemoving ? 0 : 1,
                        x: isRemoving ? 40 : 0,
                      }}
                      transition={{
                        duration: 0.28,
                        delay: i * 0.04,
                      }}
                      className="flex gap-4 p-4 rounded-2xl border border-gray-100 bg-white"
                    >
                      {/* Image */}
                      <div className="w-[90px] h-[75px] rounded-xl bg-[#f7f7f7] flex items-center justify-center p-2">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.target.src = PLACEHOLDER_IMG;
                          }}
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1">
                        <p className="text-[14px] font-semibold text-[#0a0f1a] leading-snug mb-2">
                          {item.name}
                        </p>

                        {/* Optional description if exists */}
                        {item.description && (
                          <p className="text-[12px] text-gray-500 mb-2">
                            {item.description}
                          </p>
                        )}

                        {/* Quantity Display Only */}
                        <p className="text-[13px] text-gray-500 mb-1">
                          Qty:{" "}
                          <span className="font-semibold text-[#0a0f1a]">
                            {item.quantity || 1}
                          </span>
                        </p>

                        {/* Price */}
                        <div className="mb-3">
                          <span className="text-[#5695D0] font-bold text-[15px]">
                            ${item.price.toFixed(2)}
                          </span>
                          {item.original_price > item.price && (
                            <span className="text-gray-300 text-[12px] line-through ml-2">
                              ${item.original_price.toFixed(2)}
                            </span>
                          )}
                        </div>

                        {/* Buttons */}
                        <div className="flex items-center gap-3">
                          <button className="px-4 h-9 rounded-lg bg-[#5695D0] hover:bg-[#4580bb] text-white text-sm font-medium transition-colors duration-200">
                            Buy Now
                          </button>

                          <button
                            onClick={() => handleRemove(item.id)}
                            className="px-4 h-9 rounded-lg border border-gray-300 text-sm text-gray-600 hover:border-red-300 hover:text-red-400 transition-colors duration-200"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Footer Total */}
            {items.length > 0 && (
              <div className="border-t border-gray-100 p-5">

                <button
                  onClick={handleClearAll}
                  className="w-full text-sm text-red-400 hover:underline"
                >
                  Clear Wishlist
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default WishlistDrawer;