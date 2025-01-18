# Bayanihan Savings Circle

A modern, full-stack business cooperative platform where members actively participate by borrowing and lending to maximize returns.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)

## 🎯 Overview

**This is NOT a savings account** - this is a **BUSINESS COOPERATIVE** where your money WORKS.

### Key Features

- ✅ **Member Management** - Complete member registration and profile management
- 💰 **Loan System** - Apply for loans, track payments, and manage borrowing
- 💳 **Contribution Tracking** - Record and monitor monthly contributions
- 🏆 **Point System** - Automated point calculation based on participation
- 📊 **Dashboard Analytics** - Real-time insights into your cooperative activity
- 🔐 **Secure Authentication** - Bank-grade security with Supabase
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- 💻 **Desktop App** - Self-executable software for Windows, Mac, and Linux

### Business Model

- **Target Member**: Contributes ₱1,000/month, borrows 2-3x/year, pays on time
- **Point-based Dividends**: More participation = higher returns
- **Participation Bonus**: +100 points for borrowing at least once/year
- **Non-participation Penalty**: -100 points for never borrowing

## 🏗️ Tech Stack

### Web Application
- **Frontend**: React 18.2+, Vite 5.0+, TailwindCSS 3.4+
- **Routing**: React Router 6+
- **Icons**: Lucide React
- **Charts**: Recharts
- **Forms**: React Hook Form
- **Backend**: Supabase (PostgreSQL, Auth, RLS)

### Desktop Application
- **Framework**: Electron
- **Builder**: electron-builder
- **Platforms**: Windows, macOS, Linux

### Deployment
- **Web**: Vercel (free tier)
- **Backend**: Supabase Cloud (free tier)
- **Desktop**: Standalone installers

## 📦 Installation

### Prerequisites

- Node.js 18+ and npm
- Git
- Supabase account (free tier)

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/bayanihan-savings-circle.git
cd bayanihan-savings-circle
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the schema from `supabase-schema.sql`
3. Get your project URL and anon key from Settings > API

### 4. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 5. Run the Application

#### Web Development Mode
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

#### Desktop Development Mode
```bash
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

### Desktop Application

```bash
# Build for current platform
npm run electron:build

# Build for Windows
npm run electron:build:win

# Build for macOS
npm run electron:build:mac

# Build for Linux
npm run electron:build:linux
```

Installers will be created in the `release/` directory.

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

3. Set environment variables in Vercel dashboard

### Desktop App Distribution

After building, distribute the installers from `release/`:

- **Windows**: `.exe` installer or portable `.exe`
- **macOS**: `.dmg` or `.zip`
- **Linux**: `.AppImage` or `.deb`

## 🎮 Usage

### For Members

1. **Register** - Create your account
2. **Contribute** - Make monthly contributions (₱1,000 standard)
3. **Borrow** - Apply for loans to earn participation points
4. **Track** - Monitor your points and estimated dividends
5. **Earn** - Receive year-end dividends based on your points

### For Administrators

1. **Manage Members** - Approve registrations, view member details
2. **Process Loans** - Approve/reject loan applications
3. **Confirm Contributions** - Verify and confirm payments
4. **Calculate Dividends** - Run year-end dividend calculations
5. **Generate Reports** - Export financial reports

## 🔒 Security

- Row Level Security (RLS) enabled on all tables
- Secure authentication with Supabase Auth
- Environment variables for sensitive data
- HTTPS enforced in production
- Input validation and sanitization

## 📊 Database Schema

See `supabase-schema.sql` for the complete database structure including:

- Members
- Contributions
- Loans
- Loan Payments
- Points
- Transactions
- Dividends
- Settings

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support, email support@bayanihancircle.com or open an issue on GitHub.

## 🙏 Acknowledgments

- Built with React and Vite
- Powered by Supabase
- Icons by Lucide
- Styled with TailwindCSS

---

**Made with ❤️ for the Bayanihan community**

