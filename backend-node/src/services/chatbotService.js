const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const greetings = {
  "hello":          "Hello! I'm your smart printer assistant. Tell me your issue and I'll guide you.",
  "hi":             "Hi there! Need help with your printer? Our experts provide live guidance.",
  "hey":            "Hey! I'm here to help you with your printer. What's up?",
  "good morning":   "Good morning! Ready to make your printer work perfectly today?",
  "good afternoon": "Good afternoon! How can I assist you with your printer?",
  "good evening":   "Good evening! Need printer help tonight?",
  "yo":             "Yo! Need a hand with your printer?",
  "bye":            "Goodbye! Keep your printer healthy.",
  "goodbye":        "Goodbye! Don't forget to check your printer regularly.",
  "see you":        "See you! Happy printing!",
  "take care":      "Take care! Keep your printer happy.",
  "thank you":      "You're welcome! Always here to help.",
  "thanks":         "No problem! Glad I could help.",
  "thx":            "Anytime! Let me know if you need more help.",
};

const brand_links = {
  "hp":             "https://support.hp.com/printer",
  "brother":        "https://support.brother.com",
  "canon":          "https://www.canon.com/support",
  "epson":          "https://www.epson.com/support",
  "xerox":          "https://www.support.xerox.com",
  "ricoh":          "https://support.ricoh.com",
  "kyocera":        "https://www.kyoceradocumentsolutions.com/support",
  "samsung":        "https://support.hp.com/samsung",
  "panasonic":      "https://www.panasonic.com/support",
  "fujitsu":        "https://www.fujitsu.com/global/support",
  "konica minolta": "https://www.konicaminolta.com/support",
  "tally":          "https://www.tallygenicom.com/support",
};

const issues = {
  "faded or light prints":              "Check ink/toner levels, run printhead cleaning, and adjust print density.",
  "streaks or lines on paper":          "Clean the printhead, align your printer, and ensure rollers are clean.",
  "smudged ink or toner":               "Use recommended paper, let prints dry, and check the fuser on laser printers.",
  "blurry text or images":              "Check print quality settings, verify DPI, and clean the printhead.",
  "wrong colors":                       "Check ink levels, run printer calibration, and update your driver.",
  "blank pages printing":               "Remove cartridge protective strip, check ink levels, and clean the printhead.",
  "double printing (ghosting)":         "Check the fuser, reduce humidity, or replace the drum unit.",
  "uneven or patchy printing":          "Clean nozzles, replace low cartridges, and use recommended paper.",
  "spots or toner specks":              "Clean inside the printer; consider replacing drum or toner.",
  "paper jam":                          "Turn off printer, gently remove stuck paper, then restart.",
  "frequent paper jams":                "Use correct paper type/size, clean rollers, don't overload the tray.",
  "printer not picking paper":          "Adjust paper guides and clean the pickup rollers.",
  "multiple sheets feeding":            "Fan paper before loading and reduce stack height.",
  "paper stuck in tray":                "Remove the tray, check for stuck pages, and reload properly.",
  "wrinkled or curled paper":           "Store paper in a dry place and use the recommended type.",
  "wrong paper size error":             "Ensure paper settings in printer match what's loaded.",
  "printer offline windows 11":         "Go to Settings > Bluetooth & devices > Printers, remove and re-add the printer.",
  "printer offline windows 10":         "Open Devices and Printers, right-click printer, uncheck 'Use Printer Offline'.",
  "why is my printer offline":          "Restart printer and router, then check if it's set as the default printer.",
  "printer not printing after wifi change": "Re-add printer using its new IP, or run the wireless setup wizard.",
  "reconnect printer to new router":    "Use the printer control panel wireless setup wizard to enter new Wi-Fi credentials.",
  "printer not found on network":       "Ensure same Wi-Fi, check firewall, add printer manually via IP.",
  "printer offline":                    "Set as default printer, restart print spooler, and check connections.",
  "not connecting to wifi":             "Restart printer and router, check Wi-Fi password, move printer closer to router.",
  "set up new printer on laptop":       "Go to Settings > Devices > Add a printer or scanner.",
  "install printer drivers windows":    "Download latest driver from manufacturer's site, run installer, restart.",
  "wireless printer setup assistance":  "Press Wi-Fi button, connect via setup wizard, then add from computer settings.",
  "connect printer to laptop wifi":     "Use printer's Network Settings > Wireless Setup Wizard, then add from laptop.",
  "printer software installation help": "Visit your printer brand's support website, download the full software package, and follow the installer.",
  "printer driver is unavailable":      "Uninstall current driver from Device Manager and reinstall from manufacturer.",
  "fix printer spooler error":          "Open services.msc, restart 'Print Spooler', clear the spool PRINTERS folder.",
  "printer not printing from windows":  "Check print queue, restart Print Spooler, set printer as default.",
  "printer communication error help":   "Check connection, reinstall driver, ensure no firewall is blocking printer.",
  "driver not installed":               "Download latest driver from manufacturer's website and install.",
  "outdated or corrupt driver":         "Uninstall and reinstall the newest driver version.",
  "print spooler error":                "Restart the Print Spooler service from Windows Services.",
  "not responding to print command":    "Clear print queue and restart printer and computer.",
  "error messages on computer":         "Note the error code, update driver, and restart system.",
  "firmware update failure":            "Ensure stable internet, retry update, or reset the printer.",
  "printer not turning on":             "Check power cable, try a different outlet, ensure printer is switched on.",
  "strange noises":                     "Check inside for paper pieces and inspect the rollers.",
  "overheating":                        "Turn off printer for a while and ensure proper ventilation.",
  "cartridge not recognized":           "Remove and reinstall cartridge; clean the cartridge contacts.",
  "low ink warning after refill":       "Reset ink levels or replace the chip if your cartridge has one.",
  "broken rollers":                     "Rollers need replacing to feed paper properly.",
  "faulty printhead":                   "Try cleaning; replace if damaged.",
  "slow printing speed":                "Lower print quality for speed and ensure driver is updated.",
  "printer freezing":                   "Restart printer and check for firmware updates.",
  "queue stuck":                        "Cancel all jobs and restart the print spooler.",
  "memory full error":                  "Print smaller files or add memory if your printer supports it.",
  "printer resets randomly":            "Check power supply and update firmware.",
  "alignment issues":                   "Run the printer alignment tool.",
  "scanner not working":                "Update scanner driver, check connections, restart the scanning service.",
  "low ink":                            "Ink is running low. Check the cartridge and replace if needed.",
  "not connecting":                     "Restart printer and computer, check Wi-Fi or cable connections.",
  "usb not detected":                   "Try a different USB port, swap the cable, or reinstall printer driver.",
  "network printer not found":          "Ensure same network and add printer manually via IP if needed.",
  "slow network printing":              "Check network speed, reduce file size, and update firmware.",
  "bluetooth not working":              "Re-pair device and ensure Bluetooth is enabled on both ends.",
};

const negativeKeywords = [
  "free", "refund", "warranty", "hp official", "epson official",
  "canon official", "ink cartridge", "repair shop near me", "returns",
];

const explicitBlockedWords = [
  "sex", "porn", "nude", "naked", "adult", "xxx", "sexual", "nsfw",
  "erotic", "obscene", "vulgar", "rape", "molest", "prostitut",
  "escort", "fetish", "masturbat", "orgasm", "genitals", "penis", "vagina",
];

const printerKeywords = [
  "printer", "print", "printing", "printout", "printed",
  "scanner", "scan", "scanning", "copier", "copy", "fax",
  "cartridge", "toner", "ink", "inkjet", "laser",
  "printhead", "print head", "nozzle", "drum",
  "paper", "tray", "feeder", "roller", "spooler", "spool",
  "driver", "firmware", "setup", "install", "installation",
  "wifi", "wireless", "network", "offline", "online",
  "usb", "bluetooth", "cable", "connection", "connect",
  "hp", "canon", "epson", "brother", "xerox", "ricoh",
  "kyocera", "samsung", "panasonic", "fujitsu", "konica", "minolta", "tally",
  "queue", "job", "document", "page", "dpi", "resolution",
  "smudge", "streak", "faded", "blurry", "blank",
  "jam", "stuck", "feed", "misfeed",
  "port", "ip address", "router",
  "error", "not working", "not printing", "not connecting",
  "slow", "freeze", "restart", "reboot", "reset",
  "color", "colour", "black", "white", "grayscale",
  "alignment", "calibrate", "calibration", "test page",
  "overheating", "noise", "beep", "indicator",
];

const containsExplicit = (text) => {
  const lowerText = text.toLowerCase();
  return explicitBlockedWords.some(word => lowerText.includes(word));
};

const isNegativeKeyword = (text) => {
  const lowerText = text.toLowerCase();
  return negativeKeywords.some(kw => lowerText.includes(kw));
};

const isPrinterRelated = (text) => {
  const lowerText = text.toLowerCase();
  return printerKeywords.some(kw => lowerText.includes(kw));
};

const saveLeadToFile = (contact) => {
  const lead = {
    ...contact,
    timestamp: new Date().toISOString(),
  };
  const filePath = path.join(__dirname, '../../leads.json');
  try {
    let data = [];
    if (fs.existsSync(filePath)) {
      data = JSON.parse(fs.readFileSync(filePath));
    }
    data.push(lead);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 4));
  } catch (err) {
    console.error('Lead Save Error:', err);
  }
};

const aiResponse = async (userInput) => {
  const systemMessage = (
    "You are a certified printer support specialist. " +
    "Respond ONLY to printer-related questions. " +
    "Reply in 10 to 20 words maximum. " +
    "Be professional, confident, and solution-focused. " +
    "NEVER respond to sexual, explicit, offensive, or unrelated topics. " +
    "If unrelated, say: 'Sorry, I only handle printer-related issues.'"
  );
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: userInput },
      ],
      temperature: 0.3,
      max_tokens: 60,
    });
    const reply = response.choices[0].message.content.trim();
    const wordCount = reply.split(/\s+/).length;
    if (wordCount >= 10 && wordCount <= 20) {
      return reply;
    }
    return "Restart printer and check connections. If issue continues, contact support.";
  } catch (err) {
    console.error("AI Error:", err);
    return "AI service unavailable. Please try again later.";
  }
};

module.exports = {
  greetings,
  brand_links,
  issues,
  containsExplicit,
  isNegativeKeyword,
  isPrinterRelated,
  saveLeadToFile,
  aiResponse,
};
