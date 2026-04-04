# \# Iran War Tracker — Operation Epic Fury COP

# 

# A full-stack real-time conflict intelligence platform tracking the 2026 Iran War (Operation Epic Fury). Built as a Common Operating Picture (COP) with an interactive map, event timeline, casualty analytics, infrastructure damage tracking, live GDELT news intelligence feed, and economic impact monitoring (oil prices + Strait of Hormuz shipping status).

# 

# !\[Tech Stack](https://img.shields.io/badge/React-18-blue) !\[Tech Stack](https://img.shields.io/badge/TypeScript-5-blue) !\[Tech Stack](https://img.shields.io/badge/Express-4-green) !\[Tech Stack](https://img.shields.io/badge/SQLite-3-lightgrey) !\[Tech Stack](https://img.shields.io/badge/MapLibre\_GL-4-orange) !\[Tech Stack](https://img.shields.io/badge/Recharts-2-purple) !\[Tech Stack](https://img.shields.io/badge/GDELT\_API-live-red)

# 

# \---

# 

# \## Screenshots

# 

# \### Main Dashboard — Map + Timeline

# !\[Dashboard Map View](screenshots/dashboard-map.png)

# 

# \### GDELT Live Intelligence Feed

# !\[GDELT Intel Feed](screenshots/gdelt-intel.png)

# 

# \### Oil Price Gauge + Strait of Hormuz Shipping Monitor

# !\[Economic Impact](screenshots/economic-impact.png)

# 

# \### Casualty Analytics

# !\[Casualty Charts](screenshots/casualties.png)

# 

# \### Infrastructure Damage

# !\[Infrastructure Damage](screenshots/damage.png)

# 

# \---

# 

# \## What Makes This Different

# 

# Most Iran war trackers (Al Jazeera, NYT, WaPo) are static news pages with timelines. This project is different:

# 

# | Feature | News Sites | This Dashboard |

# |---------|-----------|----------------|

# | Interactive geospatial map | No | Yes — MapLibre GL with severity-coded markers |

# | Live data ingestion | Manual updates | GDELT API — auto-refreshes every 15 min, monitors 100+ languages |

# | Economic impact correlation | Separate articles | Integrated — oil price gauge with US economy "Goldilocks zone," Hormuz shipping status |

# | Casualty analytics | Total numbers | Breakdowns by side, military vs civilian, daily trends, bar/pie charts |

# | Infrastructure damage | Mentioned in articles | Categorized (residential, military, medical, school) with country-level rollups |

# | Filterable | No | By category, country, and actor |

# | Open source | No | Full codebase on GitHub |

# | ML-ready data pipeline | No | Structured event data designed for training classifiers and RAG systems |

# 

# \### Why This Matters for AI/ML

# 

# This dashboard is the \*\*data collection and visualization layer\*\* for a larger AI engineering project:

# 

# 1\. \*\*Phase 1 (Complete):\*\* Full-stack dashboard with live data ingestion from GDELT

# 2\. \*\*Phase 2 (Next):\*\* Train a text classifier (scikit-learn → PyTorch) to auto-classify incoming GDELT articles by event type, severity, and actor

# 3\. \*\*Phase 3:\*\* Build a RAG (Retrieval-Augmented Generation) system using ChromaDB + LangChain so users can ask natural language questions about the conflict

# 4\. \*\*Phase 4:\*\* Docker containerization + CI/CD pipeline

# 

# The structured event data (57+ labeled events with categories, severity, actors, coordinates) serves as \*\*training data\*\* for the ML models in Phase 2.

# 

# \---

# 

# \## Overview

# 

# This application aggregates open-source intelligence (OSINT) data from multiple reporting agencies into a single-pane-of-glass dashboard for tracking the ongoing Iran conflict.

# 

# \*\*Key capabilities:\*\*

# 

# \- \*\*Interactive conflict map\*\* — MapLibre GL JS with severity-coded markers, popups with event details, and source attribution

# \- \*\*Event timeline\*\* — Chronological feed grouped by date with category/severity/actor filtering

# \- \*\*Casualty analytics\*\* — Bar charts, donut charts (killed by side, military vs civilian), daily killed timeline, breakdown tables

# \- \*\*Infrastructure damage tracking\*\* — Horizontal bar charts by category, country-level breakdowns, individual damage reports

# \- \*\*GDELT Live Intelligence Feed\*\* — Real-time article monitoring from GDELT Project API, auto-refreshes every 15 minutes, covers 100+ languages globally

# \- \*\*Oil Price Impact Gauge\*\* — Brent crude price against an inflation-adjusted "acceptable range" for the US economy ($60-$90 optimal, $90-$110 elevated, $110+ crisis)

# \- \*\*Strait of Hormuz Monitor\*\* — Daily ship transit counts, stranded vessel count, war risk insurance multiplier, blockade status

# \- \*\*Filtering engine\*\* — Filter by event category (airstrike, missile, drone, etc.), country, and actor

# \- \*\*Auto-refresh\*\* — All data endpoints poll every 5 minutes; GDELT polls every 15 minutes

# \- \*\*RESTful API\*\* — Full backend with aggregation endpoints for stats, casualty summaries, infrastructure summaries, GDELT proxy, oil prices, and Hormuz shipping data

# 

# \---

# 

# \## Tech Stack

# 

# | Layer | Technology | Purpose |

# |-------|-----------|---------|

# | \*\*Frontend\*\* | React 18, TypeScript | UI framework, type safety |

# | \*\*Styling\*\* | Tailwind CSS v3, shadcn/ui | Component library, dark theme |

# | \*\*Maps\*\* | MapLibre GL JS | Interactive vector map rendering |

# | \*\*Charts\*\* | Recharts | Data visualization (bar, pie, area, line) |

# | \*\*Routing\*\* | Wouter | Lightweight hash-based SPA routing |

# | \*\*State\*\* | TanStack React Query | Server state management, caching, auto-refresh |

# | \*\*Backend\*\* | Express.js, TypeScript | REST API server |

# | \*\*Database\*\* | SQLite + Drizzle ORM | Lightweight relational DB with type-safe queries |

# | \*\*Validation\*\* | Zod + drizzle-zod | Schema validation for API inputs |

# | \*\*Build\*\* | Vite | Fast dev server and production bundler |

# | \*\*Live Data\*\* | GDELT Project API | Global news monitoring (100+ languages, 15-min updates) |

# 

# \---

# 

# \## Architecture

# ┌───────────────────────────────────────────────────────┐

# │ Client (React) │

# │ ┌──────────┐ ┌──────────┐ ┌─────────────────────┐ │

# │ │ Dashboard │ │ MapLibre │ │ Recharts/Charts │ │

# │ │ 5 Tabs │──│ GL Map │ │ Casualty/Oil/Hormuz │ │

# │ └──────────┘ └──────────┘ └─────────────────────┘ │

# │ │ │ │ │

# │ └────────────┼──────────────┘ │

# │ │ TanStack Query (auto-refresh) │

# │ ▼ │

# │ fetch("./api/...") │

# └──────────────────────┬────────────────────────────────┘

# │ HTTP

# ┌──────────────────────┴────────────────────────────────┐

# │ Server (Express) │

# │ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ │

# │ │ /api/stats │ │ /api/events │ │/api/casualties│ │

# │ │ /api/infra │ │ /api/gdelt/\* │ │/api/oil-price │ │

# │ │ /api/hormuz │ │ │ │ │ │

# │ └──────┬───────┘ └──────┬───────┘ └──────┬────────┘ │

# │ └─────────────────┼─────────────────┘ │

# │ ┌──────┴──────┐ │

# │ │ Drizzle ORM │ GDELT API (proxy) │

# │ └──────┬──────┘ │

# │ ▼ │

# │ SQLite (data.db) │

# │ ┌──────────────────────────────┐ │

# │ │ events | casualties | │ │

# │ │ infrastructure │ │

# │ └──────────────────────────────┘ │

# └────────────────────────────────────────────────────────┘

# 

# text

# 

# \---

# 

# \## API Endpoints

# 

# | Method | Endpoint | Description |

# |--------|----------|-------------|

# | `GET` | `/api/stats` | Dashboard KPIs (total events, killed, wounded, countries) |

# | `GET` | `/api/events` | All events, filterable by `category`, `country`, `actor`, `startDate`, `endDate` |

# | `GET` | `/api/events/:id` | Single event by ID |

# | `GET` | `/api/casualties` | Casualty records, filterable by `country`, `side` |

# | `GET` | `/api/casualties/summary` | Aggregated casualties by side |

# | `GET` | `/api/infrastructure` | Infrastructure damage records |

# | `GET` | `/api/infrastructure/summary` | Aggregated damage by category and country |

# | `GET` | `/api/gdelt/articles` | Live GDELT articles (proxied, no CORS issues) |

# | `GET` | `/api/gdelt/tone` | GDELT sentiment/tone timeline (past 7 days) |

# | `GET` | `/api/oil-price` | Brent crude price, history, and US economy acceptable range |

# | `GET` | `/api/hormuz` | Strait of Hormuz shipping status, transit counts, stranded vessels |

# 

# \---

# 

# \## Getting Started

# 

# \### Prerequisites

# 

# \- \*\*Node.js\*\* v18+ (\[download](https://nodejs.org/))

# \- \*\*npm\*\* (comes with Node.js)

# \- \*\*Git\*\* (\[download](https://git-scm.com/downloads))

# 

# \### Installation

# 

# ```bash

# \# Clone the repository

# git clone https://github.com/Nominal-Ninja/iran-war-tracker.git

# cd iran-war-tracker

# 

# \# Install dependencies

# npm install

# 

# \# Push database schema

# npx drizzle-kit push

# 

# \# Start development server

# npm run dev

# ```

# 

# The app will be running at `http://localhost:3000`.

# 

# \### Windows Users

# 

# This project uses `cross-env` for Windows compatibility. If you see `NODE\_ENV is not recognized`, run `npm install cross-env` and ensure the `package.json` scripts use `cross-env` before `NODE\_ENV`.

# 

# \### Refreshing Data

# 

# To update the dashboard with new event data:

# 

# ```bash

# \# Delete the old database

# del data.db          # Windows

# rm data.db           # Mac/Linux

# 

# \# Recreate schema

# npx drizzle-kit push

# 

# \# Restart the server

# npm run dev

# ```

# 

# The seed data loads automatically on first server start.

# 

# \---

# 

# \## Project Structure

# iran-war-tracker/

# ├── client/ # Frontend (React + TypeScript)

# │ ├── src/

# │ │ ├── components/ # Reusable UI components

# │ │ │ ├── conflict-map.tsx # MapLibre GL interactive map

# │ │ │ ├── event-timeline.tsx # Chronological event feed

# │ │ │ ├── casualty-chart.tsx # Casualty analytics + charts

# │ │ │ ├── infrastructure-panel.tsx # Damage tracking panel

# │ │ │ ├── gdelt-feed.tsx # Live GDELT intelligence feed

# │ │ │ └── economic-impact.tsx # Oil gauge + Hormuz shipping

# │ │ ├── pages/

# │ │ │ └── dashboard.tsx # Main dashboard layout (5 tabs)

# │ │ ├── lib/

# │ │ │ └── queryClient.ts # TanStack Query config

# │ │ ├── App.tsx # Root component + routing

# │ │ └── index.css # Tailwind + dark theme

# │ └── index.html

# ├── server/ # Backend (Express + TypeScript)

# │ ├── routes.ts # API routes (events, GDELT, oil, Hormuz)

# │ ├── storage.ts # Database queries (Drizzle ORM)

# │ ├── seed.ts # Conflict data seeding (57+ events)

# │ └── index.ts # Express server entry point

# ├── shared/

# │ └── schema.ts # Database schema (Drizzle) + Zod types

# ├── pipeline/ # (Phase 2) ML classification pipeline

# ├── package.json

# ├── tailwind.config.ts

# ├── tsconfig.json

# ├── vite.config.ts

# └── drizzle.config.ts

# 

# text

# 

# \---

# 

# \## Data Sources

# 

# All data is sourced from publicly available OSINT reporting:

# 

# \- \*\*CENTCOM\*\* — US Central Command official statements and strike counts

# \- \*\*HRANA\*\* — Human Rights Activists News Agency (civilian casualty documentation)

# \- \*\*Hengaw Organization\*\* — Kurdish human rights organization

# \- \*\*Critical Threats (AEI/ISW)\*\* — Daily Iran war updates with detailed military analysis

# \- \*\*Al Jazeera\*\* — Live casualty tracker and reporting

# \- \*\*Reuters\*\* — Wire service reporting

# \- \*\*IDF\*\* — Israel Defense Forces official statements

# \- \*\*GDELT Project\*\* — Global Database of Events, Tone, and Language (real-time, 100+ languages)

# \- \*\*Jerusalem Post\*\* — Israeli media reporting

# \- \*\*Washington Post\*\* — Investigative reporting on civilian casualties

# \- \*\*Military Times / NBC News / CBS News\*\* — US military and policy reporting

# 

# \---

# 

# \## Roadmap

# 

# \### Completed

# \- \[x] Interactive conflict map with severity-coded markers

# \- \[x] Event timeline with date grouping and filtering

# \- \[x] Casualty analytics (bar charts, pie charts, breakdowns)

# \- \[x] Infrastructure damage tracking

# \- \[x] GDELT live intelligence feed (auto-refresh every 15 min)

# \- \[x] Oil price gauge with US economy impact zones

# \- \[x] Strait of Hormuz shipping status monitor

# \- \[x] Auto-refresh all data endpoints

# \- \[x] GitHub repository with professional documentation

# 

# \### Phase 2 — ML Pipeline (In Progress)

# \- \[ ] Python event classifier (scikit-learn → PyTorch)

# \- \[ ] Auto-classify GDELT headlines by event type/severity/actor

# \- \[ ] `/api/classify` prediction endpoint

# \- \[ ] Confusion matrix and model evaluation metrics

# 

# \### Phase 3 — RAG System

# \- \[ ] ChromaDB vector database for event embeddings

# \- \[ ] LangChain RAG pipeline for natural language Q\&A

# \- \[ ] "Ask about the conflict" search bar

# \- \[ ] Citation-backed AI-generated answers

# 

# \### Phase 4 — Production

# \- \[ ] Docker containerization

# \- \[ ] GitHub Actions CI/CD pipeline

# \- \[ ] Cloud deployment

# \- \[ ] Live data API integration (EIA oil prices, MarineTraffic shipping)

# 

# \---

# 

# \## Author

# 

# \*\*Austin Wesley\*\*

# \- GitHub: \[@Nominal-Ninja](https://github.com/Nominal-Ninja)

# \- Project: Part of an 18-month AI Engineer development portfolio

# 

# \---

# 

# \## Contributing

# 

# Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

# 

# \---

# 

# \## License

# 

# \[MIT](LICENSE)

# 

# \---

# 

# \## Disclaimer

# 

# This application is for informational and educational purposes only. Casualty and event data is sourced from publicly available reports and may not reflect the complete picture. Data accuracy depends on the reporting organizations cited.

