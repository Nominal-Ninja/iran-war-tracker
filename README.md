# Iran War Tracker — Operation Epic Fury COP

> A real-time conflict intelligence platform with live geospatial maps and analytics, designed to visualize the humanitarian, operational, and economic impact of the 2026 Iran conflict (Operation Epic Fury). Built as a data collection and labeling layer for training ML classifiers and RAG systems on real-world OSINT data.

![Status](https://img.shields.io/badge/Phase_1-Complete-brightgreen) ![Status](https://img.shields.io/badge/Phase_2-In_Progress-yellow) ![License](https://img.shields.io/badge/License-MIT-blue)

**Stack:** React 18 / TypeScript / Express / SQLite / MapLibre GL / Recharts / GDELT API

---

## Screenshots

### Dashboard Overview — Interactive Map + Event Timeline
Severity-coded markers on a dark COP-style map. Click any marker for event details, source attribution, and links. Filter by category, country, or actor.

![Dashboard Map View](screenshots/dashboard-map.png)

### GDELT Live Intelligence Feed
Real-time articles from the GDELT Project API, monitoring news in 100+ languages. Server-side caching (15-min TTL) respects GDELT's rate limits while serving multiple users.

![GDELT Intel Feed](screenshots/gdelt-intel.png)

### Oil Price Gauge + Strait of Hormuz Shipping Monitor
Brent crude price against the US economy's "Goldilocks zone" ($60-$90/bbl). Green = optimal, yellow = strain, red = crisis. Daily Hormuz transit chart shows the shipping blockade's impact.

![Economic Impact](screenshots/economic-impact.png)

### Casualty Analytics
Breakdowns by side, military vs civilian, daily trends. Bar and donut charts with a detail table showing killed, wounded, military KIA, and civilian KIA per side.

![Casualty Charts](screenshots/casualties.png)

### Infrastructure Damage
Categorized damage reports (residential, military, medical, school, commercial, humanitarian) with country-level rollups and individual incident tracking.

![Infrastructure Damage](screenshots/damage.png)

---

## What Makes This Different

Most Iran war trackers are static news pages. This is an interactive intelligence platform:

**Live Data Ingestion**
- GDELT API monitors global news in 100+ languages, auto-refreshes every 15 minutes
- Server-side caching prevents rate limiting while serving multiple concurrent users

**Analytical Depth**
- Casualty breakdowns by side, military vs civilian, with daily trend charts
- Infrastructure damage categorized by type with country-level aggregation
- Oil price correlation with conflict events on the same timeline

**Economic Impact**
- Brent crude gauge with inflation-adjusted "acceptable range" for the US economy
- Strait of Hormuz daily transit counts, stranded vessels, war risk insurance multiplier
- Oil price history annotated with key conflict events

**Filterable and Interactive**
- Filter all data by event category (airstrike, missile, drone, etc.), country, and actor
- Map markers with click-through popups showing event details and source links

**ML-Ready Data Pipeline**
- 57+ hand-labeled events serve as supervised training data for Phase 2 classifiers
- Every GDELT article is an inference candidate for auto-classification
- Structured schema designed for embedding and RAG retrieval

---

## Core Purpose — AI/ML Engineering

This project exists to learn and demonstrate AI/ML engineering skills. The dashboard is the **data collection and labeling layer** that feeds into a machine learning pipeline.

**The point is not the dashboard — the point is training AI on real-world data.**

The dashboard makes the data visible and the pipeline auditable. Every labeled event is a training example. Every GDELT article is an inference candidate. Every API endpoint is a serving layer for model predictions.

| Phase | Focus | Status |
|-------|-------|--------|
| Phase 1 | Dashboard + live data ingestion | Complete |
| Phase 2 | ML text classifier (scikit-learn → PyTorch) | In Progress |
| Phase 3 | RAG system (ChromaDB + LangChain) | Planned |
| Phase 4 | Cloud deployment + CI/CD | Planned |

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18, TypeScript | UI framework, type safety |
| **Styling** | Tailwind CSS v3, shadcn/ui | Component library, dark COP theme |
| **Maps** | MapLibre GL JS | Interactive vector map with custom markers |
| **Charts** | Recharts | Bar, pie, area, and line charts for analytics |
| **State** | TanStack React Query | Server state management with auto-refresh polling |
| **Backend** | Express.js, TypeScript | REST API server with GDELT proxy caching |
| **Database** | SQLite + Drizzle ORM | Type-safe relational DB with Zod validation |
| **Build** | Vite | Fast dev server with hot module replacement |
| **Live Data** | GDELT Project API | Global event monitoring (100+ languages, 15-min updates) |

---

## Architecture

```
┌───────────────────────────────────────────────────────┐
│                    Client (React)                      │
│  ┌──────────┐  ┌──────────┐  ┌─────────────────────┐  │
│  │ Dashboard │  │ MapLibre │  │ Recharts/Charts     │  │
│  │  5 Tabs   │──│  GL Map  │  │ Casualty/Oil/Hormuz │  │
│  └──────────┘  └──────────┘  └─────────────────────┘  │
│         │            │              │                  │
│         └────────────┼──────────────┘                  │
│                      │                                 │
│          TanStack Query (auto-refresh)                 │
│          Stats/Events: 5-min poll                      │
│          GDELT: 15-min poll                            │
│                      ▼                                 │
│              fetch("./api/...")                         │
└──────────────────────┬────────────────────────────────┘
                       │ HTTP
┌──────────────────────┴────────────────────────────────┐
│                  Server (Express)                      │
│                                                        │
│  Local Data          External Data                     │
│  ┌──────────────┐    ┌──────────────────┐             │
│  │ /api/stats    │    │ /api/gdelt/*     │             │
│  │ /api/events   │    │ (15-min cache)   │             │
│  │ /api/casualties│    │ Proxies to GDELT │             │
│  │ /api/infra    │    │ API to avoid     │             │
│  │ /api/oil-price│    │ CORS + rate      │             │
│  │ /api/hormuz   │    │ limits           │             │
│  └──────┬───────┘    └──────────────────┘             │
│         │ Drizzle ORM                                  │
│         ▼                                              │
│  SQLite (data.db)                                      │
│  ┌────────────────────────────────────┐               │
│  │ events (57+ labeled)               │               │
│  │ casualties (daily snapshots/side)   │               │
│  │ infrastructure (damage by category) │               │
│  └────────────────────────────────────┘               │
└────────────────────────────────────────────────────────┘
```

---

## API Endpoints

| Method | Endpoint | Description | Example Query |
|--------|----------|-------------|---------------|
| `GET` | `/api/stats` | Dashboard KPIs | — |
| `GET` | `/api/events` | All events with filters | `?category=airstrike&country=Iran&actor=US` |
| `GET` | `/api/events/:id` | Single event by ID | `/api/events/42` |
| `GET` | `/api/casualties` | Casualty records | `?side=Iran&country=Iran` |
| `GET` | `/api/casualties/summary` | Aggregated by side | — |
| `GET` | `/api/infrastructure` | Damage records | `?country=Iran&category=military` |
| `GET` | `/api/infrastructure/summary` | Aggregated by category/country | — |
| `GET` | `/api/gdelt/articles` | Live GDELT articles (cached 15 min) | — |
| `GET` | `/api/gdelt/tone` | Sentiment timeline (past 7 days) | — |
| `GET` | `/api/oil-price` | Brent crude + acceptable range | — |
| `GET` | `/api/hormuz` | Strait of Hormuz shipping status | — |

---

## Getting Started

### Prerequisites

- **Node.js** v18+ ([download](https://nodejs.org/))
- **npm** (comes with Node.js)
- **Git** ([download](https://git-scm.com/downloads))

### First-Time Setup

```bash
# Clone the repository
git clone https://github.com/Nominal-Ninja/iran-war-tracker.git
cd iran-war-tracker

# Install dependencies
npm install

# Initialize the database (creates tables)
npx drizzle-kit push

# Start development server (seeds data automatically on first run)
npm run dev
```

The app will be running at `http://localhost:3000`.

### Windows Users

This project uses `cross-env` for Windows compatibility. The `package.json` scripts are already configured. If you encounter `NODE_ENV is not recognized`, ensure `cross-env` is installed:

```bash
npm install cross-env
```

### Refreshing Data

To update the dashboard with new event data, delete the database and restart:

```bash
# Windows
del data.db
npx drizzle-kit push
npm run dev

# Mac/Linux
rm data.db
npx drizzle-kit push
npm run dev
```

The seed data loads automatically when the server starts with an empty database.

---

## Project Structure

```
iran-war-tracker/
├── client/                  # Frontend (React + TypeScript)
│   ├── src/
│   │   ├── components/
│   │   │   ├── conflict-map.tsx        # MapLibre GL interactive map
│   │   │   ├── event-timeline.tsx      # Chronological event feed
│   │   │   ├── casualty-chart.tsx      # Casualty analytics + charts
│   │   │   ├── infrastructure-panel.tsx # Damage tracking panel
│   │   │   ├── gdelt-feed.tsx          # Live GDELT intelligence feed
│   │   │   └── economic-impact.tsx     # Oil gauge + Hormuz shipping
│   │   ├── pages/
│   │   │   └── dashboard.tsx           # Main dashboard layout (5 tabs)
│   │   └── index.css                   # Tailwind + dark COP theme
│   └── index.html
├── server/
│   ├── routes.ts            # API routes + GDELT proxy with caching
│   ├── storage.ts           # Database queries (Drizzle ORM)
│   ├── seed.ts              # Conflict data seeding (57+ events)
│   └── index.ts             # Express server entry point
├── shared/
│   └── schema.ts            # Database schema + Zod validation types
├── pipeline/                # (Phase 2) ML classification pipeline
├── screenshots/             # Dashboard screenshots for documentation
└── package.json
```

---

## Data Sources

All data is sourced from publicly available OSINT reporting:

| Source | Type | Coverage |
|--------|------|----------|
| **CENTCOM** | Official statements | US strike counts, operational updates |
| **HRANA** | Human rights NGO | Civilian casualty documentation |
| **Hengaw Organization** | Kurdish human rights | Military casualty estimates |
| **Critical Threats (AEI/ISW)** | Think tank | Daily military analysis, maps |
| **Al Jazeera** | News | Live casualty tracker, regional reporting |
| **Reuters** | Wire service | Breaking news, verified reports |
| **IDF** | Official statements | Israeli military operations |
| **GDELT Project** | Academic/API | Global news monitoring, 100+ languages, real-time |
| **Military Times / NBC / CBS** | US media | Military policy, casualty updates |

---

## Roadmap

### Phase 1 — Dashboard + Data Ingestion (Complete)
- [x] Interactive conflict map with severity-coded markers
- [x] Event timeline with date grouping and filtering
- [x] Casualty analytics (bar charts, pie charts, breakdowns by side)
- [x] Infrastructure damage tracking (categorized with country rollups)
- [x] GDELT live intelligence feed (auto-refresh every 15 min)
- [x] Oil price gauge with US economy impact zones
- [x] Strait of Hormuz shipping status monitor
- [x] Server-side GDELT caching to respect API rate limits (15-min TTL)
- [x] Auto-refresh all data endpoints (5-min polling)
- [x] GitHub repository with professional documentation
- [x] Windows compatibility (cross-env, Node v24 reusePort fix)

### Phase 2 — ML Pipeline (In Progress)
- [ ] Python event classifier (scikit-learn → PyTorch)
- [ ] Auto-classify GDELT headlines by event type/severity/actor
- [ ] `/api/classify` prediction endpoint
- [ ] Confusion matrix and model evaluation metrics

### Phase 3 — RAG System
- [ ] ChromaDB vector database for event embeddings
- [ ] LangChain RAG pipeline for natural language Q&A
- [ ] "Ask about the conflict" search bar
- [ ] Citation-backed AI-generated answers

### Phase 4 — Production
- [ ] Cloud deployment via Railway.app (persistent uptime for live GDELT feed)
- [ ] Docker containerization
- [ ] GitHub Actions CI/CD pipeline
- [ ] Live data API integration (EIA oil prices, MarineTraffic shipping)

---

## Contributing

Contributions are welcome. Areas where help is most valuable:

- **Adding GDELT event sources** — Expanding query coverage to capture more conflict-related articles
- **Improving the ML classifier** (Phase 2) — Feature engineering, model architecture suggestions
- **Live data API integration** — Connecting real-time EIA oil price or MarineTraffic shipping APIs
- **Testing and bug reports** — Especially cross-browser and mobile layout issues

For major changes, please open an issue first to discuss what you would like to change.

---

## Author

**Austin Wesley**
- GitHub: [@Nominal-Ninja](https://github.com/Nominal-Ninja)
- Project: Part of an 18-month AI Engineer development portfolio
- Focus: Data engineering → AI/ML engineering → AI architecture

---

## License

[MIT](LICENSE)

---

## Disclaimer

This application is for informational and educational purposes only. Casualty and event data is sourced from publicly available reports and may not reflect the complete picture. Data accuracy depends on the reporting organizations cited.
