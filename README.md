# QieWallet QA Reporter

A comprehensive QA test case and issue tracking dashboard for mobile app testing.

## Features

- 📋 **86 Pre-written Test Cases** for QieWallet app
- 📱 **Mobile Issue Reporter** - Report bugs directly from your Android phone
- 📸 **Screenshot Upload** - Capture and attach screenshots to issues
- 🔄 **Real-time Sync** - Issues sync between mobile and desktop automatically
- 📤 **Export Options** - CSV and HTML export with embedded screenshots
- 🎨 **Beautiful UI** - Dark mode mobile interface, light mode desktop

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Database**: SQLite (local) / PostgreSQL (production)
- **ORM**: Prisma
- **UI**: Tailwind CSS + shadcn/ui
- **Deployment**: Vercel

---

## 🚀 Deploy to Vercel + Supabase (FREE)

### Step 1: Create GitHub Repository

```bash
# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - QieWallet QA Reporter"

# Create repo on GitHub and push
gh repo create qiewallet-qa --public --source=. --push
```

### Step 2: Create Supabase Account (Free)

1. Go to [supabase.com](https://supabase.com)
2. Click **"Start your project"** → Sign up with GitHub
3. Create new organization (free)
4. Create new project:
   - Name: `qiewallet-qa`
   - Database password: **Save this!**
   - Region: Choose closest to you
5. Wait ~2 minutes for setup

### Step 3: Get Database Connection Strings

1. In Supabase dashboard → **Settings** → **Database**
2. Scroll to **Connection string** section
3. Select **URI** format
4. Copy and modify:

```bash
# Pooler URL (port 6543 with pgbouncer) - for DATABASE_URL
postgresql://postgres.[PROJECT_REF]:[YOUR_PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true

# Direct URL (port 5432) - for DIRECT_DATABASE_URL
postgresql://postgres.[PROJECT_REF]:[YOUR_PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres
```

### Step 4: Switch to PostgreSQL Schema

**IMPORTANT:** Before deploying, switch the Prisma schema:

```bash
# Backup SQLite schema
cp prisma/schema.prisma prisma/schema.sqlite.prisma

# Use PostgreSQL schema
cp prisma/schema.postgres.prisma prisma/schema.prisma
```

Or manually edit `prisma/schema.prisma`:
- Change `provider = "sqlite"` to `provider = "postgresql"`
- Add `directUrl = env("DIRECT_DATABASE_URL")` to datasource

### Step 5: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub (free)
3. Click **"Add New..."** → **Project**
4. Import your `qiewallet-qa` repository
5. **Add Environment Variables**:

| Name | Value |
|------|-------|
| `DATABASE_URL` | `postgresql://postgres...pooler.supabase.com:6543/postgres?pgbouncer=true` |
| `DIRECT_DATABASE_URL` | `postgresql://postgres...pooler.supabase.com:5432/postgres` |

6. Click **Deploy**
7. Wait ~3 minutes

### Step 6: Done! 🎉

Your app is live at:
- **Dashboard**: `https://your-app.vercel.app`
- **Mobile Reporter**: `https://your-app.vercel.app/mobile`

---

## 📱 Usage

### Desktop Dashboard

1. Open your Vercel URL
2. View **86 test cases** in Test Cases tab
3. Track issues in Issues tab
4. Export reports via header buttons

### Mobile Issue Reporter

1. On Android phone: `https://your-app.vercel.app/mobile`
2. Tap **"Take Photo"** to capture screenshot
3. Fill issue details
4. Tap **"Save Issue"**
5. Auto-syncs to dashboard!

---

## 🔧 Local Development

```bash
# Install dependencies
bun install

# Start dev server (uses SQLite by default)
bun run dev

# Open http://localhost:3000
```

---

## 📊 Project Structure

```
├── prisma/
│   ├── schema.prisma          # SQLite (local)
│   ├── schema.postgres.prisma # PostgreSQL (Vercel)
│   └── migrations/            # Database migrations
├── src/
│   ├── app/
│   │   ├── page.tsx          # Desktop dashboard
│   │   ├── mobile/page.tsx   # Mobile reporter
│   │   └── api/issues/       # API routes
│   ├── components/           # UI components
│   └── data/                 # Test cases data
└── README.md
```

---

## 🆓 Free Tier Limits

| Service | Free Limit |
|---------|-----------|
| Vercel | 100GB bandwidth/month |
| Supabase | 500MB database |
| Supabase | 1GB storage |
| Supabase | 50K monthly users |

---

## 🛠️ Troubleshooting

### Build fails on Vercel

Make sure you've:
1. Switched to PostgreSQL schema
2. Added both `DATABASE_URL` and `DIRECT_DATABASE_URL`
3. Connection strings have correct ports (6543 for pooler, 5432 for direct)

### Issues not saving

Check Vercel logs for database connection errors.

---

## 📝 License

MIT

---

## 🙏 Credits

Generated from QieWallet app screenshot analysis using AI.
