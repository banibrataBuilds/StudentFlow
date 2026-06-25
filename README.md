# StudentFlow

A modern, aesthetic productivity suite for students. Track tasks, log study sessions, manage exams, and analyze your academic progress — all in one beautifully designed workspace.

## ✨ Features

- **Dashboard** — Bird's-eye view with dynamic progress charts and activity feed
- **Task Management** — Create, edit, and organize tasks with priorities, due dates, and a Kanban board
- **Study Planner** — Log study sessions, track hours per subject, view study history
- **Exam Tracker** — Keep tabs on upcoming exams organized by date and subject
- **Notes** — Clean, distraction-free note editor with search
- **Analytics** — Charts visualizing productivity score and study distribution
- **Auth & Security** — Secure sign-up/login powered by Supabase with Row Level Security
- **Premium Design** — Glassmorphic UI with smooth animations, full dark/light mode

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite 8
- **Styling**: Tailwind CSS, Radix UI (shadcn/ui), Framer Motion, Three.js
- **Routing**: React Router DOM v7
- **Forms & Validation**: React Hook Form, Zod
- **Backend & Database**: Supabase (PostgreSQL + Auth + RLS)

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- A [Supabase](https://supabase.com/) account

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/studentflow.git
cd studentflow
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Supabase

1. Create a new project in your [Supabase dashboard](https://app.supabase.com/).
2. Go to **SQL Editor** and run the entire contents of `supabase-setup.sql` — this creates all tables (`profiles`, `tasks`, `study_sessions`, `exams`, `notes`) and configures Row Level Security.

### 4. Configure environment variables

Copy `.env.example` to `.env` and fill in your Supabase project credentials:

```bash
cp .env.example .env
```

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

> **Where to find these values:** Supabase Dashboard → Project Settings → API
>
> The `anon` key is a **public** key designed to be in the browser. Supabase's Row Level Security policies protect your data — not the key itself.

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## ☁️ Deploying to Vercel

1. Push your repository to GitHub (`.env` is committed and will be read by Vite during Vercel's build).
2. Go to [vercel.com](https://vercel.com) → **New Project** → import your GitHub repo.
3. Vercel auto-detects Vite — no framework settings needed.
4. Click **Deploy**.

> The `vercel.json` already includes the SPA rewrite rule so client-side routing works correctly on all URLs.

### Adding a custom Supabase domain (optional)

If you use a custom domain on Vercel, add it to Supabase:
- Supabase Dashboard → Authentication → **URL Configuration**
- Add your Vercel URL to **Site URL** and **Redirect URLs**

---

## 📄 License

MIT License — see the LICENSE file for details.
