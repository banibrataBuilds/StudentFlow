# StudentFlow

A modern, aesthetic productivity suite for students. Track tasks, log study sessions, manage exams, and analyze your academic progress—all in one beautifully designed workspace.

![StudentFlow Preview](https://drive.google.com/file/d/1YPND2dgbn8214KBWgqf18xhQq1ffWKfs/preview)

## ✨ Features

- **Dashboard**: Get a bird's-eye view of your academic life with dynamic progress charts and an activity feed.
- **Task Management**: Create, edit, and organize tasks with priorities, due dates, and status tracking.
- **Study Planner**: Log your study sessions, track hours spent per subject, and view your study history.
- **Exam Tracker**: Keep tabs on upcoming exams, organize them by date and subject, and plan your preparation.
- **Notes**: A clean, distraction-free environment to jot down ideas, lecture summaries, or quick reminders.
- **Analytics**: Beautiful charts visualizing your productivity score and study distribution over time.
- **Authentication & Security**: Secure user sign-up, login, and data persistence powered by Supabase.
- **Premium Design**: A highly polished, glassmorphic UI with smooth animations and full Dark/Light mode support.

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Radix UI (shadcn/ui components), Lucide Icons
- **Routing**: React Router DOM
- **Forms & Validation**: React Hook Form, Zod
- **Backend & Database**: Supabase (PostgreSQL, Authentication)

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
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

1. Create a new project in your Supabase dashboard.
2. Go to the **SQL Editor** in Supabase.
3. Open the `supabase-setup.sql` file provided in this repository.
4. Copy the entire contents of the file and run it in the SQL Editor. This will automatically create all the necessary tables (`profiles`, `tasks`, `study_sessions`, `exams`, `notes`) and configure the Row Level Security (RLS) policies.

### 4. Configure Environment Variables

Create a `.env.local` file in the root directory of the project and add your Supabase project credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser to see the application!

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
