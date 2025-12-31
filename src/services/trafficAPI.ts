// Real-time traffic data service using TomTom API
interface TrafficLocation {
  lat: number;
  lon: number;
}

interface TrafficIncident {
  id: string;
  type: string;
  severity: number;
  description: string;
  location: TrafficLocation;
  delay: number;
  length: number;
}

interface TrafficFlow {
  coordinates: number[][];
  speed: number;
  freeFlowSpeed: number;
  jamFactor: number;
}

interface RealTimeTrafficData {
  location: string;
  coordinates: TrafficLocation;
  incidents: TrafficIncident[];
  flow: TrafficFlow[];
  timestamp: string;
}

class TrafficAPIService {
  private readonly API_KEY = import.meta.env.VITE_TOMTOM_API_KEY || '';
  private readonly BASE_URL = 'https://api.tomtom.com/traffic/services';
  
  constructor() {
    if (!this.API_KEY) {
      console.warn('TomTom API key not found. Using simulated data.');
    }
  }

  // Get real-time traffic incidents for a specific area
  async getTrafficIncidents(bounds: { minLat: number; maxLat: number; minLon: number; maxLon: number }): Promise<TrafficIncident[]> {
    if (!this.API_KEY) {
      console.warn('TomTom API key not found. Using simulated data.');
      return this.getSimulatedIncidents();
    }

    try {
      const bbox = `${bounds.minLon},${bounds.minLat},${bounds.maxLon},${bounds.maxLat}`;
      const url = `${this.BASE_URL}/5/incidentDetails?key=${this.API_KEY}&bbox=${bbox}&fields=incidents%7Ctype%7Cseverity%7Cdescription%7Clat%7Clon%7Cdelay%7Clength`;
      console.log('Fetching incidents:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        console.error('HTTP error fetching incidents:', response.status, response.statusText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Incidents response:', data);
      return data.incidents || [];
    } catch (error) {
      console.error('Error fetching traffic incidents:', error);
      return this.getSimulatedIncidents();
    }
  }

  // Get real-time traffic flow for a specific area
  async getTrafficFlow(bounds: { minLat: number; maxLat: number; minLon: number; maxLon: number }): Promise<TrafficFlow[]> {
    if (!this.API_KEY) {
      console.warn('TomTom API key not found. Using simulated data.');
      return this.getSimulatedFlow();
    }

    try {
      const bbox = `${bounds.minLon},${bounds.minLat},${bounds.maxLon},${bounds.maxLat}`;
      const url = `${this.BASE_URL}/4/flowSegmentData/absolute/key=${this.API_KEY}?bbox=${bbox}&thickness=10&openlr=false&format=json`;
      console.log('Fetching flow:', url);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        console.error('HTTP error fetching flow:', response.status, response.statusText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Flow response:', data);
      return data.flowSegmentData?.map((segment: any) => ({
        coordinates: segment.coordinates,
        speed: segment.currentSpeed,
        freeFlowSpeed: segment.freeFlowSpeed,
        jamFactor: segment.jamFactor
      })) || [];
    } catch (error) {
      console.error('Error fetching traffic flow:', error);
      return this.getSimulatedFlow();
    }
  }

  // Get comprehensive traffic data for a location
  async getTrafficDataForLocation(locationName: string, coordinates: TrafficLocation): Promise<RealTimeTrafficData> {
    const bounds = this.calculateBounds(coordinates, 0.1); // ~10km radius
    
    const [incidents, flow] = await Promise.all([
      this.getTrafficIncidents(bounds),
      this.getTrafficFlow(bounds)
    ]);

    return {
      location: locationName,
      coordinates,
      incidents,
      flow,
      timestamp: new Date().toISOString()
    };
  }

  // Calculate bounding box around a point
  private calculateBounds(center: TrafficLocation, radius: number): { minLat: number; maxLat: number; minLon: number; maxLon: number } {
    return {
      minLat: center.lat - radius,
      maxLat: center.lat + radius,
      minLon: center.lon - radius,
      maxLon: center.lon + radius
    };
  }

  // Simulated incidents for demo purposes
  private getSimulatedIncidents(): TrafficIncident[] {
    const incidentTypes = ['Accident', 'Road Closure', 'Heavy Traffic', 'Construction', 'Weather'];
    const descriptions = [
      'Multi-vehicle accident blocking two lanes',
      'Heavy congestion due to rush hour traffic',
      'Road maintenance work in progress',
      'Vehicle breakdown on highway',
      'Flooding on major road'
    ];

    return Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () => ({
      id: `incident_${Math.random().toString(36).substr(2, 9)}`,
      type: incidentTypes[Math.floor(Math.random() * incidentTypes.length)],
      severity: Math.floor(Math.random() * 4) + 1,
      description: descriptions[Math.floor(Math.random() * descriptions.length)],
      location: {
        lat: 12.9716 + (Math.random() - 0.5) * 0.1,
        lon: 77.5946 + (Math.random() - 0.5) * 0.1
      },
      delay: Math.floor(Math.random() * 20) + 5,
      length: Math.floor(Math.random() * 1000) + 100
    }));
  }

  // Simulated traffic flow for demo purposes
  private getSimulatedFlow(): TrafficFlow[] {
    return Array.from({ length: 10 }, () => ({
      coordinates: [
        [12.9716 + (Math.random() - 0.5) * 0.1, 77.5946 + (Math.random() - 0.5) * 0.1],
        [12.9716 + (Math.random() - 0.5) * 0.1, 77.5946 + (Math.random() - 0.5) * 0.1]
      ],
      speed: Math.floor(Math.random() * 60) + 10,
      freeFlowSpeed: 80,
      jamFactor: Math.random() * 10
    }));
  }
}

export const trafficAPI = new TrafficAPIService();
export type { TrafficLocation, TrafficIncident, TrafficFlow, RealTimeTrafficData };
