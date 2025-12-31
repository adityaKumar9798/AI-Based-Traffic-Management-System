import { GoogleGenerativeAI } from '@google/generative-ai';
import { Intersection } from '../types';

export class TrafficChatbot {
  private model: any = null;
  private chat: any = null;
  private fallbackMode = true;

  constructor(private trafficData: Intersection[]) {
    this.initializeChat();
  }

  private async initializeChat() {
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      
      if (!apiKey || apiKey.trim() === '' || apiKey === 'your_gemini_api_key_here') {
        console.warn('Gemini API key not provided - running in fallback mode');
        return;
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      this.model = genAI.getGenerativeModel({ model: "gemini-pro" });
      
      this.chat = await this.model.startChat({
        history: [
          {
            role: "user",
            parts: [{ text: "You are a friendly and conversational traffic assistant for Indian cities. Your name is 'Traffic Buddy'. You should provide real-time information about traffic conditions, congestion levels, and wait times in a natural, human-like way. Use conversational language, show empathy for traffic situations, and occasionally add helpful tips. Always be friendly and provide specific details from the traffic data provided. Use phrases like 'I can help you with that!', 'Let me check the current traffic for you...', 'Based on the latest data...', 'I'd recommend...' etc. IMPORTANT: Always indicate whether you're using live TomTom data or simulated data in your responses." }],
          },
          {
            role: "model",
            parts: [{ text: "Hello! I'm Traffic Buddy, your friendly traffic assistant for Indian cities. I'm here to help you navigate through traffic with real-time updates and helpful advice. Just ask me anything about traffic conditions!" }],
          },
        ],
      });

      this.fallbackMode = false;
      console.log('Gemini AI initialized successfully');
    } catch (error) {
      console.warn('Chat initialization failed - running in fallback mode:', error);
    }
  }

  private formatTrafficData(intersections: Intersection[]) {
    return intersections.map(intersection => ({
      location: intersection.name,
      congestion: intersection.trafficData.congestionLevel,
      waitTime: `${intersection.trafficData.waitTime} seconds`,
      vehicles: {
        total: intersection.trafficData.vehicleCount,
        twoWheelers: intersection.trafficData.twoWheelers,
        autoRickshaws: intersection.trafficData.autoRickshaws,
        buses: intersection.trafficData.buses
      },
      status: intersection.trafficData.status,
      lastUpdated: new Date(intersection.trafficData.timestamp).toLocaleTimeString()
    }));
  }

  private generateFallbackResponse(message: string): string {
    const formattedData = this.formatTrafficData(this.trafficData);
    const loweredMessage = message.toLowerCase();
    
    // City/area mapping for better location detection
    const cityAreaMap: { [key: string]: string[] } = {
      'bangalore': ['mg road & brigade road', 'electronic city junction', 'koramangala crossing', 'indiranagar circle', 'whitefield square'],
      'bengaluru': ['mg road & brigade road', 'electronic city junction', 'koramangala crossing', 'indiranagar circle', 'whitefield square'],
      'delhi': ['connaught place circle', 'india gate junction', 'karol bagh crossing', 'dwarka intersection', 'lajpat nagar square'],
      'new delhi': ['connaught place circle', 'india gate junction', 'karol bagh crossing', 'dwarka intersection', 'lajpat nagar square'],
      'mumbai': ['marine drive junction', 'bandra-worli link', 'andheri crossing', 'sion circle', 'cst junction'],
      'chennai': ['anna salai junction', 't nagar crossing', 'mount road circle', 'besant nagar square', 'guindy intersection'],
      'kolkata': ['park street crossing', 'howrah bridge junction', 'salt lake circle', 'gariahat crossing', 'dum dum square'],
      'ahmedabad': ['sg highway crossing', 'cg road junction', 'kalupur circle', 'navrangpura square', 'maninagar intersection'],
      'patna': ['patna junction', 'gandhi maidan crossing', 'kankarbagh circle', 'boring road square', 'ashok rajpath junction'],
      'bhopal': ['mp nagar zone 1', 'hoshangabad road crossing', 'bhel junction', 'new market square', 'arera colony circle'],
      'nagpur': ['sitabuldi main road', 'wardha road junction', 'ramdaspeth crossing', 'sadar square', 'laxmi nagar intersection'],
      'guwahati': ['gs road junction', 'pan bazaar crossing', 'dispur circle', 'zoo road square', 'fancy bazaar intersection'],
      'gangtok': ['mg marg crossing', 'tadong junction', 'rumtek square', 'deorali circle', 'gangtok tok intersection'],
      'ranchi': ['main road junction', 'ratu road crossing', 'harmu bazaar', 'kanke thana square', 'doranda circle'],
      'jharkhand': ['main road junction', 'ratu road crossing', 'harmu bazaar', 'kanke thana square', 'doranda circle']
    };
    
    // Friendly greetings
    if (loweredMessage.includes('hello') || loweredMessage.includes('hi') || loweredMessage.includes('hey')) {
      return `Hello there! I'm Traffic Buddy! 🚗\n\nI'm here to help you with real-time traffic information across the city. I can tell you about:\n• Current traffic conditions at specific locations\n• Congestion levels and wait times\n• Vehicle counts\n• Any active incidents\n\nJust ask me something like "How's traffic at [location]?" or "What are the current congestion levels?"`;
    }
    
    // Check for city-specific queries first
    let relevantLocations: string[] = [];
    for (const [city, locations] of Object.entries(cityAreaMap)) {
      if (loweredMessage.includes(city)) {
        relevantLocations = relevantLocations.concat(locations);
      }
    }
    
    // Filter data based on detected locations
    let filteredData = formattedData;
    if (relevantLocations.length > 0) {
      filteredData = formattedData.filter(data => 
        relevantLocations.some(location => 
          data.location.toLowerCase().includes(location.toLowerCase())
        )
      );
    }
    
    // Handle location-specific queries with conversational tone
    for (const data of filteredData) {
      if (loweredMessage.includes(data.location.toLowerCase())) {
        const congestionEmoji = data.congestion === 'High' ? '🔴' : data.congestion === 'Medium' ? '🟡' : '🟢';
        const waitTimeAdvice = parseInt(data.waitTime) > 60 
          ? "That's quite a wait! You might want to consider an alternative route if possible."
          : parseInt(data.waitTime) > 30 
          ? "Moderate wait time. Should be manageable!"
          : "Great! The wait time is quite reasonable.";
          
        const dataSource = this.trafficData.length > 20 ? "Live TomTom Data" : "Simulated Data";
        
        return `Let me check the traffic at ${data.location} for you! ${congestionEmoji}\n\n**Current Situation (${dataSource}):**\n• **Congestion Level:** ${data.congestion}\n• **Wait Time:** ${data.waitTime}\n• **Total Vehicles:** ${data.vehicles.total}\n  - Two Wheelers: ${data.vehicles.twoWheelers}\n  - Auto Rickshaws: ${data.vehicles.autoRickshaws}\n  - Buses: ${data.vehicles.buses}\n• **Status:** ${data.status}\n\n${waitTimeAdvice}\n\n*Last updated: ${data.lastUpdated}*`;
      }
    }

    // Handle congestion queries with location filtering
    if (loweredMessage.includes('congestion') || loweredMessage.includes('traffic')) {
      const congestionLevels = {
        High: filteredData.filter(d => d.congestion === 'High'),
        Medium: filteredData.filter(d => d.congestion === 'Medium'),
        Low: filteredData.filter(d => d.congestion === 'Low')
      };

      if (filteredData.length < formattedData.length) {
        // City-specific query
        const dataSource = this.trafficData.length > 20 ? "Live TomTom Data" : "Simulated Data";
        let response = `Here's the traffic situation for the areas you asked about! 🚦 (${dataSource})\n\n`;
        
        if (congestionLevels.High.length > 0) {
          response += '🔴 **Areas with Heavy Traffic:**\n' + 
            congestionLevels.High.map(area => 
              `• ${area.location} - ${area.waitTime} wait time (You might want to avoid this area for now!)`
            ).join('\n') + '\n\n';
        }
        
        if (congestionLevels.Medium.length > 0) {
          response += '🟡 **Moderate Traffic Areas:**\n' + 
            congestionLevels.Medium.map(area => 
              `• ${area.location} - ${area.waitTime} wait time (Should be manageable)`
            ).join('\n') + '\n\n';
        }
        
        if (congestionLevels.Low.length > 0) {
          response += '🟢 **Clear Roads:**\n' + 
            congestionLevels.Low.map(area => 
              `• ${area.location} - ${area.waitTime} wait time (Smooth sailing here!)`
            ).join('\n') + '\n\n';
        }

        response += 'Need more details about any specific area? Just ask!';
        return response;
      }

      // General query (original logic)
      const dataSource = this.trafficData.length > 20 ? "Live TomTom Data" : "Simulated Data";
      let response = `Here's what I'm seeing on the roads right now! 🚦 (${dataSource})\n\n`;
      
      if (congestionLevels.High.length > 0) {
        response += '🔴 **Areas with Heavy Traffic:**\n' + 
          congestionLevels.High.map(area => 
            `• ${area.location} - ${area.waitTime} wait time (You might want to avoid this area for now!)`
          ).join('\n') + '\n\n';
      }
      
      if (congestionLevels.Medium.length > 0) {
        response += '🟡 **Moderate Traffic Areas:**\n' + 
          congestionLevels.Medium.map(area => 
            `• ${area.location} - ${area.waitTime} wait time (Should be manageable)`
          ).join('\n') + '\n\n';
      }
      
      if (congestionLevels.Low.length > 0) {
        response += '🟢 **Clear Roads:**\n' + 
          congestionLevels.Low.map(area => 
            `• ${area.location} - ${area.waitTime} wait time (Smooth sailing here!)`
          ).join('\n') + '\n\n';
      }

      response += 'Need more details about any specific area? Just ask!';
      return response;
    }

    // Handle wait time queries with location filtering
    if (loweredMessage.includes('wait') || loweredMessage.includes('time')) {
      const avgWaitTime = Math.round(
        filteredData.reduce((acc, curr) => 
          acc + parseInt(curr.waitTime), 0) / filteredData.length
      );
      
      const sortedByWait = [...filteredData].sort((a, b) => 
        parseInt(b.waitTime) - parseInt(a.waitTime)
      );

      const timeAdvice = avgWaitTime > 60 
        ? "Ouch! Traffic is quite heavy right now. Consider leaving earlier or taking alternative routes."
        : avgWaitTime > 30 
        ? "Moderate traffic conditions. Plan accordingly!"
        : "Great! Traffic is flowing smoothly today.";

      if (filteredData.length < formattedData.length) {
        // City-specific query
        return `Let me check the wait times for the areas you asked about! ⏰\n\n**Average Wait Time:** ${avgWaitTime} seconds\n\n${timeAdvice}\n\n**Wait Times:**\n${sortedByWait.map(location => 
  `• ${location.location}: ${location.waitTime}`
).join('\n')}\n\nWant to know more about any specific location?`;
      }

      // General query (original logic)
      return `Let me check the wait times for you! ⏰\n\n**Average Wait Time:** ${avgWaitTime} seconds\n\n${timeAdvice}\n\n**Longest Wait Times:**\n${sortedByWait.slice(0, 3).map(location => 
  `• ${location.location}: ${location.waitTime} (Maybe avoid this for now)`
).join('\n')}\n\n**Shortest Wait Times:**\n${sortedByWait.slice(-3).reverse().map(location => 
  `• ${location.location}: ${location.waitTime} (Good to go!)`
).join('\n')}\n\nWant to know more about any specific location?`;
    }

    // Handle vehicle count queries with location filtering
    if (loweredMessage.includes('vehicle') || loweredMessage.includes('count')) {
      const totalVehicles = filteredData.reduce((acc, curr) => 
        acc + curr.vehicles.total, 0
      );
      
      const totalTwoWheelers = filteredData.reduce((acc, curr) => 
        acc + curr.vehicles.twoWheelers, 0
      );
      
      const totalAutoRickshaws = filteredData.reduce((acc, curr) => 
        acc + curr.vehicles.autoRickshaws, 0
      );
      
      const totalBuses = filteredData.reduce((acc, curr) => 
        acc + curr.vehicles.buses, 0
      );

      const vehicleInsight = totalVehicles > 500 
        ? "Wow! That's quite a lot of vehicles on the road today. Drive safely!"
        : totalVehicles > 300 
        ? "Moderate traffic volume today."
        : "Relatively light traffic today - good driving conditions!";

      if (filteredData.length < formattedData.length) {
        // City-specific query
        return `Let me crunch those vehicle numbers for the areas you asked about! 🚗🏍️🚌\n\n**Total Vehicles:** ${totalVehicles}\n\n**Breakdown:**\n• Two Wheelers: ${totalTwoWheelers}\n• Auto Rickshaws: ${totalAutoRickshaws}\n• Buses: ${totalBuses}\n\n${vehicleInsight}\n\n**Vehicle Count by Location:**\n${filteredData.map(location => `• ${location.location}: ${location.vehicles.total} vehicles`).join('\n')}\n\nNeed details about any specific intersection?`;
      }

      // General query (original logic)
      return `Let me crunch those vehicle numbers for you! 🚗🏍️🚌\n\n**Total Vehicles on Road:** ${totalVehicles}\n\n**Breakdown:**\n• Two Wheelers: ${totalTwoWheelers} (Most popular choice!)\n• Auto Rickshaws: ${totalAutoRickshaws}\n• Buses: ${totalBuses}\n\n${vehicleInsight}\n\n**Busiest Intersections Right Now:**\n${[...formattedData]
  .sort((a, b) => b.vehicles.total - a.vehicles.total)
  .slice(0, 3)
  .map(location => `• ${location.location}: ${location.vehicles.total} vehicles`)
  .join('\n')}\n\nNeed details about any specific intersection?`;
    }

    // Handle status/incident queries with location filtering
    if (loweredMessage.includes('status') || loweredMessage.includes('incident')) {
      const incidents = filteredData.filter(d => d.status !== 'Normal');
      
      if (incidents.length > 0) {
        if (filteredData.length < formattedData.length) {
          // City-specific query
          return `I found some active incidents in the areas you asked about! ⚠️\n\n${incidents.map(incident => 
    `• **${incident.location}**\n  - Status: ${incident.status}\n  - Congestion: ${incident.congestion}\n  - Wait Time: ${incident.waitTime}\n  - Please drive carefully in this area!`
  ).join('\n\n')}\n\nStay safe out there! Consider alternative routes if possible.`;
        }
        
        // General query
        return `I've found some active incidents that you should be aware of! ⚠️\n\n${incidents.map(incident => 
    `• **${incident.location}**\n  - Status: ${incident.status}\n  - Congestion: ${incident.congestion}\n  - Wait Time: ${incident.waitTime}\n  - Please drive carefully in this area!`
  ).join('\n\n')}\n\nStay safe out there! Consider alternative routes if possible.`;
      }
      
      if (filteredData.length < formattedData.length) {
        // City-specific query with no incidents
        return `Great news! 🎉 No active incidents reported in the areas you asked about. The roads are looking good there!`;
      }
      
      // General query with no incidents
      return `Great news! 🎉 No active incidents reported right now. All intersections are operating normally. The roads are looking good!`;
    }

    // Default friendly response with location-aware overview
    const avgWait = Math.round(filteredData.reduce((acc, curr) => acc + parseInt(curr.waitTime), 0) / filteredData.length);
    const highCongestion = filteredData.filter(d => d.congestion === 'High').length;
    const incidents = filteredData.filter(d => d.status !== 'Normal').length;
    
    const overallStatus = highCongestion > 2 
      ? "Traffic is quite heavy right now, so plan accordingly!"
      : highCongestion > 0 
      ? "Some areas are experiencing moderate traffic."
      : "Great! Traffic is flowing smoothly across the city!";

    if (filteredData.length < formattedData.length) {
      // City-specific default response
      return `Hey there! I'm Traffic Buddy, and I'm here to help you navigate the roads! 🚦\n\n**Here's what I'm seeing for the areas you asked about:**\n• I'm monitoring ${filteredData.length} intersections in those areas\n• ${highCongestion} areas are experiencing heavy traffic\n• ${incidents} active incidents to be aware of\n• Average wait time: ${avgWait} seconds\n\n${overallStatus}\n\n**I can help you with:**\n• "How's traffic at [location]?"\n• "What are the congestion levels?"\n• "Tell me about wait times"\n• "How many vehicles are on the road?"\n• "Are there any incidents?"\n\nJust ask me anything about traffic! 😊`;
    }

    // General default response (original logic)
    return `Hey there! I'm Traffic Buddy, and I'm here to help you navigate the roads! 🚦\n\n**Here's what I'm seeing right now:**\n• I'm monitoring ${formattedData.length} intersections across the city\n• ${highCongestion} areas are experiencing heavy traffic\n• ${incidents} active incidents to be aware of\n• Average wait time: ${avgWait} seconds\n\n${overallStatus}\n\n**I can help you with:**\n• "How's traffic at [location]?"\n• "What are the congestion levels?"\n• "Tell me about wait times"\n• "How many vehicles are on the road?"\n• "Are there any incidents?"\n\nJust ask me anything about traffic! 😊`;
  }

  private getHindiResponse(message: string, formattedData: any[]): string {
    const loweredMessage = message.toLowerCase();
    
    // Friendly Hindi greetings
    if (loweredMessage.includes('नमस्ते') || loweredMessage.includes('हाय') || loweredMessage.includes('हेलो')) {
      return `नमस्ते! मैं आपका ट्रैफिक बड्डी हूं! 🚗\n\nमैं आपको शहर में रीयल-टाइम ट्रैफिक जानकारी देने में मदद कर सकता हूं। मैं आपको बता सकता हूं:\n• विशिष्ट स्थानों पर वर्तमान ट्रैफिक स्थिति\n• भीड़ के स्तर और प्रतीक्षा समय\n• वाहनों की गिनती\n• कोई भी सक्रिय घटनाएं\n\nबस मुझसे पूछें जैसे "[स्थान] पर ट्रैफिक कैसा है?" या "वर्तमान भीड़ के स्तर क्या हैं?"`;
    }
    
    // Location specific queries with friendly Hindi
    for (const data of formattedData) {
      if (loweredMessage.includes(data.location.toLowerCase())) {
        const congestionEmoji = data.congestion === 'High' ? '🔴' : data.congestion === 'Medium' ? '🟡' : '🟢';
        const waitTimeAdvice = parseInt(data.waitTime) > 60 
          ? "यह काफी इंतजार है! अगर संभव हो तो वैकल्पिक मार्ग पर विचार करें।"
          : parseInt(data.waitTime) > 30 
          ? "मध्यम प्रतीक्षा समय। प्रबंधन योग्य होना चाहिए!"
          : "बहुत बढ़िया! प्रतीक्षा समय काफी उचित है।";
          
        return `मैं आपके लिए ${data.location} पर ट्रैफिक जांचता हूं! ${congestionEmoji}\n\n**वर्तमान स्थिति:**\n• **भीड़ का स्तर:** ${this.translateCongestion(data.congestion)}\n• **प्रतीक्षा समय:** ${data.waitTime}\n• **कुल वाहन:** ${data.vehicles.total}\n  - दोपहिया: ${data.vehicles.twoWheelers}\n  - ऑटो रिक्शा: ${data.vehicles.autoRickshaws}\n  - बसें: ${data.vehicles.buses}\n• **स्थिति:** ${this.translateStatus(data.status)}\n\n${waitTimeAdvice}\n\n*अंतिम अपडेट: ${data.lastUpdated}*`;
      }
    }

    // Congestion queries in Hindi
    if (loweredMessage.includes('भीड़') || loweredMessage.includes('ट्रैफिक')) {
      const congestionLevels = {
        High: formattedData.filter(d => d.congestion === 'High'),
        Medium: formattedData.filter(d => d.congestion === 'Medium'),
        Low: formattedData.filter(d => d.congestion === 'Low')
      };

      let response = "मैं अभी सड़कों पर क्या देख रहा हूं! 🚦\n\n";
      
      if (congestionLevels.High.length > 0) {
        response += '🔴 **भारी ट्रैफिक वाले क्षेत्र:**\n' + 
          congestionLevels.High.map(area => 
            `• ${area.location} - ${area.waitTime} प्रतीक्षा समय (अभी इस क्षेत्र से बचना बेहतर हो सकता है!)`
          ).join('\n') + '\n\n';
      }
      
      if (congestionLevels.Medium.length > 0) {
        response += '🟡 **मध्यम ट्रैफिक वाले क्षेत्र:**\n' + 
          congestionLevels.Medium.map(area => 
            `• ${area.location} - ${area.waitTime} प्रतीक्षा समय (प्रबंधन योग्य)`
          ).join('\n') + '\n\n';
      }
      
      if (congestionLevels.Low.length > 0) {
        response += '🟢 **साफ सड़कें:**\n' + 
          congestionLevels.Low.map(area => 
            `• ${area.location} - ${area.waitTime} प्रतीक्षा समय (यहां सुचारू रूप से चलें!)`
          ).join('\n') + '\n\n';
      }

      response += 'किसी विशिष्ट क्षेत्र के बारे में और जानकारी चाहिए? बस पूछें!';
      return response;
    }

    // Default Hindi response with friendly tone
    const avgWait = Math.round(formattedData.reduce((acc, curr) => acc + parseInt(curr.waitTime), 0) / formattedData.length);
    const highCongestion = formattedData.filter(d => d.congestion === 'High').length;
    const incidents = formattedData.filter(d => d.status !== 'Normal').length;
    
    const overallStatus = highCongestion > 2 
      ? "ट्रैफिक अभी काफी भारी है, इसलिए तदनुसार योजना बनाएं!"
      : highCongestion > 0 
      ? "कुछ क्षेत्रों में मध्यम ट्रैफिक का अनुभव हो रहा है।"
      : "बहुत बढ़िया! शहर भर में ट्रैफिक सुचारू रूप से चल रहा है!";

    return `नमस्ते! मैं ट्रैफिक बड्डी हूं, और मैं आपको सड़कों पर नेविगेट करने में मदद करने यहां हूं! 🚦\n\n**मैं अभी क्या देख रहा हूं:**\n• मैं शहर भर में ${formattedData.length} चौराहों पर नजर रख रहा हूं\n• ${highCongestion} क्षेत्र भारी ट्रैफिक का अनुभव कर रहे हैं\n• ${incidents} सक्रिय घटनाएं जिनके बारे में जानना जरूरी है\n• औसत प्रतीक्षा समय: ${avgWait} सेकंड\n\n${overallStatus}\n\n**मैं आपकी मदद कर सकता हूं:**\n• "[स्थान] पर ट्रैफिक कैसा है?"\n• "भीड़ के स्तर क्या हैं?"\n• "प्रतीक्षा समय के बारे में बताएं"\n• "सड़क पर कितने वाहन हैं?"\n• "कोई घटनाएं हैं?"\n\nबस ट्रैफिक के बारे में कुछ भी पूछें! 😊`;
  }

  private translateCongestion(level: string): string {
    const translations = {
      'High': 'अधिक',
      'Medium': 'मध्यम',
      'Low': 'कम'
    };
    return translations[level as keyof typeof translations] || level;
  }

  private translateStatus(status: string): string {
    const translations = {
      'Normal': 'सामान्य',
      'Incident': 'घटना',
      'Emergency': 'आपातकाल'
    };
    return translations[status as keyof typeof translations] || status;
  }

  async sendMessage(message: string, language: 'en' | 'hi' = 'en'): Promise<string> {
    try {
      if (this.fallbackMode) {
        const formattedData = this.formatTrafficData(this.trafficData);
        return language === 'en' 
          ? this.generateFallbackResponse(message)
          : this.getHindiResponse(message, formattedData);
      }

      if (!this.chat) {
        await this.initializeChat();
        if (this.fallbackMode) {
          const formattedData = this.formatTrafficData(this.trafficData);
          return language === 'en'
            ? this.generateFallbackResponse(message)
            : this.getHindiResponse(message, formattedData);
        }
      }

      const formattedData = this.formatTrafficData(this.trafficData);
      const dataSource = this.trafficData.length > 20 ? "Live TomTom Data" : "Simulated Data";
      const contextualMessage = `\nYou are Traffic Buddy, a friendly and conversational traffic assistant. Please respond in a natural, human-like way with empathy and helpful advice.\n\nCurrent traffic data for Indian cities (${dataSource}):\n${JSON.stringify(formattedData, null, 2)}\n\nUser question: ${message}\n\nPlease provide a helpful, conversational response using the above traffic data. Include specific details about congestion levels, wait times, and vehicle counts where relevant. Use phrases like "Let me check that for you!", "Based on what I'm seeing...", "I'd recommend...", etc. Be friendly and show empathy for traffic situations. IMPORTANT: Always mention whether you're using live TomTom data or simulated data in your response.`;

      const result = await this.chat.sendMessage(contextualMessage);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.warn('Failed to get chat response - using fallback:', error);
      const formattedData = this.formatTrafficData(this.trafficData);
      return language === 'en'
        ? this.generateFallbackResponse(message)
        : this.getHindiResponse(message, formattedData);
    }
  }

  updateTrafficData(newData: Intersection[]) {
    this.trafficData = newData;
  }
}