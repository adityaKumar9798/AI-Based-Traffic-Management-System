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
  const [isUsingRealData, setIsUsingRealData] = useState(false);
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
        console.log('Traffic data received:', trafficData);
        if (trafficData && trafficData.length > 0) {
          setIntersections(trafficData);
          setIsUsingRealData(true);
          setLastUpdateTime(new Date());
        } else {
          // Force fallback to mock data if real data fails
          console.log('No traffic data received, using mock data');
          const { mockIntersections } = await import('../data/mockTrafficData');
          setIntersections(mockIntersections);
          setIsUsingRealData(false);
          setLastUpdateTime(new Date());
        }
      } catch (error) {
        console.error('Failed to load traffic data:', error);
        // Always use mock data as ultimate fallback
        const { mockIntersections } = await import('../data/mockTrafficData');
        setIntersections(mockIntersections);
        setIsUsingRealData(false);
        setLastUpdateTime(new Date());
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
                vehicleCount: update.vehicleCount,
                twoWheelers: update.twoWheelers,
                autoRickshaws: update.autoRickshaws,
                buses: update.buses,
                timestamp: update.timestamp || new Date().toISOString()
              }
            };
          }
          return intersection;
        })
      );
      setLastUpdateTime(new Date());
    });

    return unsubscribe;
  }, []);

  const totalVehicles = intersections.reduce(
    (sum, intersection) => sum + intersection.trafficData.vehicleCount,
    0
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
              {isLoading ? 'Loading...' : isUsingRealData ? 'Live Data' : 'Fallback Data'}
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
              <h3 className="text-lg font-semibold text-gray-700">Wait Times</h3>
              <Clock className="w-6 h-6 text-orange-500" />
            </div>
            <div className="mt-2">
              <p className="text-3xl font-bold text-gray-900">
                {Math.round(
                  intersections.reduce(
                    (sum, intersection) => sum + intersection.trafficData.waitTime,
                    0
                  ) / intersections.length
                )}s
              </p>
              <p className="text-sm text-gray-500">Average wait time</p>
            </div>
          </div>

          <div 
            className="bg-white rounded-xl shadow-md p-6 cursor-pointer hover:bg-gray-50 transition-colors relative"
            onClick={() => setShowIncidents(true)}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-700">Active Incidents</h3>
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <div className="mt-2">
              <p className="text-3xl font-bold text-gray-900">{activeIncidents.length}</p>
              <p className="text-sm text-gray-500 mt-1">Click to view details</p>
            </div>
          </div>
        </div>
      )}

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
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Total Vehicles</p>
                <p className="text-2xl font-bold text-gray-900">{totalVehicles}</p>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                {intersections.map((intersection) => (
                  <div key={intersection.id} className="text-center">
                    <h4 className="font-semibold text-gray-700">{intersection.name}</h4>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center">
                        <Bike className="w-4 h-4 text-blue-500 mr-2" />
                        <div>
                          <p className="text-sm text-gray-600">Two Wheelers</p>
                          <p className="font-semibold">{intersection.trafficData.twoWheelers}</p>
                        </div>
                      </div>

                      <div className="flex items-center">
                        <Car className="w-4 h-4 text-yellow-500 mr-2" />
                        <div>
                          <p className="text-sm text-gray-600">Auto Rickshaws</p>
                          <p className="font-semibold">{intersection.trafficData.autoRickshaws}</p>
                        </div>
                      </div>

                      <div className="flex items-center">
                        <Bus className="w-4 h-4 text-purple-500 mr-2" />
                        <div>
                          <p className="text-sm text-gray-600">Buses</p>
                          <p className="font-semibold">{intersection.trafficData.buses}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Map Component */}
      <div className="mt-8">
        <Map 
          intersections={intersections}
          onIntersectionClick={(intersection) => setSelectedIntersection(intersection)}
        />
      </div>

      {/* City-wise Traffic Data */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">City-wise Traffic Data</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(
            intersections.reduce((acc, intersection) => {
              const cityName = intersection.name.split(' & ')[0] || intersection.name.split(' ')[0];
              if (!acc[cityName]) {
                acc[cityName] = [];
              }
              acc[cityName].push(intersection);
              return acc;
            }, {} as { [key: string]: typeof intersections })
          ).map(([cityName, cityIntersections]) => (
            <div key={cityName} className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">{cityName}</h3>
              <div className="space-y-3">
                {cityIntersections.map((intersection) => (
                  <div key={intersection.id} className="border-l-4 border-blue-500 pl-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-700">{intersection.name}</h4>
                        <p className="text-sm text-gray-600">
                          Status: 
                          <span className={`ml-1 px-2 py-1 rounded text-xs ${
                            intersection.trafficData.status === 'Normal' 
                              ? 'bg-green-100 text-green-700'
                              : intersection.trafficData.status === 'Incident'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {intersection.trafficData.status}
                          </span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{intersection.trafficData.vehicleCount}</p>
                        <p className="text-sm text-gray-600">vehicles</p>
                      </div>
                    </div>
                    <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">🏍️ {intersection.trafficData.twoWheelers}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">🚗 {intersection.trafficData.autoRickshaws}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">🚌 {intersection.trafficData.buses}</span>
                      </div>
                    </div>
                    <div className="mt-2 flex justify-between text-sm">
                      <span className="text-gray-600">Wait: {intersection.trafficData.waitTime}s</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        intersection.trafficData.congestionLevel === 'Low'
                          ? 'bg-green-100 text-green-700'
                          : intersection.trafficData.congestionLevel === 'Medium'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {intersection.trafficData.congestionLevel}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
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
  );
};

export default Dashboard;
