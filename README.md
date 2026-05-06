# SourceMind — AI Document Intelligence

SourceMind is an AI-powered document intelligence platform built for research, learning, and deep analysis. Turn your PDFs, URLs, and texts into a private knowledge brain.

[![Vercel Deploy](https://deploy-badge.vercel.app/vercel/sourcemind)](https://vercel.com/new/clone?repository-url=https://github.com/NandanSV2005/sourcemind)
[![Render Deploy](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🔗 Live Links
- **Live Demo (Frontend)**: [Deployed on Vercel](https://sourcemind.vercel.app)
- **Backend API**: [Deployed on Render](https://sourcemind-backend.onrender.com)
- **GitHub Repository**: [View Code](https://github.com/NandanSV2005/sourcemind)

## 🚀 Features
- **Upload Pipeline**: Ingest PDFs, URLs, and raw text seamlessly.
- **Cited Chat**: Ask questions and get answers with direct citations back to your source material.
- **Auto Summary**: Instantly synthesize all your sources into a structured research briefing.
- **Doc Comparator**: Analyze agreements and contradictions between two documents side-by-side.
- **Gap Finder**: Identify blind spots, contradictions, and unanswered questions in your research.
- **Study Mode**: Generate Mind Maps, Flashcards, and Quizzes from your documents.

## 🛠️ Tech Stack
- **Frontend**: Next.js 14, TailwindCSS, Framer Motion
- **Backend**: Express.js, Supabase, pgvector
- **AI Models**: Gemini 2.0 Flash, HuggingFace embeddings

## 📖 Deployment Steps

### 1. Database Setup
Ensure you have a Supabase project created with `pgvector` enabled and the required tables (`documents`, `chunks`, `mindmaps`, etc.) setup.

### 2. Backend Deployment (Render)
1. Connect this repository to your Render account.
2. Deploy using the included `backend/render.yaml` Blueprint or create a new Web Service.
3. Set the following environment variables:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `OPENROUTER_API_KEY`
   - `HUGGINGFACE_API_KEY`
   - `FRONTEND_URL` (Set this to your Vercel URL once deployed)

### 3. Frontend Deployment (Vercel)
1. Import this repository into Vercel.
2. Set the `Framework Preset` to Next.js.
3. Set the `Root Directory` to `frontend`.
4. Add the following environment variables:
   - `NEXT_PUBLIC_API_URL` (Set this to your Render backend URL)
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 4. Finalize Configuration
Ensure the `FRONTEND_URL` in your Render backend matches the generated Vercel URL to allow CORS.

## License
MIT

---

## 🛠️ Database Setup (Podcast Feature)

To enable the **Podcast (Audio Overview)** feature, run the following SQL in your Supabase SQL Editor:

```sql
create table podcasts (
  id uuid primary key default gen_random_uuid(),
  notebook_id uuid references notebooks(id) on delete cascade,
  title text not null,
  duration text,
  tone text,
  script text not null,
  chapters jsonb,
  created_at timestamp default now()
);
```
