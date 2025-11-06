# Bayanihan Koop - Offline Desktop Application

A complete offline desktop application for managing cooperative savings circles. Built with Electron and SQLite, it requires no internet connection and works entirely on your local machine.

![Version](https://img.shields.io/badge/version-1.0.0-green.svg)
![Platform](https://img.shields.io/badge/platform-Windows-blue.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## 🎯 Overview

**Bayanihan Koop Offline** is a standalone desktop application that provides complete cooperative management functionality without requiring internet or cloud services. Perfect for groups that need reliable, offline-first operations.

### ✨ Key Features

**Complete Offline Operation**
- ✅ No internet connection required
- ✅ Local SQLite database
- ✅ All data stored on your machine
- ✅ Automatic database backups

**Member Management**
- ✅ Add, edit, delete members
- ✅ View member profiles with share capital
- ✅ Track member contributions and loans
- ✅ Collect membership fees

**Loan Management**
- ✅ Schedule loans for future approval
- ✅ Approve and disburse loans
- ✅ Track loan payments with history
- ✅ Automatic balance calculations
- ✅ Interest-free 30-day payment rule

**Financial Tracking**
- ✅ Record contributions with status
- ✅ Track active funds and available loans
- ✅ Admin earnings from membership fees
- ✅ Real-time dashboard analytics

**Data Management**
- ✅ Automatic database migrations
- ✅ Secure local storage
- ✅ No cloud dependencies
- ✅ Easy data portability

## 📋 Prerequisites

For **using** the application (end users):
- Windows 10 or later (64-bit)
- ~500 MB disk space
- Nothing else! Everything is bundled in the installer.

For **building** the application (developers only):
- Node.js 18+
- npm or yarn

## 📦 Installation

### Option 1: Download Installer (Recommended)

1. Download `Bayanihan Koop-Setup-1.0.0.exe` from [Releases](https://github.com/MfFischer/Bayanihan_circle/releases)
2. Double-click the `.exe` file
3. Follow the installation wizard:
   - Choose installation directory
   - Create desktop shortcut (recommended)
   - Create Start Menu shortcut (recommended)
4. Click "Finish" to complete installation
5. Launch from desktop shortcut or Start Menu

### Option 2: Build from Source

```bash
# Clone the repository
git clone https://github.com/MfFischer/Bayanihan_circle.git
cd Bayanihan_circle/offline-installer

# Install dependencies
npm install

# Build the installer
npm run electron:build
```

The installer will be created at: `release/Bayanihan Koop-Setup-1.0.0.exe`

### Option 3: Development Mode

```bash
npm install
npm run electron:dev
```

This will:
- Start Vite dev server on http://localhost:5176
- Launch Electron with hot-reload enabled
- Open DevTools automatically

## 🚀 Getting Started

### First Launch

1. **Launch the application** from desktop shortcut or Start Menu
2. **Login with default credentials**:
   - Email: `admin@bayanihankoop.local`
   - Password: `admin123`
3. **Database created automatically** at:
   ```
   %APPDATA%\bayanihan-koop-offline\bayanihan-koop.db
   ```

### Initial Setup

1. **Add Members**
   - Go to Members page
   - Click "Add Member"
   - Fill in member details
   - Click "Save"

2. **Record Contributions**
   - Go to Members page
   - Click on a member
   - Click "Add Contribution"
   - Enter amount and date
   - Click "Save"

3. **Schedule Loans**
   - Go to Admin Dashboard
   - Click "Add Loan"
   - Select member and enter loan details
   - Set scheduled date
   - Click "Schedule"

4. **Approve Loans**
   - Go to Admin Dashboard
   - Find scheduled loan
   - Click "Approve" to activate
   - Loan is now active for payments

5. **Record Payments**
   - Go to Members page
   - Click on member with active loan
   - Click "Pay" on the loan
   - Enter payment amount
   - Click "Record Payment"

## 📊 Dashboard Features

### Admin Dashboard
- **Total Active Funds**: Total contributions - active loans
- **Active Loans**: Count and total amount of active loans
- **Members**: Total members and their status
- **Quick Actions**: Add loan, add contribution, collect fees

### Member Details
- **Share Capital**: Sum of approved contributions
- **Contributions**: List of all contributions with status
- **Loans**: List of all loans with payment history
- **Points**: Member's participation points (if enabled)

### Admin Earnings
- **Total Earnings**: Sum of all membership fees collected
- **Earnings History**: Detailed list of fees collected
- **Membership Fees**: Total fees collected

## 🔧 Configuration

### Group Settings

Access group settings to configure:
- **Monthly Contribution**: Default ₱1,000
- **Interest Rate**: Default 2%
- **Loan Quota**: Required interest to qualify for dividend
- **Max Loan Amount**: Maximum loan size
- **Min Loan Amount**: Minimum loan size
- **Max Loan Term**: Maximum loan duration in months

## 🗄️ Database

### Location

The SQLite database is stored in:
```
%APPDATA%\bayanihan-koop-offline\bayanihan-koop.db
```

### Default Credentials

**First-time login:**
- Email: `admin@bayanihankoop.local`
- Password: `admin123`

⚠️ **IMPORTANT:** Change this password immediately after first login!

### Backup & Restore

**To backup user data:**
1. Close the application
2. Copy the database file from the location above
3. Store in a safe location

**To restore:**
1. Close the application
2. Replace the database file with the backup
3. Restart the application

### Automatic Migrations

Migrations run automatically on startup:
1. Checks database schema
2. Applies any missing columns
3. Fixes CHECK constraints
4. Updates views and triggers
5. Logs migration status to console

No manual migration steps required!

## 📁 Project Structure

```
offline-installer/
├── electron/
│   ├── main.js                 # Electron main process
│   ├── preload.js              # IPC bridge
│   ├── database/
│   │   ├── init.js             # Database initialization
│   │   ├── schema.sql          # SQLite schema
│   │   └── migrations.js       # Database migrations
│   └── ipc/
│       └── database-handlers.js # IPC handlers
├── src/
│   ├── pages/                  # React pages
│   ├── components/             # React components
│   ├── contexts/               # React contexts
│   ├── lib/                    # Utilities
│   └── App.jsx                 # Main app
├── public/                     # Static assets
├── package.json                # Dependencies
├── vite.config.js              # Vite config
└── release/                    # Built installers
```

## 🔧 Configuration

### Build Configuration

Configuration is in `package.json` under the `build` key:

```json
{
  "build": {
    "appId": "com.bayanihankoop.offline",
    "productName": "Bayanihan Koop",
    "win": {
      "target": "nsis",
      "arch": ["x64"]
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true
    }
  }
}
```

### Database Schema

The complete schema is in `electron/database/schema.sql`. It includes:

- **members** - User accounts and profiles
- **groups** - Cooperative groups
- **group_settings** - Group configuration
- **contributions** - Member contributions
- **loans** - Loan applications and tracking
- **loan_payments** - Payment history
- **points** - Points tracking
- **transactions** - General ledger
- **dividends** - Year-end dividends
- **membership_fees** - Fee collection
- **security_logs** - Audit trail

## 🐛 Troubleshooting

### Application Won't Start
- Ensure Windows 10 or later
- Try running as Administrator
- Check that port 5173 is not in use

### Database Errors
- Close all instances of the application
- Delete the database file and restart (creates fresh database)
- Database location: `%APPDATA%\bayanihan-koop-offline\bayanihan-koop.db`

### Installer Won't Run
- Ensure you have admin rights
- Disable antivirus temporarily
- Try downloading again

### Performance Issues
- Close other applications
- Ensure sufficient disk space (>1 GB free)
- Restart the application

### Build Errors
1. Delete `node_modules` and reinstall: `npm install`
2. Clear build cache: `npm run build` then retry
3. Check Node.js version (18+ required)

## 🔒 Security

- **Local Storage**: All data stored locally on your machine
- **No Cloud**: No data sent to external servers
- **Secure Passwords**: Passwords hashed with bcrypt
- **Local Authentication**: Login verified against local database
- **Data Privacy**: Complete control over your data

## 📝 Development Notes

### Adding New Database Tables

1. Update `electron/database/schema.sql`
2. Add handlers in `electron/ipc/database-handlers.js`
3. Add IPC channels in `electron/main.js`
4. Expose in `electron/preload.js`
5. Create frontend API in `src/lib/database.js`

### Testing

```bash
# Development mode with DevTools
npm run electron:dev

# Test production build
npm run pack  # Creates unpacked app in release/
```

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Support

For issues or questions:
1. Check the [Troubleshooting](#-troubleshooting) section
2. Open an issue on [GitHub](https://github.com/MfFischer/Bayanihan_circle/issues)
3. Include error messages and steps to reproduce

## 🙏 Acknowledgments

- Built with Electron and React
- Database powered by SQLite
- UI components from Lucide React
- Styled with TailwindCSS

---

**Made with ❤️ for the Bayanihan community**

