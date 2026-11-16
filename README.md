# Daily Discoveries Pakistan 🇵🇰

A clean, minimalist, responsive, and user-friendly website dedicated to broadcasting daily discoveries (archaeological, biodiversity, scientific, geological, and cultural) from every corner of Pakistan.

---

## 📁 File & Folder Structure

```text
Daily dicovories/
├── index.html               # Main semantic HTML5 landing & feed page
├── assets/
│   ├── css/
│   │   └── style.css        # Clean, modern styling, design tokens & dark/light theme
│   └── js/
│       └── app.js           # Dynamic feed logic, live PKT clock, region filtering & API
└── README.md                # Project documentation and API instructions
```

---

## ✨ Features

- **Minimalist & Clean Aesthetic**: Designed with subtle typography (`Plus Jakarta Sans` & `Playfair Display`), elegant spacing, and Pakistan-green brand accents.
- **Responsive Across Devices**: Fully responsive layout for mobile, tablet, and desktop viewports.
- **Blank State Ready**: The discoveries feed is intentionally blank and clean with an elegant standby indicator.
- **Regional Filtering**: Quick-filter chips for Punjab, Sindh, Khyber Pakhtunkhwa, Balochistan, Gilgit-Baltistan, Azad Kashmir, and Islamabad.
- **Dark Mode Support**: One-click theme switcher that remembers user preference via `localStorage`.
- **Live Pakistan Time (PKT)**: Built-in real-time clock displaying Asia/Karachi time.
- **Alert / Subscription Modal**: Interactive dialog for visitors to subscribe to notifications.

---

## 🚀 How to Add New Discoveries

Whenever a new discovery is announced in Pakistan, you can post it directly into the feed in JavaScript using the built-in `DailyDiscoveries.post()` function:

```javascript
DailyDiscoveries.post({
  title: "Ancient 4,000-Year-Old Settlement Unearthed in Cholistan",
  category: "Archaeology",
  region: "punjab", // punjab | sindh | kpk | balochistan | gb | ajk | isb
  location: "Cholistan Desert, Punjab",
  summary: "Archaeologists discover pottery and town ruins dating back to the Mature Harappan period.",
  source: "Department of Archaeology"
});
```

The new card will immediately show up at the top of the feed with real-time counters updated.

---

## 🌐 Opening the Website

Simply double-click `index.html` to open it in any web browser (Chrome, Edge, Firefox, Safari). No build tools or installations required.
