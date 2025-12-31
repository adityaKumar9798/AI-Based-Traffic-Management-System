# 🚦 Indian Traffic Management System

A comprehensive real-time traffic management system for Indian cities with interactive maps, live data visualization, and AI-powered traffic assistance.

## ✨ Features

### 🗺️ **Interactive Map**
- Real-time traffic visualization with Leaflet
- Multiple intersections per city (3-5 per city)
- Color-coded congestion indicators
- Clickable markers with detailed traffic data

### 📊 **Real-Time Data**
- **Live TomTom API Integration** with fallback to simulated data
- **15 Indian Cities**: Bangalore, Delhi, Mumbai, Chennai, Kolkata, Ahmedabad, Patna, Bhopal, Nagpur, Guwahati, Gangtok, Ranchi, and more
- **45-75 Intersections** total with realistic vehicle counts
- **Vehicle Type Breakdown**: Two-wheelers, Auto-rickshaws, Buses
- **Congestion Levels**: Low, Medium, High
- **Wait Times & Status Updates**

### 🤖 **AI Traffic Assistant**
- **Gemini AI-powered chatbot** (with fallback rule-based responses)
- **Voice Support**: Text-to-speech and speech-to-text
- **Bilingual**: English & Hindi support
- **Contextual Responses**: Real data source awareness
- **City-specific Queries**: Ask about any intersection

### 🎯 **Data Sources**
- **Primary**: TomTom Traffic API (real-time)
- **Fallback**: Simulated traffic data
- **Clear Indicators**: Shows "Live Data" vs "Fallback Data"

## 🛠️ Tech Stack

### **Frontend**
- **React 18** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **Lucide React** for icons

### **Mapping**
- **Leaflet** with React-Leaflet
- **TomTom API** for traffic data
- **Custom markers** and popups

### **AI & Voice**
- **Google Gemini API** for chatbot
- **Web Speech API** for voice features
- **Speech Synthesis** for text-to-speech

### **State Management**
- **React Hooks** for local state
- **Real-time updates** with WebSocket simulation
- **Caching** for API responses

## 🚀 Quick Start

### **Prerequisites**
- Node.js 16+
- npm or yarn

### **Installation**

1. **Clone the repository**
```bash
git clone <repository-url>
cd traffic-management-system
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
```

4. **Add your API keys to `.env`**
```env
# TomTom API Key (Required for live traffic data)
VITE_TOMTOM_API_KEY=your_tomtom_api_key_here

# Gemini API Key (Optional - for AI chatbot)
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

### **Getting API Keys**

#### **TomTom API Key**
1. Visit [TomTom Developer Portal](https://developer.tomtom.com/)
2. Sign up for a free account
3. Create a new API key
4. Add it to your `.env` file

#### **Gemini API Key** (Optional)
1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with Google account
3. Click "Create API Key"
4. Add it to your `.env` file

### **Running the App**

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

Open [http://localhost:5173](http://localhost:5173) to view the application.

## 📱 Usage

### **Map Navigation**
- **Zoom/Pan**: Use mouse/touch controls
- **Click Markers**: View intersection details
- **Color Coding**: 
  - 🟢 Green = Low congestion
  - 🟡 Yellow = Medium congestion  
  - 🔴 Red = High congestion

### **Traffic Data**
- **City-wise Sections**: Scroll below map for detailed data
- **Real-time Updates**: Data refreshes every 5 minutes
- **Vehicle Counts**: Total and by type
- **Wait Times**: Current intersection delays

### **AI Assistant**
- **Text Queries**: Type questions about traffic
- **Voice Queries**: Click microphone to speak
- **Sample Questions**:
  - "How's traffic in Bangalore?"
  - "What about MG Road congestion?"
  - "Show me wait times in Delhi"
  - "Tell me about incidents in Mumbai"

## 🏙️ Supported Cities

| City | Intersections | Vehicle Range | Notable Areas |
|------|---------------|---------------|---------------|
| Bangalore | 5 | 60-150 | MG Road, Electronic City, Koramangala |
| Delhi | 5 | 90-225 | Connaught Place, India Gate, Karol Bagh |
| Mumbai | 5 | 80-200 | Marine Drive, Bandra-Worli, Andheri |
| Chennai | 5 | 50-125 | Anna Salai, T Nagar, Mount Road |
| Kolkata | 5 | 56-140 | Park Street, Howrah Bridge, Salt Lake |
| Ahmedabad | 5 | 36-90 | SG Highway, CG Road, Kalupur |
| Patna | 5 | 30-75 | Patna Junction, Gandhi Maidan |
| Bhopal | 5 | 24-60 | MP Nagar, Hoshangabad Road |
| Nagpur | 5 | 28-70 | Sitabuldi, Wardha Road |
| Guwahati | 5 | 20-50 | GS Road, Pan Bazaar |
| Gangtok | 5 | 12-30 | MG Marg, Tadong |
| Ranchi | 5 | 22-55 | Main Road, Ratu Road, Harmu Bazaar |

## 🔄 Data Flow

```
TomTom API → Real-time Traffic → Multiple Intersections → Map + Dashboard
     ↓
Fallback (if API fails) → Simulated Data → Same Display
```

## 🎨 Features Overview

### **Real-Time Updates**
- Automatic data refresh every 5 minutes
- WebSocket simulation for live updates
- Cache management for performance

### **Voice Features**
- Text-to-speech for all responses
- Speech-to-text for voice input
- Indian English female voice
- Language toggle (English/Hindi)

### **Responsive Design**
- Mobile-friendly interface
- Touch gestures support
- Adaptive layouts

### **Error Handling**
- Graceful API fallbacks
- Network error recovery
- User-friendly error messages

## 🛠️ Development

### **Project Structure**
```
src/
├── components/          # React components
│   ├── Dashboard.tsx   # Main dashboard
│   ├── Map.tsx         # Interactive map
│   ├── ChatbotWidget.tsx # AI assistant
│   └── ...
├── services/           # API and business logic
│   ├── trafficAPI.ts   # TomTom API integration
│   ├── realTimeTrafficService.ts # Traffic data service
│   ├── chatbot.ts      # AI chatbot service
│   └── socket.ts       # WebSocket simulation
├── types.ts            # TypeScript definitions
├── data/               # Mock data
└── utils/              # Helper functions
```

### **Available Scripts**

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 🔧 Configuration

### **Environment Variables**

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_TOMTOM_API_KEY` | Yes | TomTom Traffic API key |
| `VITE_GEMINI_API_KEY` | No | Google Gemini API key |

### **API Rate Limits**
- **TomTom**: Free tier includes 2,500 requests/day
- **Gemini**: Free tier includes 60 requests/minute

## 🚨 Troubleshooting

### **Common Issues**

#### **Map Not Loading**
- Check TomTom API key in `.env`
- Verify internet connection
- Check browser console for errors

#### **No Live Data**
- API key missing or invalid
- Rate limit exceeded
- Network connectivity issues

#### **Voice Not Working**
- Browser may not support speech APIs
- Microphone permission denied
- Check browser settings

### **Debug Mode**
Open browser console (F12) to see:
- API request logs
- Data source indicators
- Error messages

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **TomTom** for traffic data API
- **Google** for Gemini AI
- **Leaflet** for mapping library
- **React** for frontend framework

## 📞 Support

For issues and questions:
- Create an issue on GitHub
- Check the troubleshooting section
- Review API documentation

---

**Built with ❤️ for Indian cities** 🇮🇳
