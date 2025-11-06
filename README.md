# Bayanihan Koop - Cooperative Management System

A modern, full-stack business cooperative platform with both **web** and **desktop** versions. Manage members, loans, contributions, and dividends with ease.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)
![Node](https://img.shields.io/badge/node-18+-green.svg)
![React](https://img.shields.io/badge/react-19+-blue.svg)

🌐 **[Live Demo](https://bayanihan-circle.vercel.app/)** | 📱 **[Desktop App](https://github.com/MfFischer/Bayanihan_circle/releases)** | 📖 **[Documentation](#-installation)**

## 🎯 Overview

**Bayanihan Koop** is a comprehensive cooperative management system designed for Filipino savings circles (Bayanihan groups). It supports both online (Supabase-based) and offline (Electron desktop) deployments.

### 🚀 Quick Links

- **🌐 Web App**: [https://bayanihan-circle.vercel.app/](https://bayanihan-circle.vercel.app/) - Live deployment on Vercel
- **💻 Desktop App**: Download from [Releases](https://github.com/MfFischer/Bayanihan_circle/releases) - Windows executable
- **📖 Desktop Docs**: See [offline-installer/README.md](./offline-installer/README.md) for offline app documentation
- **🔧 Development**: See [Installation](#-installation) section below

### ✨ Key Features

**Member Management**
- ✅ Complete member registration and profile management
- ✅ Role-based access (Admin/Member)
- ✅ Member status tracking (active, inactive, suspended)

**Financial Management**
- 💰 Loan system with scheduling, approval, and payment tracking
- 💳 Contribution tracking with status management
- 📊 Real-time dashboard showing active funds and loan status
- 🏆 Quota-based dividend system (auto-calculated at year-end)
- 💵 Membership fee collection and admin earnings tracking

**Advanced Features**
- 📈 Interest-free 30-day rule for loan payments
- 🎯 Configurable group settings (interest rates, quotas, loan limits)
- 📱 Responsive design (desktop, tablet, mobile)
- 🔐 Secure authentication with role-based access control
- 💻 **Desktop App** - Standalone Windows executable for offline use

### 💼 Business Model

- **Annual Contribution**: ₱12,000/year (₱1,000/month)
- **Quota-Based Dividends**: Members who pay ₱5,000+ in loan interest receive full dividend
- **Proportional Dividends**: Members paying less get (Interest Paid ÷ ₱5,000) × Full Dividend
- **Non-Participants**: Get 0% dividend (only capital return)
- **Example**: 100-member group with 80 participants = ₱17,000 payout per participant (₱12,000 capital + ₱5,000 dividend)

## 🏗️ Tech Stack

### Web Application
- **Frontend**: React 19+, Vite 7+, TailwindCSS 3.4+
- **Routing**: React Router 7+
- **Icons**: Lucide React
- **Charts**: Recharts
- **Forms**: React Hook Form
- **Backend**: Supabase (PostgreSQL, Auth, RLS)
- **Database**: PostgreSQL with Row Level Security

### Desktop Application (Offline Installer)
- **Framework**: Electron 28+
- **Database**: SQLite with better-sqlite3
- **Builder**: electron-builder
- **Installer**: NSIS (Windows)
- **Platforms**: Windows (x64)

### Deployment
- **Web**: Vercel (free tier)
- **Backend**: Supabase Cloud (free tier)
- **Desktop**: Standalone Windows executable (.exe)

## 📦 Installation

### Prerequisites

- Node.js 18+ and npm
- Git
- Supabase account (free tier) - for web version only
- Windows 10+ (for desktop version)

### Option 1: Web Application (Online)

#### 1. Clone the Repository

```bash
git clone https://github.com/MfFischer/Bayanihan_circle.git
cd Bayanihan_circle
```

#### 2. Install Dependencies

```bash
npm install
```

#### 3. Setup Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the schema from `supabase-schema.sql`
3. Get your project URL and anon key from Settings > API

#### 4. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### 5. Run the Application

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### Option 2: Desktop Application (Offline)

#### 1. Download the Installer

Download `Bayanihan Koop-Setup-1.0.0.exe` from the [Releases](https://github.com/MfFischer/Bayanihan_circle/releases) page.

#### 2. Run the Installer

Double-click the `.exe` file and follow the installation wizard:
- Choose installation directory
- Create desktop shortcut
- Create Start Menu shortcut

#### 3. Launch the Application

- Click the desktop shortcut or find "Bayanihan Koop" in Start Menu
- Login with default credentials:
  - **Email**: `admin@bayanihankoop.local`
  - **Password**: `admin123`

#### 4. First Time Setup

- The database is automatically created on first run
- Located at: `%APPDATA%\bayanihan-koop-offline\bayanihan-koop.db`
- All migrations run automatically on startup

### Option 3: Desktop Development Mode

```bash
cd offline-installer
npm install
npm run electron:dev
```

## 🚀 Building for Production

### Web Application

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Desktop Application (Windows)

```bash
cd offline-installer

# Build the executable
npm run electron:build
```

The installer will be created at: `offline-installer/release/Bayanihan Koop-Setup-1.0.0.exe`

## 📱 Deployment

### Deploy Web App to Vercel

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel
```

3. Set environment variables in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

### Desktop App Distribution

1. Build the executable (see above)
2. Create a GitHub Release
3. Upload `Bayanihan Koop-Setup-1.0.0.exe` to the release
4. Share the download link with users

**Installation Requirements**:
- Windows 10 or later
- ~500 MB disk space
- No additional software needed (all dependencies bundled)

## 🎮 Usage

### For Members

1. **Register** - Create your account (web version)
2. **Contribute** - Make monthly contributions (₱1,000 standard)
3. **Borrow** - Apply for loans to earn participation points
4. **Track** - Monitor your points and estimated dividends
5. **Earn** - Receive year-end dividends based on quota system

### For Administrators

**Dashboard**
- View total active funds and loan status
- Monitor member contributions and loan payments
- Track admin earnings from membership fees

**Member Management**
- Add/edit/delete members
- View member details (contributions, loans, share capital)
- Collect membership fees

**Loan Management**
- Schedule loans for future approval
- Approve/reject loan applications
- Track loan payments and balances
- View payment history per loan

**Contribution Management**
- Record member contributions
- Track contribution status (pending/approved/rejected)
- View contribution history

**Financial Tracking**
- View admin earnings from membership fees
- Monitor group settings (interest rates, quotas, loan limits)
- Track active funds and available loans

## 🔒 Security

### Web Version
- Row Level Security (RLS) enabled on all tables
- Secure authentication with Supabase Auth
- Environment variables for sensitive data
- HTTPS enforced in production
- Input validation and sanitization
- JWT token-based authentication

### Desktop Version
- SQLite database stored locally in user's AppData
- No network communication required
- Secure password hashing
- Local authentication only
- Database migrations run automatically

## 📊 Database Schema

### Web Version
See `supabase-schema.sql` for the complete PostgreSQL schema:
- Members, Contributions, Loans, Loan Payments
- Points, Transactions, Dividends
- Group Settings, Membership Fees
- Security Logs

### Desktop Version
See `offline-installer/electron/database/schema.sql` for SQLite schema:
- Same tables as web version
- Optimized for local SQLite
- Automatic migrations on startup
- Views for calculated fields (share capital, active funds)

## 📁 Project Structure

```
bayanihan-circle/
├── src/                          # Web app source code
│   ├── pages/                    # React pages
│   ├── components/               # Reusable components
│   ├── contexts/                 # React contexts
│   ├── lib/                      # Utilities and helpers
│   └── App.jsx                   # Main app component
├── offline-installer/            # Desktop app (Electron)
│   ├── electron/                 # Electron main process
│   │   ├── main.js              # Electron entry point
│   │   ├── preload.js           # IPC bridge
│   │   ├── database/            # SQLite schema & migrations
│   │   └── ipc/                 # IPC handlers
│   ├── src/                     # React components for desktop
│   ├── package.json             # Desktop app dependencies
│   └── release/                 # Built installers
├── migrations/                   # Supabase migrations
├── supabase-schema.sql          # PostgreSQL schema
├── package.json                 # Web app dependencies
└── README.md                    # This file
```

## 🔧 Available Scripts

### Web Application
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Desktop Application
```bash
cd offline-installer
npm run electron:dev      # Start dev with Electron
npm run electron:build    # Build Windows installer
npm run pack             # Pack without installer
```

## 🐛 Troubleshooting

### Web Version
- **Port already in use**: Change port in `vite.config.js`
- **Supabase connection error**: Check `.env` variables
- **RLS policy errors**: Verify Supabase RLS policies are enabled

### Desktop Version
- **Database locked**: Close all instances and restart
- **Installer won't run**: Ensure Windows 10+ and admin rights
- **Missing dependencies**: Run `npm install` in `offline-installer/`

## 📝 Environment Variables

### Web Version (.env)
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Desktop Version
No environment variables needed - uses local SQLite database

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with React and Vite
- Powered by Supabase and Electron
- Icons by Lucide React
- Styled with TailwindCSS
- Database by SQLite and PostgreSQL

---

**Made with ❤️ for the Bayanihan community**

