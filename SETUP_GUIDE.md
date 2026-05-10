# Product Catalog — Full Stack Setup Guide

## Project Structure

```
product-catalog/
├── backend/          ← Django REST API
└── frontend/         ← Next.js app
```

---

## STEP 1 — Supabase Setup

1. Go to https://supabase.com → Create a new project
2. Wait for it to provision (~2 min)

### Get your credentials:
- **Dashboard → Settings → API**
  - Copy: Project URL → `SUPABASE_URL`
  - Copy: `service_role` key → `SUPABASE_SERVICE_KEY`
- **Dashboard → Settings → Database → Connection string (URI)**
  - Use Transaction pooler (port 6543) → `DATABASE_URL`

### Create the Storage bucket:
- **Dashboard → Storage → New bucket**
  - Name: `product-images` 
  - Toggle: **Public bucket** ✓
  - Click Create

---

## STEP 2 — Backend Local Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate
# Activate (Mac/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy env file
cp .env.example .env
```

Now **edit `backend/.env`** and fill in your Supabase credentials:
```
SECRET_KEY=some-long-random-string-here
DEBUG=True
DATABASE_URL=postgresql://postgres.[ID]:[PASSWORD]@aws-0-region.pooler.supabase.com:6543/postgres
SUPABASE_URL=https://[ID].supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
SUPABASE_BUCKET=product-images
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

```bash
# Run migrations (creates tables in Supabase)
python manage.py migrate

# Create admin user (optional)
python manage.py createsuperuser

# Start development server
python manage.py runserver
```

Backend runs at: **http://localhost:8000**
API docs: **http://localhost:8000/api/products/**
Admin: **http://localhost:8000/admin/**

---

## STEP 3 — Frontend Local Setup

```bash
cd frontend

# Copy env file
cp .env.example .env.local
```

Edit `frontend/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs at: **http://localhost:3000**

---

## STEP 4 — Deploy Backend to Render

1. Push your `backend/` folder to a GitHub repo
2. Go to **https://render.com** → New → **Web Service**
3. Connect your GitHub repo
4. Settings:
   - **Root Directory:** `backend`
   - **Environment:** Python 3
   - **Build Command:** `pip install -r requirements.txt && python manage.py migrate && python manage.py collectstatic --noinput`
   - **Start Command:** `gunicorn config.wsgi:application --bind 0.0.0.0:$PORT`
5. Add **Environment Variables** (from Render dashboard → Environment):

| Key | Value |
|-----|-------|
| `SECRET_KEY` | (generate a long random string) |
| `DEBUG` | `False` |
| `DATABASE_URL` | your Supabase connection string |
| `SUPABASE_URL` | your Supabase project URL |
| `SUPABASE_SERVICE_KEY` | your service role key |
| `SUPABASE_BUCKET` | `product-images` |
| `CORS_ALLOWED_ORIGINS` | `https://your-frontend.vercel.app` |
| `ALLOWED_HOSTS` | `your-backend.onrender.com` |

6. Click **Deploy** — note the URL (e.g. `https://product-catalog-api.onrender.com`)

> **Note:** Free tier Render spins down after 15 min inactivity. First request may take 30–60 seconds — that's what the "Connecting to server" banner is for!

---

## STEP 5 — Deploy Frontend to Vercel

```bash
# Install Vercel CLI (optional, or use web UI)
npm install -g vercel

cd frontend
vercel
```

Or via **https://vercel.com**:
1. New Project → Import your `frontend/` folder from GitHub
2. Add Environment Variable:
   - `NEXT_PUBLIC_API_URL` = `https://your-backend.onrender.com/api`
3. Click **Deploy**

After deploy, go back to Render and update `CORS_ALLOWED_ORIGINS` to your Vercel URL.

---

## API Endpoints Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health/` | Health check |
| GET | `/api/products/` | List products (paginated, filterable) |
| POST | `/api/products/` | Create product |
| GET | `/api/products/{id}/` | Get single product |
| PUT | `/api/products/{id}/` | Update product |
| DELETE | `/api/products/{id}/` | Delete product |
| POST | `/api/products/import-data/` | Import CSV/XLSX |
| GET | `/api/products/export-data/?format=xlsx` | Export data |
| POST | `/api/products/upload-image/` | Upload product image |
| GET | `/api/products/stats/` | Dashboard statistics |

### Filter parameters for GET /api/products/
- `search=` — full text search on name, fg_code, hierarchy
- `category=`, `application=`, `application_type=`, `geo_bucket=`, `source=`
- `is_green=true/false`, `status=Evaluate`
- `ordering=fg_code,-updated_at` etc.
- `page=` — pagination (50 per page)

---

## Import File Format

Your CSV/Excel must have these column headers (exact match):

| Column | Example |
|--------|---------|
| Category | Building Care |
| Application | Air Freshener |
| Positioning | Hard Package Air Freshener |
| FG Code | 6101981 |
| Product | OASIS ISLAND WAVE ROOM REFRESHER |
| Product Hierarchy | OASIS ISLAND WAVE ROOM R |
| Application Type | Core |
| Geo Bucket | MEA Core |
| Pack Size | 2.5Gal |
| Source | US |
| Green | Yes / No |
| FC | Ex |
| Status | Evaluate |
| Listing | 0 or 1 |
| Feasibility | 0 or 1 |
| KE | 0 or 1 |
| Indicator 4 | 0 or 1 |
| Indicator 5 | 0 or 1 |
| Indicator 6 | 0 or 1 |

Rows with duplicate FG Codes will be **updated** (upsert behavior).
