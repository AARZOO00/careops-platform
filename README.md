
# CareOps - Unified Operations Platform

## 🌐 Live Demo

**Frontend:** [https://frontend-snowy-xi-43.vercel.app](https://frontend-snowy-xi-43.vercel.app)

### Demo Credentials
```
Email: admin@demo.com
Password: demo123456
```

## ✨ Features

### 📅 Booking Management
- Calendar and list view with drag-and-drop
- Automated email/SMS reminders
- Conflict detection and availability checking
- Customer history tracking
- Status management (pending, confirmed, completed, cancelled)

### 💬 Unified Inbox
- Centralized communication hub
- Email integration (SendGrid)
- SMS messaging (Twilio)
- Form submissions tracking
- Real-time notifications
- Quick reply templates

### 📦 Inventory Tracking
- Real-time stock level monitoring
- Automated low-stock alerts
- Usage history and analytics
- Bulk import/export (CSV)
- Product categorization
- Reorder recommendations

### 📋 Custom Forms
- Drag-and-drop form builder
- Shareable public links
- Submission tracking and analytics
- Auto-responses
- File upload support
- Conditional logic

### 🤖 AI Assistant
- Natural language queries
- Business insights and analytics
- Automated report generation
- Predictive analytics
- Smart search across all data

### 👥 Team Management
- Role-based access control
- Activity logs
- Team performance metrics
- Permission management

### 📊 Analytics Dashboard
- Real-time metrics
- Revenue tracking
- Customer analytics
- Booking trends
- Inventory insights
- Customizable widgets

## 🛠️ Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Headless UI, Hero Icons
- **Animations:** Framer Motion
- **State Management:** Zustand
- **Data Fetching:** React Query (TanStack Query)
- **Form Handling:** React Hook Form + Zod
- **Notifications:** React Hot Toast

### Backend
- **Framework:** FastAPI
- **Language:** Python 3.11+
- **ORM:** SQLAlchemy
- **Validation:** Pydantic
- **Authentication:** JWT + bcrypt
- **Database:** PostgreSQL / SQLite

### Integrations
- **Email:** SendGrid API
- **SMS:** Twilio API
- **AI:** Google Gemini API

### Deployment
- **Frontend:** Vercel
- **Backend:** Railway (ready for deployment)
- **Database:** PostgreSQL (production) / SQLite (development)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Python 3.11+
- Git

### Installation

#### 1. Clone the repository
```bash
git clone https://github.com/AARZOO00/careops-platform.git
cd careops-platform
```

#### 2. Backend Setup
```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env with your configuration

# Create demo user
python create_demo_user.py

# Start backend server
uvicorn app.main:app --reload --port 8000
```

Backend will run at: `http://localhost:8000`

#### 3. Frontend Setup
```bash
# Navigate to frontend (in new terminal)
cd frontend

# Install dependencies
npm install

# Create .env.local file
cp .env.example .env.local
# Edit .env.local with your configuration

# Start development server
npm run dev
```

Frontend will run at: `http://localhost:3001`

### Environment Variables

#### Backend (.env)
```env
DATABASE_URL=sqlite:///./careops.db
SECRET_KEY=your-secret-key-here-change-in-production
DEBUG=True

# Optional API Keys
SENDGRID_API_KEY=your-sendgrid-key
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_FROM_NUMBER=+1234567890
GEMINI_API_KEY=your-gemini-key
```

#### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

## 📸 Screenshots

### Dashboard
![Dashboard](screenshots/dashboard.png)

### Booking Management
![Bookings](screenshots/bookings.png)

### Unified Inbox
![Inbox](screenshots/inbox.png)

### Inventory Tracking
![Inventory](screenshots/inventory.png)

## 🏗️ Project Structure
```
careops-platform/
├── backend/
│   ├── app/
│   │   ├── models/          # Database models
│   │   ├── routes/          # API endpoints
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Helper functions
│   │   ├── database.py      # Database config
│   │   └── main.py          # FastAPI app
│   ├── requirements.txt
│   └── create_demo_user.py
│
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js pages
│   │   ├── components/      # React components
│   │   ├── lib/             # Utilities
│   │   ├── store/           # State management
│   │   └── styles/          # Global styles
│   ├── package.json
│   └── next.config.js
│
└── README.md
```

## 🎯 Key Features Implementation

### Authentication
- JWT-based authentication
- Secure password hashing with bcrypt
- Token refresh mechanism
- Role-based access control

### Real-time Updates
- WebSocket support (planned)
- Optimistic UI updates
- Background sync

### Responsive Design
- Mobile-first approach
- Adaptive layouts
- Touch-friendly interface
- Progressive Web App ready

## 🔒 Security

- Environment variable management
- SQL injection prevention (SQLAlchemy ORM)
- XSS protection
- CSRF protection
- Rate limiting (planned)
- Input validation (Pydantic/Zod)
- Secure password hashing

## 🧪 Testing
```bash
# Backend tests (planned)
cd backend
pytest

# Frontend tests (planned)
cd frontend
npm test
```

## 📦 Deployment

### Frontend (Vercel)
```bash
cd frontend
vercel --prod
```

### Backend (Railway)
1. Connect GitHub repository
2. Set environment variables
3. Deploy automatically on push

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Aarzoo**

- GitHub: [@AARZOO00](https://github.com/AARZOO00)
- LinkedIn: [Your LinkedIn Profile](https://linkedin.com/in/yourprofile)
- Email: your.email@example.com

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- FastAPI community for excellent documentation
- Tailwind CSS for beautiful utilities
- Vercel for seamless deployment

## 📊 Project Stats

- **Total Lines of Code:** 15,000+
- **Components:** 50+
- **API Endpoints:** 30+
- **Database Tables:** 10+
- **Development Time:** 4 weeks

## 🗺️ Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced analytics with charts
- [ ] Payment integration (Stripe)
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Email templates editor
- [ ] Calendar sync (Google Calendar, Outlook)
- [ ] Export to PDF/Excel
- [ ] Automated backup system
- [ ] Multi-tenant support

## 📞 Support

For support, email your.email@example.com or open an issue in the GitHub repository.

---

⭐ If you found this project helpful, please give it a star!

Made with ❤️ by Aarzoo
