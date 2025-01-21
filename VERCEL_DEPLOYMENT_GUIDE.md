# 🚀 Vercel Deployment Guide

**Repository:** https://github.com/MfFischer/Bayanihan_circle  
**Latest Commit:** `38cf874` - fix(database): resolve get_admin_earnings 400 error and add E2E tests  
**Status:** ✅ Ready to Deploy

---

## 📋 Pre-Deployment Checklist

### ✅ **1. Database Migration Required**

Before deploying to Vercel, you **MUST** run the latest migration in Supabase:

**Migration File:** `migrations/005_fix_get_admin_earnings.sql`

**How to Run:**
1. Go to Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `bayanihan-circle` (kkoezjlrwjkygmmiqtym)
3. Go to **SQL Editor**
4. Click **New Query**
5. Copy and paste the content from `migrations/005_fix_get_admin_earnings.sql`
6. Click **Run**
7. ✅ Verify: No errors

**What This Migration Does:**
- Fixes the `get_admin_earnings()` function
- Resolves the 400 error on dashboard
- Enables "My Earnings" to display correctly

---

## 🌐 Deploy to Vercel

### **Option 1: Deploy via Vercel Dashboard (Recommended)**

1. **Go to Vercel:** https://vercel.com/dashboard
2. **Click "Add New Project"**
3. **Import Git Repository:**
   - Select: `MfFischer/Bayanihan_circle`
   - Click "Import"

4. **Configure Project:**
   - **Framework Preset:** Vite
   - **Root Directory:** `./` (leave as default)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

5. **Add Environment Variables:**
   Click "Environment Variables" and add:
   
   ```
   VITE_SUPABASE_URL=https://kkoezjlrwjkygmmiqtym.supabase.co
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```
   
   **Where to find these:**
   - Go to Supabase Dashboard → Project Settings → API
   - Copy "Project URL" → Use as `VITE_SUPABASE_URL`
   - Copy "anon public" key → Use as `VITE_SUPABASE_ANON_KEY`

6. **Click "Deploy"**
   - Vercel will build and deploy your app
   - Wait 2-3 minutes for deployment to complete

7. **✅ Done!** Your app will be live at:
   ```
   https://bayanihan-circle.vercel.app
   ```
   (or your custom domain)

---

### **Option 2: Deploy via Vercel CLI**

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   cd h:\softwares\BayanihanKoop
   vercel
   ```

4. **Follow Prompts:**
   - Set up and deploy? **Y**
   - Which scope? Select your account
   - Link to existing project? **N**
   - Project name? `bayanihan-circle`
   - Directory? `./`
   - Override settings? **N**

5. **Add Environment Variables:**
   ```bash
   vercel env add VITE_SUPABASE_URL
   vercel env add VITE_SUPABASE_ANON_KEY
   ```

6. **Deploy to Production:**
   ```bash
   vercel --prod
   ```

---

## 🔧 Post-Deployment Steps

### **1. Verify Deployment**

Visit your Vercel URL and check:
- ✅ App loads without errors
- ✅ Login page appears
- ✅ No console errors (F12 → Console)

### **2. Test Dashboard**

1. Login with admin credentials
2. Check Dashboard:
   - ✅ Total Collected shows correct amount
   - ✅ Active Funds shows correct amount
   - ✅ **My Earnings shows ₱2,060** (not ₱0)
   - ✅ No 400 errors in console

### **3. Test Payment Flow**

1. Go to Members → Select a member with active loan
2. Click "Pay" → Enter amount → Submit
3. Verify:
   - ✅ Payment recorded
   - ✅ Loan balance updates
   - ✅ Payment appears in history
   - ✅ Dashboard statistics update

---

## 🔐 Environment Variables Reference

**Required Variables:**

| Variable | Value | Where to Find |
|----------|-------|---------------|
| `VITE_SUPABASE_URL` | `https://kkoezjlrwjkygmmiqtym.supabase.co` | Supabase → Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGc...` | Supabase → Settings → API → anon public key |

**⚠️ Important:**
- Never commit `.env` file to GitHub
- Use Vercel's environment variables feature
- Keep your `anon` key public (it's safe for frontend)
- Never expose your `service_role` key

---

## 🎯 What's Deployed

**Latest Changes (Commit 38cf874):**
- ✅ Fixed `get_admin_earnings()` function
- ✅ Resolved 400 error on dashboard
- ✅ Added comprehensive E2E tests
- ✅ Payment history feature
- ✅ Loan balance tracking
- ✅ Active funds view

**Total Commits:** 16  
**Date Range:** Jan 7 - Jan 21, 2025

---

## 🐛 Troubleshooting

### **Issue: Build Fails on Vercel**

**Solution:**
1. Check build logs in Vercel dashboard
2. Verify `package.json` has correct scripts:
   ```json
   {
     "scripts": {
       "dev": "vite",
       "build": "vite build",
       "preview": "vite preview"
     }
   }
   ```
3. Ensure all dependencies are in `package.json`

### **Issue: App Loads but Shows Errors**

**Solution:**
1. Check environment variables are set correctly
2. Verify Supabase URL and anon key
3. Check browser console for specific errors
4. Ensure migration 005 was run in Supabase

### **Issue: "My Earnings" Still Shows ₱0**

**Solution:**
1. **Run migration 005 in Supabase** (most common issue)
2. Hard refresh browser (Ctrl+Shift+R)
3. Check Supabase logs for errors
4. Verify `get_admin_earnings()` function exists:
   ```sql
   SELECT * FROM get_admin_earnings((SELECT id FROM groups LIMIT 1));
   ```

### **Issue: 400 Error on get_admin_earnings**

**Solution:**
1. **Migration 005 not run** - Run it now
2. Clear browser cache
3. Redeploy from Vercel dashboard

---

## 📊 Deployment Checklist

Before going live, verify:

- [ ] Migration 005 run in Supabase
- [ ] Environment variables set in Vercel
- [ ] App builds successfully
- [ ] App loads without errors
- [ ] Login works
- [ ] Dashboard shows correct statistics
- [ ] "My Earnings" shows ₱2,060 (not ₱0)
- [ ] No console errors
- [ ] Payment recording works
- [ ] Loan balance updates correctly
- [ ] Payment history displays

---

## 🎉 Success Criteria

Your deployment is successful when:

✅ **Dashboard Statistics:**
- Total Collected: ₱28,000
- Active Funds: ₱22,000
- My Earnings: ₱2,060

✅ **No Errors:**
- No 400 errors in console
- No build errors
- No runtime errors

✅ **Features Working:**
- Login/logout
- Member management
- Loan scheduling
- Payment recording
- Payment history
- Real-time updates

---

## 🔄 Continuous Deployment

Vercel automatically deploys when you push to GitHub:

1. Make changes locally
2. Commit: `git commit -m "your message"`
3. Push: `git push origin master`
4. Vercel automatically builds and deploys
5. Check deployment status in Vercel dashboard

**Preview Deployments:**
- Every push creates a preview deployment
- Test changes before merging to production
- Share preview URLs with team

---

## 📞 Support

**Issues?**
1. Check Vercel build logs
2. Check Supabase logs
3. Check browser console
4. Verify environment variables
5. Ensure migration 005 is run

**Resources:**
- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs
- Vite Docs: https://vitejs.dev/guide/

---

## ✨ Summary

**Repository:** https://github.com/MfFischer/Bayanihan_circle  
**Latest Commit:** `38cf874`  
**Status:** ✅ Ready to Deploy

**Steps:**
1. Run migration 005 in Supabase
2. Deploy to Vercel (import from GitHub)
3. Add environment variables
4. Verify deployment
5. Test all features

**Your app will be live at:** `https://bayanihan-circle.vercel.app`

---

**Happy Deploying!** 🚀

