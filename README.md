# Iran War Tracker — Operation Epic Fury COP

A full-stack real-time conflict dashboard tracking the 2026 Iran War (Operation Epic Fury). Built as a Common Operating Picture (COP) with an interactive map, event timeline, casualty analytics, and infrastructure damage tracking.

![Tech Stack](https://img.shields.io/badge/React-18-blue) ![Tech Stack](https://img.shields.io/badge/TypeScript-5-blue) ![Tech Stack](https://img.shields.io/badge/Express-4-green) ![Tech Stack](https://img.shields.io/badge/SQLite-3-lightgrey) ![Tech Stack](https://img.shields.io/badge/MapLibre_GL-4-orange) ![Tech Stack](https://img.shields.io/badge/Recharts-2-purple)

---

## Overview

This application aggregates open-source intelligence (OSINT) data from multiple reporting agencies (CENTCOM, HRANA, Al Jazeera, Reuters, IDF, Hengaw Organization) into a single-pane-of-glass dashboard for tracking the ongoing Iran conflict.

**Key capabilities:**

- **Interactive conflict map** — MapLibre GL JS with severity-coded markers, popups with event details, and source attribution
- **Event timeline** — Chronological feed grouped by date with category/severity/actor filtering
- **Casualty analytics** — Bar charts, donut charts (killed by side, military vs civilian), daily killed timeline, breakdown tables
- **Infrastructure damage tracking** — Horizontal bar charts by category, country-level breakdowns, individual damage reports
- **Filtering engine** — Filter by event category (airstrike, missile, drone, etc.), country, and actor
- **RESTful API** — Full CRUD backend with aggregation endpoints for stats, casualty summaries, and infrastructure summaries

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18, TypeScript | UI framework, type safety |
| **Styling** | Tailwind CSS v3, shadcn/ui | Component library, dark theme |
| **Maps** | MapLibre GL JS | Interactive vector map rendering |
| **Charts** | Recharts | Data visualization (bar, pie, line) |
| **Routing** | Wouter | Lightweight hash-based SPA routing |
| **State** | TanStack React Query | Server state management, caching |
| **Backend** | Express.js, TypeScript | REST API server |
| **Database** | SQLite + Drizzle ORM | Lightweight relational DB with type-safe queries |
| **Validation** | Zod + drizzle-zod | Schema validation for API inputs |
| **Build** | Vite | Fast dev server and production bundler |

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Client (React)                    │
│  ┌──────────┐  ┌──────────┐  ┌───────────────────┐  │
│  │ Dashboard │  │ MapLibre │  │ Recharts/Charts   │  │
│  │   Page    │──│  GL Map  │  │ (Casualty, Infra) │  │
│  └──────────┘  └──────────┘  └───────────────────┘  │
│         │            │              │                │
│         └────────────┼──────────────┘                │
│                      │ TanStack Query                │
│                      ▼                               │
│              fetch("./api/...")                       │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP
┌──────────────────────┴──────────────────────────────┐
│                  Server (Express)                     │
│  ┌────────────┐  ┌────────────┐  ┌───────────────┐  │
│  │ /api/stats  │  │ /api/events│  │/api/casualties│  │
│  │ /api/infra  │  │ /api/event │  │/api/cas/summ  │  │
│  └──────┬─────┘  └──────┬─────┘  └──────┬────────┘  │
│         └───────────────┼───────────────┘            │
│                         │ Drizzle ORM                │
│                         ▼                            │
│                 SQLite (data.db)                      │
│         ┌───────────────────────────┐                │
│         │ events | casualties |     │                │
│         │ infrastructure            │                │
│         └───────────────────────────┘                │
└──────────────────────────────────────────────────────┘
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/stats` | Dashboard KPIs (total events, killed, wounded, countries) |
| `GET` | `/api/events` | All events, filterable by `category`, `country`, `actor`, `startDate`, `endDate` |
| `GET` | `/api/events/:id` | Single event by ID |
| `GET` | `/api/casualties` | Casualty records, filterable by `country`, `side` |
| `GET` | `/api/casualties/summary` | Aggregated casualties by side |
| `GET` | `/api/infrastructure` | Infrastructure damage records |
| `GET` | `/api/infrastructure/summary` | Aggregated damage by category and country |

---

## Getting Started

### Prerequisites

- **Node.js** v18+ ([download](https://nodejs.org/))
- **npm** (comes with Node.js)
- **Git** ([download](https://git-scm.com/downloads))

### Installation

```bash
# Clone the repository
git clone https://github.com/Nominal-Ninja/iran-war-tracker.git
cd iran-war-tracker

# Install dependencies
npm install

# Push database schema
npx drizzle-kit push

# Start development server
npm run dev
```

The app will be running at `http://localhost:5000`.

### Production Build

```bash
# Build for production
npm run build

# Run production server
NODE_ENV=production node dist/index.cjs
```

---

## Project Structure

```
iran-war-tracker/
├── client/                  # Frontend (React + TypeScript)
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── conflict-map.tsx        # MapLibre GL interactive map
│   │   │   ├── event-timeline.tsx      # Chronological event feed
│   │   │   ├── casualty-chart.tsx      # Casualty analytics + charts
│   │   │   └── infrastructure-panel.tsx # Damage tracking panel
│   │   ├── pages/
│   │   │   └── dashboard.tsx           # Main dashboard layout
│   │   ├── lib/
│   │   │   └── queryClient.ts          # TanStack Query config
│   │   ├── App.tsx                     # Root component + routing
│   │   └── index.css                   # Tailwind + dark theme
│   └── index.html
├── server/                  # Backend (Express + TypeScript)
│   ├── routes.ts            # API route definitions
│   ├── storage.ts           # Database queries (Drizzle ORM)
│   ├── seed.ts              # Initial conflict data seeding
│   └── index.ts             # Express server entry point
├── shared/
│   └── schema.ts            # Database schema (Drizzle) + Zod types
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── vite.config.ts
└── drizzle.config.ts
```

---

## Data Model

### Events Table
Tracks individual conflict events (airstrikes, missile attacks, diplomatic actions, etc.) with geolocation, severity, actor attribution, and source links.

### Casualties Table
Daily casualty snapshots by country and side (Iran, US, Israel, Lebanon, Gulf States, Iraq) with military/civilian breakdowns.

### Infrastructure Table
Damage reports categorized by type (residential, military, medical, school, commercial, humanitarian) with country-level attribution.

---

## Data Sources

All data is sourced from publicly available OSINT reporting:

- **CENTCOM** — US Central Command official statements
- **HRANA** — Human Rights Activists News Agency
- **Hengaw Organization** — Kurdish human rights organization
- **Al Jazeera** — Live casualty tracker and reporting
- **Reuters** — Wire service reporting
- **IDF** — Israel Defense Forces official statements
- **Jerusalem Post** — Israeli media reporting
- **Washington Post** — Investigative reporting on civilian casualties

---

## Roadmap

- [ ] Live data ingestion via news API / RSS feeds
- [ ] WebSocket real-time updates
- [ ] User-submitted event reports with verification workflow
- [ ] Satellite imagery overlay integration
- [ ] ACLED conflict data API integration
- [ ] Export to CSV/PDF
- [ ] Mobile-responsive layout optimization
- [ ] Docker containerization
- [ ] CI/CD pipeline (GitHub Actions)

---

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

---

## License

[MIT](LICENSE)

---

## Disclaimer

This application is for informational and educational purposes only. Casualty and event data is sourced from publicly available reports and may not reflect the complete picture. Data accuracy depends on the reporting organizations cited.
