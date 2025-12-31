import { realTimeTrafficService } from '../services/realTimeTrafficService';
import React, { useState, useEffect } from 'react';
import { 
  Car, 
  Clock, 
  AlertTriangle, 
  Activity,
  ArrowUpDown,
  ArrowLeftRight,
  Bike,
  Bus,
  X
} from 'lucide-react';
import { Intersection, RealTimeUpdate } from '../types';
import Map from './Map';
import { subscribeToUpdates } from '../services/socket';
import ActiveIncidents from './ActiveIncidents';
import WaitTimeAnalytics from './WaitTimeAnalytics';
import ChatbotWidget from './ChatbotWidget';

const Dashboard: React.FC = () => {
  const [intersections, setIntersections] = useState<Intersection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIntersection, setSelectedIntersection] = useState<Intersection | null>(null);
  const [showIncidents, setShowIncidents] = useState(false);
  const [showWaitTimeAnalytics, setShowWaitTimeAnalytics] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date());
  const [showVehicleDetails, setShowVehicleDetails] = useState(false);

  // Load real-time traffic data
  useEffect(() => {
    const loadTrafficData = async () => {
      setIsLoading(true);
      try {
        const trafficData = await realTimeTrafficService.getAllRealTimeTrafficData();
        setIntersections(trafficData);
        setLastUpdateTime(new Date());
      } catch (error) {
        console.error('Failed to load traffic data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTrafficData();
    
    // Update data every 5 minutes
    const interval = setInterval(loadTrafficData, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Effect for real-time socket updates
  useEffect(() => {
    const unsubscribe = subscribeToUpdates((update: RealTimeUpdate) => {
      setIntersections(prevIntersections => 
        prevIntersections.map(intersection => {
          if (intersection.id === update.intersectionId) {
            return {
              ...intersection,
              trafficData: {
                ...intersection.trafficData,
                ...update,
                timestamp: new Date().toISOString()
              }
            };
          }
          return intersection;
        })
      );
      setLastUpdateTime(new Date());
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const totalVehicles = intersections.reduce(
    (sum, intersection) => sum + intersection.trafficData.vehicleCount,
    0
  );

  const averageWaitTime = Math.round(
    intersections.reduce((sum, intersection) => sum + intersection.trafficData.waitTime, 0) /
    intersections.length
  );

  const activeIncidents = intersections.filter(
    intersection => intersection.trafficData.status !== 'Normal'
  );

  return (
    <div className="p-6 space-y-6">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">भारतीय यातायात प्रबंधन प्रणाली</h1>
          <p className="text-gray-600">Real-Time Traffic Management System</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="px-4 py-2 bg-green-100 rounded-lg flex items-center">
            <Activity className="w-5 h-5 text-green-600 mr-2" />
            <span className="text-green-700">
              {isLoading ? 'Loading...' : 'Live Data'}
            </span>
          </div>
          <div className="text-sm text-gray-600">
            Last updated: {lastUpdateTime.toLocaleTimeString()}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Refresh
          </button>
        </div>
      </header>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading real-time traffic data...</p>
          </div>
        </div>
      ) : (

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          className="bg-white rounded-xl shadow-md p-6 cursor-pointer hover:bg-gray-50 transition-colors relative"
          onClick={() => setShowVehicleDetails(true)}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-700">Total Vehicles</h3>
            <Car className="w-6 h-6 text-blue-500" />
          </div>
          <div className="mt-2">
            <p className="text-3xl font-bold text-gray-900">{totalVehicles}</p>
            <div className="flex items-center mt-1">
              <p className="text-sm text-gray-500">Across all intersections</p>
              {isLoading && (
                <span className="ml-2 inline-block w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
              )}
            </div>
          </div>
        </div>

        <div 
          className="bg-white rounded-xl shadow-md p-6 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => setShowWaitTimeAnalytics(true)}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-700">Average Wait Time</h3>
            <Clock className="w-6 h-6 text-yellow-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900 mt-2">{averageWaitTime}s</p>
          <p className="text-sm text-gray-500 mt-1">Click for detailed analytics</p>
        </div>

        <div 
          className="bg-white rounded-xl shadow-md p-6 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => setShowIncidents(true)}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-700">Active Incidents</h3>
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900 mt-2">{activeIncidents.length}</p>
          <p className="text-sm text-gray-500 mt-1">Click to view details</p>
        </div>
      </div>

      {/* Vehicle Details Popup */}
      {showVehicleDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">Vehicle Count Details</h3>
              <button
                onClick={() => setShowVehicleDetails(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
                onClick={() => setShowVehicleDetails(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Total Vehicles</p>
                <p className="text-2xl font-bold text-gray-900">{totalVehicles}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-600">Last Updated</p>
                <p className="text-lg text-gray-800">
                  {lastUpdateTime.toLocaleString()}
                </p>
              </div>
              
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-500">
                  Vehicle counts are updated every 15 minutes and in real-time based on traffic conditions.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Traffic Map</h2>
        <Map 
          intersections={intersections}
          onIntersectionClick={setSelectedIntersection}
        />
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Intersection Status</h2>
        <div className="grid gap-6">
          {intersections.map((intersection) => (
            <div 
              key={intersection.id} 
              className={`bg-white rounded-xl shadow-md p-6 ${
                selectedIntersection?.id === intersection.id ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">{intersection.name}</h3>
                  <p className="text-gray-600">Last updated: {
                    new Date(intersection.trafficData.timestamp).toLocaleTimeString()
                  }</p>
                </div>
                <div className={`px-3 py-1 rounded-full ${
                  intersection.trafficData.status === 'Normal' 
                    ? 'bg-green-100 text-green-700'
                    : intersection.trafficData.status === 'Incident'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {intersection.trafficData.status}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center">
                  <Bike className="w-5 h-5 text-blue-500 mr-2" />
                  <div>
                    <p className="text-sm text-gray-600">Two Wheelers</p>
                    <p className="font-semibold">{intersection.trafficData.twoWheelers}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Car className="w-5 h-5 text-yellow-500 mr-2" />
                  <div>
                    <p className="text-sm text-gray-600">Auto Rickshaws</p>
                    <p className="font-semibold">{intersection.trafficData.autoRickshaws}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Bus className="w-5 h-5 text-purple-500 mr-2" />
                  <div>
                    <p className="text-sm text-gray-600">Buses</p>
                    <p className="font-semibold">{intersection.trafficData.buses}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  {intersection.currentPhase === 'North-South' ? (
                    <ArrowUpDown className="w-5 h-5 text-green-500 mr-2" />
                  ) : (
                    <ArrowLeftRight className="w-5 h-5 text-green-500 mr-2" />
                  )}
                  <div>
                    <p className="text-sm text-gray-600">Current Phase</p>
                    <p className="font-semibold">{intersection.currentPhase}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      {showIncidents && (
        <ActiveIncidents
          incidents={activeIncidents}
          onClose={() => setShowIncidents(false)}
        />
      )}

      {showWaitTimeAnalytics && (
        <WaitTimeAnalytics
          intersections={intersections}
          onClose={() => setShowWaitTimeAnalytics(false)}
        />
      )}

      <ChatbotWidget trafficData={intersections} />
      </div>
    </div>
  );
};

export default Dashboard;