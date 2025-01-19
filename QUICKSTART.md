# Quick Start Guide

Get Bayanihan Savings Circle running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- Supabase account (free)

## Step 1: Clone & Install (2 minutes)

```bash
# Clone the repository
git clone https://github.com/yourusername/bayanihan-savings-circle.git
cd bayanihan-savings-circle

# Install dependencies
npm install
```

## Step 2: Setup Supabase (2 minutes)

1. Go to [supabase.com](https://supabase.com) and create account
2. Click "New Project"
3. Name it "bayanihan-circle"
4. Wait for project creation
5. Go to SQL Editor
6. Copy contents of `supabase-schema.sql`
7. Paste and click "Run"
8. Go to Settings > API
9. Copy Project URL and Anon Key

## Step 3: Configure Environment (30 seconds)

```bash
# Copy example env file
cp .env.example .env

# Edit .env and add your Supabase credentials
# VITE_SUPABASE_URL=your_url_here
# VITE_SUPABASE_ANON_KEY=your_key_here
```

## Step 4: Run the App (30 seconds)

### Web App
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

### Desktop App
```bash
npm run electron:dev
```

## Step 5: Create Admin Account

1. Register a new account in the app
2. Go to Supabase SQL Editor
3. Run:
```sql
UPDATE members 
SET role = 'admin' 
WHERE email = 'your@email.com';
```
4. Logout and login again

## You're Done! 🎉

Now you can:
- ✅ Register members
- ✅ Record contributions
- ✅ Process loans
- ✅ Track points
- ✅ Calculate dividends

## Next Steps

- Read [USER_GUIDE.md](USER_GUIDE.md) for detailed usage
- Read [DEPLOYMENT.md](DEPLOYMENT.md) for production deployment
- Customize point rules in Settings
- Invite your cooperative members!

## Troubleshooting

**Problem**: Can't connect to Supabase
- **Solution**: Check your .env file has correct URL and key

**Problem**: Tables not found
- **Solution**: Make sure you ran the SQL schema in Supabase

**Problem**: Can't login after registration
- **Solution**: Check email for verification link

**Problem**: Desktop app won't start
- **Solution**: Make sure web app is running first (npm run dev)

## Need Help?

- Check [README.md](README.md) for full documentation
- Open an issue on GitHub
- Email support@bayanihancircle.com

---

**Happy Cooperating! 🤝**

