const mongoose = require('mongoose');
const Blog = require('./src/models/Blog');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const blogs = [
  {
    title: "Troubleshooting Printer Connection Drops on Wireless Networks",
    slug: "troubleshooting-printer-connection-drops",
    content: "Printer connection drops on Wi-Fi is a very common problem. Almost everyone who has a wireless printer faces this issue. When the printer is connected to the wireless router for a long time, these issues become repetitive. If you are facing such a printer network problem while connecting to wireless networks, your devices might need a reset. In this blog, we will guide you through the process of resetting all your devices that help the printer stay online.\n\n### Step 1: Turn Off Printer\nTo fix printer connection problems, first turn the printer off. Simply press the power button once.\n\n### Step 2: Remove Power Cable\nAfter turning off the printer, pull out the power cable from the back of the printer.\n\n### Step 3: Reset Router\nReset the router by removing the power plug.\n\n### Step 4: Wait and Reconnect\nWait 5–10 minutes and reconnect the router.\n\n### Step 5: Reconnect Printer\nReconnect printer power cable.\n\n### Step 6: Power On\nTurn printer on and reconnect to Wi-Fi.",
    category: "Technical Support",
    image: "/trouble.png"
  },
  {
    title: "How to Fix Printer “Memory Full” Error on Windows 10",
    slug: "fix-printer-memory-full-error",
    content: "If your printer is showing a “Memory Full” error on Windows 10, it usually means the printer’s internal memory is overloaded or there’s a large print job stuck in the queue.\n\nFollow these steps:\n1. Restart your printer.\n2. Clear the print spooler.\n3. Reduce print quality settings.",
    category: "Troubleshooting",
    image: "/memory.png"
  },
  {
    title: "Printer Not Printing Black Ink After Cartridge Replacement?",
    slug: "printer-not-printing-black-ink",
    content: "If your printer is not printing black ink after a new cartridge, it might be due to air bubbles in the ink tube or a clogged printhead.\n\nTry running a printhead cleaning cycle from your printer settings.",
    category: "Technical Support",
    image: "/ink.png"
  }
];

const seed = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017';
    const dbName = process.env.DB_NAME || 'techforcall';
    await mongoose.connect(mongoURI, { dbName });
    console.log(`Connected to database: ${dbName} for seeding...`);

    // Clean old ones to ensure fresh data
    await Blog.deleteMany({});
    console.log(`Cleared existing blogs.`);

    for (const b of blogs) {
        await new Blog(b).save();
        console.log(`Added: ${b.title}`);
    }

    console.log(`✅ Blogs seeded successfully!`);
    process.exit(0);
  } catch (err) {
    console.error('Seed Error:', err);
    process.exit(1);
  }
};

seed();
