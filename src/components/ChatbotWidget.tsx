import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Minimize2, Maximize2, Volume2, VolumeX, Mic, MicOff, Languages } from 'lucide-react';
import { TrafficChatbot } from '../services/chatbot';

interface Message {
  text: string;
  isUser: boolean;
  timestamp: Date;
  fromVoice?: boolean;
}

import { Intersection } from '../types';

interface ChatbotWidgetProps {
  trafficData: Intersection[];
}

const ChatbotWidget: React.FC<ChatbotWidgetProps> = ({ trafficData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceError, setVoiceError] = useState(false);
  const [voiceInitialized, setVoiceInitialized] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [microphoneAvailable, setMicrophoneAvailable] = useState(false);
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatbotRef = useRef<TrafficChatbot | null>(null);
  const speechSynthesis = window.speechSynthesis;
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const initializationAttempts = useRef(0);
  const maxInitAttempts = 3;
  const recognitionRef = useRef<any | null>(null);
  const currentUtterance = useRef<SpeechSynthesisUtterance | null>(null);

  // Language toggle button text
  const languageToggleText = {
    en: 'हिंदी में बदलें',
    hi: 'Switch to English'
  };

  // Placeholder text by language
  const placeholderText = {
    en: 'Ask about traffic conditions...',
    hi: 'यातायात की स्थिति के बारे में पूछें...'
  };

  // Initial message by language
  const getInitialMessage = (lang: 'en' | 'hi') => ({
    en: "Hello! I can help you with traffic information. Ask me about congestion levels, wait times, or specific intersections.",
    hi: "नमस्ते! मैं आपको यातायात की जानकारी में मदद कर सकता हूं। भीड़ के स्तर, प्रतीक्षा समय, या विशिष्ट चौराहों के बारे में पूछें।"
  }[lang]);

  // Effect for language change
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        text: getInitialMessage(language),
        isUser: false,
        timestamp: new Date()
      }]);
    }
  }, [language]);

  // Check microphone availability
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(() => setMicrophoneAvailable(true))
      .catch(() => setMicrophoneAvailable(false));
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-IN';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsListening(false);
        handleSend(transcript, true);
      };

      recognitionRef.current.onerror = (event: any) => {
        // Only log errors other than 'no-speech'
        if (event.error !== 'no-speech') {
          console.error('Speech recognition error:', event.error);
        }
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      stopSpeaking();
      // Speak the prompt before starting to listen
      speakMessage("I'm listening. Please ask your question about traffic.", true);
      // Start recognition after the prompt
      setTimeout(() => {
        if (recognitionRef.current) {
          recognitionRef.current.start();
          setIsListening(true);
        }
      }, 1500); // Wait for 1.5 seconds after the prompt
    }
  };

  const stopSpeaking = () => {
    if (currentUtterance.current) {
      speechSynthesis.cancel();
      currentUtterance.current = null;
      setIsSpeaking(false);
    }
  };

  useEffect(() => {
    const initVoice = () => {
      try {
        if (!window.speechSynthesis) {
          throw new Error('Speech synthesis not supported');
        }

        const voices = speechSynthesis.getVoices();
        if (!voices.length && initializationAttempts.current < maxInitAttempts) {
          initializationAttempts.current++;
          setTimeout(initVoice, 500);
          return;
        }

        const isFemaleVoice = (voice: SpeechSynthesisVoice) => {
          const name = voice.name.toLowerCase();
          return name.includes('female') || 
                 name.includes('woman') || 
                 name.includes('girl') ||
                 name.includes('zira') ||
                 name.includes('samantha') ||
                 name.includes('veena') ||
                 name.includes('tessa') ||
                 name.includes('monica') ||
                 name.includes('victoria');
        };

        const femaleVoice = 
          voices.find(voice => voice.lang === 'en-IN' && isFemaleVoice(voice)) || 
          voices.find(voice => voice.lang.startsWith('en') && isFemaleVoice(voice)) || 
          voices.find(isFemaleVoice) ||
          voices.find(voice => voice.lang.startsWith('en')) ||
          voices[0];

        if (femaleVoice) {
          setSelectedVoice(femaleVoice);
          setVoiceError(false);
          setVoiceInitialized(true);
        } else {
          throw new Error('No suitable voice found');
        }
      } catch (error) {
        console.error('Voice initialization error:', error);
        setVoiceError(true);
        setVoiceInitialized(true);
      }
    };

    initVoice();

    const onVoicesChanged = () => {
      initializationAttempts.current = 0;
      initVoice();
    };

    speechSynthesis.onvoiceschanged = onVoicesChanged;

    return () => {
      speechSynthesis.onvoiceschanged = null;
      stopSpeaking();
    };
  }, []);

  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  useEffect(() => {
    if (trafficData) {
      try {
        chatbotRef.current = new TrafficChatbot(trafficData);
        setMessages([{
          text: getInitialMessage(language),
          isUser: false,
          timestamp: new Date()
        }]);
      } catch (err) {
        console.error('Chatbot initialization error:', err);
      }
    }
  }, []);

  useEffect(() => {
    if (chatbotRef.current) {
      chatbotRef.current.updateTrafficData(trafficData);
    }
  }, [trafficData]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const speakMessage = (text: string, isPrompt: boolean = false) => {
    if (voiceError || !selectedVoice || !voiceInitialized) {
      return;
    }

    try {
      stopSpeaking();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = selectedVoice;
      utterance.pitch = 1.1;
      utterance.rate = 0.95;
      utterance.volume = 1.0;
      
      utterance.onend = () => {
        currentUtterance.current = null;
        setIsSpeaking(false);
      };

      utterance.onerror = (event) => {
        if (event.error !== 'interrupted' && event.error !== 'canceled') {
          console.error('Speech synthesis error:', event);
          setVoiceError(true);
        }
        currentUtterance.current = null;
        setIsSpeaking(false);
      };
      
      currentUtterance.current = utterance;
      setIsSpeaking(true);
      
      // Only add the message to the chat if it's not a prompt
      if (!isPrompt) {
        setMessages(prev => [...prev, {
          text,
          isUser: false,
          timestamp: new Date(),
          fromVoice: true
        }]);
      }
      
      setTimeout(() => {
        if (currentUtterance.current === utterance) {
          speechSynthesis.speak(utterance);
        }
      }, 100);
    } catch (error) {
      console.error('Speech synthesis error:', error);
      setVoiceError(true);
      setIsSpeaking(false);
    }
  };

  const handleSend = async (text?: string, fromVoice: boolean = false) => {
    const messageText = text || inputText;
    if (!messageText.trim() || !chatbotRef.current) return;

    const userMessage: Message = {
      text: messageText,
      isUser: true,
      timestamp: new Date(),
      fromVoice
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await chatbotRef.current.sendMessage(messageText, language);
      const botMessage: Message = {
        text: response,
        isUser: false,
        timestamp: new Date(),
        fromVoice
      };
      setMessages(prev => [...prev, botMessage]);

      if (fromVoice && !voiceError && voiceInitialized && selectedVoice) {
        speakMessage(response);
      } else if (!voiceError && voiceInitialized && selectedVoice) {
        // Speak all responses, not just voice input
        speakMessage(response);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        text: language === 'en' 
          ? 'I encountered an error. Please try asking your question again.'
          : 'एक त्रुटि हुई। कृपया अपना प्रश्न दोबारा पूछें।',
        isUser: false,
        timestamp: new Date(),
        fromVoice
      };
      setMessages(prev => [...prev, errorMessage]);
    }

    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-4 right-4" style={{ zIndex: 9999 }}>
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 transition-colors"
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      ) : (
        <div
          className={`bg-white rounded-lg shadow-xl transition-all ${
            isMinimized ? 'h-14' : 'h-[500px]'
          } w-[350px] flex flex-col`}
          style={{ maxHeight: 'calc(100vh - 2rem)' }}
        >
          <div className="flex items-center justify-between p-4 border-b bg-blue-600 text-white rounded-t-lg">
            <h3 className="font-semibold">
              {language === 'en' ? 'Traffic Assistant' : 'यातायात सहायक'}
            </h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setLanguage(prev => prev === 'en' ? 'hi' : 'en')}
                className="hover:text-gray-200 flex items-center"
                title={languageToggleText[language]}
              >
                <Languages className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="hover:text-gray-200"
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => {
                  setIsOpen(false);
                  stopSpeaking();
                }}
                className="hover:text-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.isUser
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs opacity-70">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                        {!message.isUser && message.fromVoice && !voiceError && voiceInitialized && selectedVoice && (
                          <button
                            onClick={() => speakMessage(message.text)}
                            className={`ml-2 p-1 rounded-full hover:bg-gray-200 transition-colors ${
                              message.isUser ? 'text-white' : 'text-gray-600'
                            }`}
                          >
                            {isSpeaking ? (
                              <VolumeX className="w-4 h-4" />
                            ) : (
                              <Volume2 className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-800 p-3 rounded-lg">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 border-t">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={placeholderText[language]}
                    className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isLoading || isListening}
                  />
                  {microphoneAvailable && (
                    <button
                      onClick={toggleListening}
                      disabled={isLoading}
                      className={`p-2 rounded-lg transition-colors ${
                        isListening 
                          ? 'bg-red-500 hover:bg-red-600 text-white' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                      title={isListening ? "Stop listening" : "Start voice input"}
                    >
                      {isListening ? (
                        <MicOff className="w-5 h-5" />
                      ) : (
                        <Mic className="w-5 h-5" />
                      )}
                    </button>
                  )}
                  <button
                    onClick={() => handleSend()}
                    disabled={isLoading || !inputText.trim()}
                    className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatbotWidget;