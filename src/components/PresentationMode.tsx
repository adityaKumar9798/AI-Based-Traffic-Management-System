import React, { useState } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import Dashboard from './Dashboard';

const PresentationMode: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(1);
  const [showOverlay, setShowOverlay] = useState(true);

  const slides = [
    {
      id: 1,
      title: "AI-Powered Traffic Management System",
      subtitle: "भारतीय यातायात प्रबंधन प्रणाली",
      content: (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Key Technologies:</h3>
          <ul className="list-disc list-inside space-y-2">
            <li>React & TypeScript</li>
            <li>Real-time WebSocket Integration</li>
            <li>AI/ML for Traffic Prediction</li>
            <li>Interactive Map Visualization</li>
          </ul>
        </div>
      )
    },
    {
      id: 2,
      title: "Problem Statement",
      content: (
        <div className="space-y-4">
          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-red-700">Critical Issues:</h3>
            <ul className="list-disc list-inside space-y-2 text-red-600">
              <li>Traffic congestion in major cities</li>
              <li>Manual traffic management inefficiencies</li>
              <li>Delayed incident response</li>
              <li>Limited real-time monitoring</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      id: 3,
      title: "Live Dashboard Demo",
      content: <Dashboard />
    }
  ];

  const currentSlideData = slides[currentSlide - 1];

  return (
    <div className="min-h-screen bg-gray-50">
      {showOverlay && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-xl max-w-2xl w-full">
            <h2 className="text-2xl font-bold mb-4">Presentation Controls</h2>
            <p className="mb-4">Use the following controls during presentation:</p>
            <ul className="list-disc list-inside space-y-2 mb-6">
              <li>Left/Right Arrow Keys: Navigate slides</li>
              <li>Spacebar: Toggle overlay</li>
              <li>ESC: Exit presentation mode</li>
            </ul>
            <button
              onClick={() => setShowOverlay(false)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Start Presentation
            </button>
          </div>
        </div>
      )}

      <div className="p-6">
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => setCurrentSlide(prev => Math.max(1, prev - 1))}
            disabled={currentSlide === 1}
            className="p-2 rounded-full hover:bg-gray-200 disabled:opacity-50"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800">{currentSlideData.title}</h2>
            {currentSlideData.subtitle && (
              <p className="text-xl text-gray-600">{currentSlideData.subtitle}</p>
            )}
          </div>

          <button
            onClick={() => setCurrentSlide(prev => Math.min(slides.length, prev + 1))}
            disabled={currentSlide === slides.length}
            className="p-2 rounded-full hover:bg-gray-200 disabled:opacity-50"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        <div className="container mx-auto">
          {currentSlideData.content}
        </div>

        <div className="fixed bottom-4 right-4 bg-white px-4 py-2 rounded-lg shadow-md">
          Slide {currentSlide} of {slides.length}
        </div>
      </div>
    </div>
  );
};

export default PresentationMode;