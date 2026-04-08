# 🗓️ Wall Calendar — Interactive Component

A polished, interactive wall calendar built with **Next.js 14**, **TypeScript**, and **Tailwind CSS**, inspired by a physical wall calendar aesthetic.

---

## ✨ Features

### Core Requirements
- **Wall Calendar Aesthetic** — Hero photo for each month with diagonal accent overlay, spiral binding decoration, clean grid layout
- **Day Range Selector** — Click a start date, then an end date; clear visual states for start, end, and in-between days (with live hover preview)
- **Integrated Notes Section** — Add notes per selected date or range; notes persist via `localStorage`; notes visible per month
- **Fully Responsive** — Side-by-side desktop layout collapses to stacked mobile layout

### Bonus Features
- 🌍 **12 Unique Monthly Themes** — Each month has a different hero photo (world landmarks) and a matching color palette that propagates through the UI
- 🌙 **Dark / Light Mode Toggle** — Persisted to localStorage
- 📅 **Holiday Markers** — Major holidays shown with a dot indicator; hover to see name
- 🔄 **Page-flip Animation** — Smooth CSS animation when navigating months
- 📍 **Location Tags** — Hero image annotated with photo location
- 💾 **LocalStorage Persistence** — Notes and theme preference survive page refreshes
- 🎯 **Has-Note Dots** — Days with attached notes show a subtle accent dot
- ⌨️ **Keyboard Shortcut** — Press Enter (without Shift) in the notes textarea to submit

---

## 🚀 Running Locally

### Prerequisites
- Node.js 18+
- npm / yarn / pnpm

### Steps

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev

# 3. Open in browser
# http://localhost:3000
```

### Build for Production

```bash
npm run build
npm start
```

---

## 🗂️ Project Structure

```
src/
├── app/
│   ├── globals.css       # Global styles, CSS custom properties, animations
│   ├── layout.tsx        # Root layout with font imports
│   └── page.tsx          # Entry page
└── components/
    └── WallCalendar.tsx  # Main calendar component (self-contained)
```

---

## 🛠️ Tech Choices

| Decision | Rationale |
|---|---|
| **Next.js 14 App Router** | Modern file-based routing, React Server Components where applicable |
| **TypeScript** | Type safety for date logic and state |
| **Tailwind CSS** | Rapid layout and responsive utilities |
| **CSS Custom Properties** | Dynamic theming without runtime overhead |
| **localStorage** | Client-side persistence — no backend needed per spec |
| **No external date library** | Vanilla JS Date API is sufficient; keeps bundle lean |
| **Lucide React** | Lightweight, consistent icon set |

---

## 📱 Responsive Design

- **Mobile (< 1024px)**: Stacked layout — hero image, then grid, then notes panel below
- **Desktop (≥ 1024px)**: Side-by-side — wide calendar grid left, notes panel right with decorative lines

---

## 🎨 Design Decisions

- **Playfair Display** for month headings — editorial, refined
- **DM Sans** for body — clean, readable
- **DM Mono** for day headers and year — technical, precise
- Each month has its own accent color that propagates through: range highlights, SAT column, note badges, button colors
- Diagonal image overlay maintains the "wall calendar wedge" aesthetic from the reference
- Spiral binding uses metallic CSS — purely decorative, purely CSS
