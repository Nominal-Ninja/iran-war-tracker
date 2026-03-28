# Complete Setup Guide: GitHub + Local Development

This guide walks you through everything from creating a GitHub account to running this project locally and pushing your first commit. No prior Git experience required.

---

## PHASE 1: Install the Tools (One-Time Setup)

### Step 1: Install Git

**Windows:**
1. Go to https://git-scm.com/downloads
2. Download the Windows installer
3. Run it — accept all defaults (just keep clicking Next)
4. When done, open **Command Prompt** or **PowerShell** and type:
   ```
   git --version
   ```
   You should see something like `git version 2.44.0`

**Mac:**
1. Open Terminal
2. Type `git --version`
3. If not installed, it will prompt you to install Xcode Command Line Tools — click Install
4. Or install via Homebrew: `brew install git`

### Step 2: Install Node.js

1. Go to https://nodejs.org/
2. Download the **LTS** version (not Current)
3. Run the installer — accept all defaults
4. Verify in your terminal:
   ```
   node --version    # Should show v18+ or v20+
   npm --version     # Should show 9+ or 10+
   ```

### Step 3: Install a Code Editor

Download **VS Code**: https://code.visualstudio.com/

Recommended extensions (install from the Extensions tab in VS Code):
- **ESLint** — catches code errors
- **Prettier** — auto-formats your code
- **GitLens** — shows Git blame/history inline
- **Tailwind CSS IntelliSense** — autocomplete for Tailwind classes
- **TypeScript Importer** — auto-imports

---

## PHASE 2: Create Your GitHub Account & Repository

### Step 1: Create a GitHub Account

1. Go to https://github.com
2. Click **Sign Up**
3. Use a professional username (e.g., `austin-wesley` or `awesleydev` — NOT `xXgamer420Xx`)
4. Complete the setup — free tier is fine

### Step 2: Configure Git on Your Machine

Open your terminal and run these two commands (use YOUR name and email):

```bash
git config --global user.name "Austin Wesley"
git config --global user.email "austin.wesley.2016@gmail.com"
```

This tells Git who you are for commit history. This is public — it shows up on every commit.

### Step 3: Set Up SSH Authentication (Recommended)

This lets you push code without typing your password every time.

```bash
# Generate an SSH key
ssh-keygen -t ed25519 -C "austin.wesley.2016@gmail.com"

# Press Enter for default file location
# Press Enter twice for no passphrase (or set one if you want extra security)
```

Now add the key to GitHub:

```bash
# Copy your public key to clipboard
# On Mac:
cat ~/.ssh/id_ed25519.pub | pbcopy

# On Windows (PowerShell):
cat ~/.ssh/id_ed25519.pub | clip

# On Windows (Git Bash):
cat ~/.ssh/id_ed25519.pub | clip
```

Then:
1. Go to https://github.com/settings/keys
2. Click **New SSH Key**
3. Title: "My Laptop" (or whatever)
4. Paste the key you copied
5. Click **Add SSH Key**

Test it:
```bash
ssh -T git@github.com
# Should say: "Hi YOUR_USERNAME! You've successfully authenticated..."
```

### Step 4: Create the Repository on GitHub

1. Go to https://github.com/new
2. Repository name: `iran-war-tracker`
3. Description: "Full-stack conflict dashboard tracking the 2026 Iran War — React, TypeScript, Express, MapLibre GL, SQLite"
4. Set to **Public** (so employers/recruiters can see it)
5. Do NOT check "Add a README file" (we already have one)
6. Do NOT check "Add .gitignore" (we already have one)
7. Click **Create repository**
8. GitHub will show you instructions — STOP, don't follow those yet. Follow Phase 3 below instead.

---

## PHASE 3: Get the Code on Your Machine

### Option A: If you're downloading the project files from your workspace

1. Download the `iran-war-tracker` folder to your computer
2. Open a terminal and navigate to it:
   ```bash
   cd ~/Desktop/iran-war-tracker    # or wherever you put it
   ```

### Option B: If you already have the files somewhere

Just `cd` into that directory.

### Step 1: Initialize Git in the Project

```bash
cd iran-war-tracker

# Initialize a new Git repository
git init

# Add the remote (YOUR GitHub repo URL)
# Use SSH format:
git remote add origin git@github.com:YOUR_USERNAME/iran-war-tracker.git
# OR use HTTPS format (if you didn't set up SSH):
# git remote add origin https://github.com/YOUR_USERNAME/iran-war-tracker.git
```

### Step 2: Make Your First Commit

```bash
# Stage ALL files for commit
git add .

# Check what's being committed (should NOT include node_modules or data.db)
git status

# Make your first commit
git commit -m "Initial commit: Iran War Tracker v1 — full-stack conflict dashboard"

# Push to GitHub
git push -u origin main
```

If you get an error about `main` vs `master`:
```bash
# Rename your branch to main
git branch -M main
git push -u origin main
```

### Step 3: Verify on GitHub

Go to `https://github.com/YOUR_USERNAME/iran-war-tracker` — you should see all your files and the README displayed.

---

## PHASE 4: Run the Project Locally

### Step 1: Install Dependencies

```bash
cd iran-war-tracker
npm install
```

This reads `package.json` and installs everything into `node_modules/`.

### Step 2: Create the Database

```bash
npx drizzle-kit push
```

This creates `data.db` with the tables defined in `shared/schema.ts`.

### Step 3: Start the Dev Server

```bash
npm run dev
```

Open your browser to **http://localhost:5000**. You should see the dashboard.

The dev server has **hot reload** — when you edit and save a file, the browser updates automatically. No need to restart.

### Step 4: Make a Change, Commit, Push

Edit something (like the title in `dashboard.tsx`), then:

```bash
git add .
git commit -m "Update dashboard title"
git push
```

That's it. Your change is now on GitHub.

---

## PHASE 5: Daily Git Workflow

Here's the pattern you'll follow every time you work on the code:

```bash
# 1. Pull latest changes (in case you edited on another machine)
git pull

# 2. Make your code changes in VS Code

# 3. Check what changed
git status
git diff                    # see line-by-line changes

# 4. Stage your changes
git add .                   # stage everything
# OR stage specific files:
git add client/src/pages/dashboard.tsx

# 5. Commit with a meaningful message
git commit -m "Add date range filter to event timeline"

# 6. Push to GitHub
git push
```

### Good Commit Messages

```
✅ "Add casualty breakdown chart with military vs civilian split"
✅ "Fix map marker popup not showing source URL"
✅ "Add Houthi actor filter to dropdown"
✅ "Refactor storage layer to use typed return values"

❌ "updated stuff"
❌ "fix"
❌ "WIP"
❌ "asdfasdf"
```

---

## PHASE 6: Making the Code "Yours"

### What to Customize

1. **Add comments throughout the code** — Explain WHY, not WHAT:
   ```typescript
   // Bad:
   // Set the map center
   center: [51.389, 32.0],

   // Good:
   // Center on Iran — rough geographic center for the conflict theater
   center: [51.389, 32.0],
   ```

2. **Add a header comment to every file you touch:**
   ```typescript
   /**
    * conflict-map.tsx
    * Interactive MapLibre GL map rendering conflict events with severity-coded markers.
    * Uses OpenStreetMap raster tiles with desaturated dark styling for COP aesthetic.
    *
    * Author: Austin Wesley
    * Last Modified: 2026-03-28
    */
   ```

3. **Extend the functionality** — This is what will impress employers:
   - Add a date range picker filter
   - Add a search bar for event titles
   - Add click-to-zoom on map markers
   - Add a "most recent 24 hours" quick filter
   - Export data to CSV
   - Add loading skeletons to the map panel
   - Write unit tests for the API routes

4. **Remove/replace the Perplexity attribution** — The footer says "Created with Perplexity Computer." Replace with your name or remove it.

5. **Update the README** — Add your name, LinkedIn, and a screenshot of the running app.

---

## PHASE 7: Updating the README

The README is the first thing anyone sees on your repo. Keep it updated.

### How to Add a Screenshot

1. Take a screenshot of the running app
2. Save it as `screenshot.png` in the project root
3. In README.md, add:
   ```markdown
   ![Dashboard Screenshot](screenshot.png)
   ```
4. Commit and push

### How to Add Badges

At the top of the README, update the shields:
```markdown
![Build](https://img.shields.io/badge/build-passing-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
```

### Sections to Keep Updated

- **Roadmap** — Check off items as you complete them, add new ones
- **Tech Stack** — If you add new libraries, update this table
- **API Endpoints** — If you add new routes, document them
- **Data Sources** — If you add new data feeds

---

## PHASE 8: Level-Up Moves (For Your AI Engineer Portfolio)

These are the things that will make this project stand out:

### 1. Add Docker Support
Create a `Dockerfile` and `docker-compose.yml` so anyone can run it with one command. Shows containerization skills.

### 2. Add GitHub Actions CI/CD
Create `.github/workflows/build.yml` that runs on every push:
- Linting
- Type checking
- Build verification

### 3. Add a Python Data Pipeline
Create a `pipeline/` directory with a Python script that:
- Fetches real-time data from a news API
- Parses and structures it
- Inserts into the SQLite database
This shows your data engineering + AI pipeline skills.

### 4. Add LLM-Powered Event Classification
Use an LLM API to auto-classify incoming events by severity and category. Shows AI engineering skills.

### 5. Add Vector Search
Store event descriptions as embeddings in a vector database (ChromaDB, Pinecone). Add a semantic search endpoint: "Find events similar to: missile strike on civilian infrastructure." Shows RAG/vector DB skills.

---

## Quick Reference

| Command | What it does |
|---------|-------------|
| `git init` | Initialize a new Git repo |
| `git add .` | Stage all changes |
| `git commit -m "message"` | Save a snapshot |
| `git push` | Upload to GitHub |
| `git pull` | Download latest from GitHub |
| `git status` | See what changed |
| `git diff` | See line-by-line changes |
| `git log --oneline` | See commit history |
| `npm install` | Install project dependencies |
| `npm run dev` | Start dev server (hot reload) |
| `npm run build` | Build for production |
| `npx drizzle-kit push` | Create/update database schema |

---

## Troubleshooting

**"npm run dev" fails:**
- Make sure you ran `npm install` first
- Make sure Node.js v18+ is installed
- Try deleting `node_modules` and `package-lock.json`, then `npm install` again

**"npx drizzle-kit push" fails:**
- Make sure you're in the project root directory
- The `drizzle.config.ts` file must exist

**"git push" asks for a password:**
- Set up SSH keys (Phase 2, Step 3)
- Or use a Personal Access Token: https://github.com/settings/tokens

**Database is empty (no events on map):**
- The seed data loads automatically when the server starts
- If `data.db` exists but is empty, delete it and restart the server

**Map tiles don't load:**
- OpenStreetMap tiles require internet access
- If behind a corporate proxy, you may need to configure proxy settings
