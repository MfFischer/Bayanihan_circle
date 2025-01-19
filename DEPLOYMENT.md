# Deployment Guide

Complete guide for deploying Bayanihan Savings Circle to production.

## Table of Contents

1. [Supabase Setup](#supabase-setup)
2. [Web App Deployment (Vercel)](#web-app-deployment)
3. [Desktop App Distribution](#desktop-app-distribution)
4. [Environment Configuration](#environment-configuration)
5. [Post-Deployment](#post-deployment)

## Supabase Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in project details:
   - Name: `bayanihan-circle`
   - Database Password: (generate strong password)
   - Region: Choose closest to your users
4. Wait for project to be created (~2 minutes)

### 2. Run Database Schema

1. Go to SQL Editor in Supabase dashboard
2. Click "New Query"
3. Copy entire contents of `supabase-schema.sql`
4. Paste and click "Run"
5. Verify all tables are created in Table Editor

### 3. Configure Authentication

1. Go to Authentication > Settings
2. Enable Email provider
3. Configure email templates (optional)
4. Set Site URL to your production URL
5. Add redirect URLs:
   - `https://yourdomain.com/**`
   - `http://localhost:3000/**` (for development)

### 4. Get API Credentials

1. Go to Settings > API
2. Copy:
   - Project URL
   - Anon/Public key
3. Save these for environment variables

### 5. Setup Storage (Optional)

1. Go to Storage
2. Create bucket: `documents`
3. Set policies for member document uploads

## Web App Deployment

### Option 1: Vercel (Recommended)

#### Prerequisites
- GitHub account
- Vercel account (free tier)

#### Steps

1. **Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/bayanihan-circle.git
git push -u origin main
```

2. **Deploy to Vercel**
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel
```

3. **Configure Environment Variables**

In Vercel Dashboard:
- Go to Project Settings > Environment Variables
- Add:
  ```
  VITE_SUPABASE_URL=your_supabase_url
  VITE_SUPABASE_ANON_KEY=your_supabase_key
  ```

4. **Redeploy**
```bash
vercel --prod
```

#### Custom Domain (Optional)

1. Go to Project Settings > Domains
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update Supabase redirect URLs

### Option 2: Netlify

1. Build the project:
```bash
npm run build
```

2. Deploy to Netlify:
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod --dir=dist
```

3. Set environment variables in Netlify dashboard

### Option 3: Self-Hosted

1. Build the project:
```bash
npm run build
```

2. Upload `dist/` folder to your web server

3. Configure web server (nginx example):
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/bayanihan-circle/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## Desktop App Distribution

### Building Installers

#### For Windows
```bash
npm run electron:build:win
```

Outputs:
- `release/Bayanihan Savings Circle-1.0.0-x64.exe` (installer)
- `release/Bayanihan Savings Circle-1.0.0-x64-portable.exe` (portable)

#### For macOS
```bash
npm run electron:build:mac
```

Outputs:
- `release/Bayanihan Savings Circle-1.0.0-x64.dmg`
- `release/Bayanihan Savings Circle-1.0.0-x64.zip`

#### For Linux
```bash
npm run electron:build:linux
```

Outputs:
- `release/Bayanihan Savings Circle-1.0.0-x64.AppImage`
- `release/Bayanihan Savings Circle-1.0.0-amd64.deb`

### Distribution Methods

#### 1. Direct Download
- Upload installers to your website
- Provide download links for each platform

#### 2. GitHub Releases
```bash
# Create release
git tag v1.0.0
git push origin v1.0.0
```
- Go to GitHub > Releases > Create Release
- Upload installers as release assets

#### 3. Auto-Update (Advanced)
- Configure electron-updater
- Host update files on server
- App will check for updates automatically

## Environment Configuration

### Development (.env.local)
```env
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=your_local_key
```

### Production (.env.production)
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_production_key
VITE_APP_NAME=Bayanihan Savings Circle
```

### Security Checklist

- [ ] Never commit `.env` files
- [ ] Use environment variables for all secrets
- [ ] Enable RLS on all Supabase tables
- [ ] Configure CORS properly
- [ ] Use HTTPS in production
- [ ] Set secure password policies
- [ ] Enable 2FA for admin accounts

## Post-Deployment

### 1. Create Admin Account

1. Register first user through the app
2. In Supabase SQL Editor:
```sql
UPDATE members 
SET role = 'admin' 
WHERE email = 'admin@yourdomain.com';
```

### 2. Configure Settings

1. Login as admin
2. Go to Settings
3. Configure:
   - Point rules
   - Interest rates
   - Contribution amounts
   - Loan limits

### 3. Test Everything

- [ ] User registration
- [ ] Login/logout
- [ ] Create contribution
- [ ] Apply for loan
- [ ] Admin approval workflow
- [ ] Point calculation
- [ ] Dashboard displays

### 4. Monitoring

#### Supabase Dashboard
- Monitor database usage
- Check API requests
- Review authentication logs

#### Vercel Dashboard
- Monitor deployments
- Check function logs
- Review analytics

### 5. Backup Strategy

1. **Database Backups**
   - Supabase Pro: Automatic daily backups
   - Free tier: Manual exports via SQL Editor

2. **Code Backups**
   - GitHub repository
   - Regular commits

### 6. Update Workflow

1. Make changes locally
2. Test thoroughly
3. Commit to GitHub
4. Vercel auto-deploys
5. For desktop app:
   - Build new version
   - Upload to releases
   - Notify users

## Troubleshooting

### Common Issues

**Issue**: Environment variables not working
- **Solution**: Rebuild after adding variables

**Issue**: Supabase connection fails
- **Solution**: Check URL and key, verify RLS policies

**Issue**: Desktop app won't start
- **Solution**: Check console logs, verify build configuration

**Issue**: Authentication not working
- **Solution**: Verify redirect URLs in Supabase settings

## Support

For deployment issues:
- Check documentation
- Review Supabase logs
- Check Vercel deployment logs
- Open GitHub issue

## Cost Estimate

### Free Tier (0-100 users)
- Supabase: Free
- Vercel: Free
- Total: $0/month

### Growing (100-1000 users)
- Supabase Pro: $25/month
- Vercel Pro: $20/month
- Total: $45/month

### Scale (1000+ users)
- Supabase Pro: $25/month
- Vercel Pro: $20/month
- Custom domain: $10-15/year
- Total: ~$45-50/month

---

**Ready to deploy? Follow the steps above and you'll be live in under an hour!**

