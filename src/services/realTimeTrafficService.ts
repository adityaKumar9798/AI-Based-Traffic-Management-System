import { Intersection, TrafficData } from '../types';
import { trafficAPI, RealTimeTrafficData } from './trafficAPI';

interface CityCoordinates {
  [key: string]: { lat: number; lon: number };
}

const CITY_COORDINATES: CityCoordinates = {
  'bangalore': { lat: 12.9716, lon: 77.5946 },
  'bengaluru': { lat: 12.9716, lon: 77.5946 },
  'delhi': { lat: 28.6139, lon: 77.2090 },
  'new delhi': { lat: 28.6139, lon: 77.2090 },
  'mumbai': { lat: 19.0760, lon: 72.8777 },
  'chennai': { lat: 13.0827, lon: 80.2707 },
  'kolkata': { lat: 22.5726, lon: 88.3639 },
  'ahmedabad': { lat: 23.0225, lon: 72.5714 },
  'patna': { lat: 25.5941, lon: 85.1376 },
  'bhopal': { lat: 23.2599, lon: 77.4126 },
  'nagpur': { lat: 21.1458, lon: 79.0882 },
  'guwahati': { lat: 26.1445, lon: 91.7362 },
  'gangtok': { lat: 27.3314, lon: 88.6138 },
  'ranchi': { lat: 23.3441, lon: 85.3096 },
  'jharkhand': { lat: 23.3441, lon: 85.3096 }
};

class RealTimeTrafficService {
  private cache: Map<string, { data: Intersection[]; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // Get real-time traffic data for all cities
  async getAllRealTimeTrafficData(): Promise<Intersection[]> {
    const cacheKey = 'all_cities';
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      console.log('Using cached traffic data');
      return cached.data;
    }

    try {
      const cityNames = Object.keys(CITY_COORDINATES);
      console.log('Fetching traffic data for cities:', cityNames);
      
      const trafficPromises = cityNames.map(city => this.getTrafficForCity(city));
      const cityTrafficData = await Promise.all(trafficPromises);
      
      console.log('Received traffic data:', cityTrafficData);
      
      const intersections: Intersection[] = [];
      let hasRealData = false;
      
      cityTrafficData.forEach((cityData, index) => {
        if (cityData) {
          const cityName = cityNames[index];
          console.log(`Creating intersection for ${cityName}:`, cityData);
          intersections.push(...this.createIntersectionsFromRealData(cityName, cityData));
          hasRealData = true;
        }
      });

      console.log('Final intersections:', intersections);
      console.log('Has real data:', hasRealData);
      this.cache.set(cacheKey, { data: intersections, timestamp: Date.now() });
      return intersections;
    } catch (error) {
      console.error('Error fetching real-time traffic data:', error);
      return this.getFallbackData();
    }
  }

  // Get traffic data for a specific city
  async getTrafficForCity(cityName: string): Promise<RealTimeTrafficData | null> {
    try {
      const coordinates = CITY_COORDINATES[cityName.toLowerCase()];
      if (!coordinates) {
        console.warn(`Coordinates not found for city: ${cityName}`);
        return null;
      }

      return await trafficAPI.getTrafficDataForLocation(cityName, coordinates);
    } catch (error) {
      console.error(`Error fetching traffic data for ${cityName}:`, error);
      return null;
    }
  }

  // Convert real-time traffic data to Intersection format
  private createIntersectionsFromRealData(cityName: string, trafficData: RealTimeTrafficData): Intersection[] {
    const baseId = this.getCityId(cityName);
    
    // Calculate traffic metrics from real data
    const avgSpeed = trafficData.flow.length > 0 
      ? trafficData.flow.reduce((sum, f) => sum + f.speed, 0) / trafficData.flow.length 
      : 40;
    
    const avgJamFactor = trafficData.flow.length > 0
      ? trafficData.flow.reduce((sum, f) => sum + f.jamFactor, 0) / trafficData.flow.length
      : 5;

    // Determine congestion level based on jam factor
    let congestionLevel: 'Low' | 'Medium' | 'High';
    if (avgJamFactor < 3) {
      congestionLevel = 'Low';
    } else if (avgJamFactor < 7) {
      congestionLevel = 'Medium';
    } else {
      congestionLevel = 'High';
    }

    // Calculate realistic vehicle count based on city and congestion
    const cityVehicleCounts: { [key: string]: number } = {
      'bangalore': 300,
      'bengaluru': 300,
      'delhi': 450,
      'new delhi': 450,
      'mumbai': 400,
      'chennai': 250,
      'kolkata': 280,
      'ahmedabad': 180,
      'patna': 150,
      'bhopal': 120,
      'nagpur': 140,
      'guwahati': 100,
      'gangtok': 60,
      'ranchi': 110,
      'jharkhand': 110
    };
    
    const baseVehicleCount = cityVehicleCounts[cityName.toLowerCase()] || 200;
    const congestionMultiplier = congestionLevel === 'High' ? 1.5 : congestionLevel === 'Medium' ? 1.2 : 1.0;
    const vehicleCount = baseVehicleCount * congestionMultiplier;

    // Calculate wait time based on congestion
    const waitTime = congestionLevel === 'High' ? 120 : congestionLevel === 'Medium' ? 60 : 30;

    // Determine status based on incidents
    let status: 'Normal' | 'Incident' | 'Emergency';
    if (trafficData.incidents.some(inc => inc.severity >= 3)) {
      status = 'Emergency';
    } else if (trafficData.incidents.length > 0) {
      status = 'Incident';
    } else {
      status = 'Normal';
    }

    // Create multiple intersections per city (3-5 per city)
    const intersections: Intersection[] = [];
    const numIntersections = Math.floor(Math.random() * 3) + 3; // 3-5 intersections per city
    
    for (let i = 0; i < numIntersections; i++) {
      // Distribute vehicles across intersections
      const intersectionVehicleCount = Math.floor(vehicleCount / numIntersections) + Math.floor(Math.random() * 20) - 10;
      
      // Add some variation to coordinates within city bounds
      const latOffset = (Math.random() - 0.5) * 0.1; // ~5km radius
      const lngOffset = (Math.random() - 0.5) * 0.1;
      
      const trafficDataObj: TrafficData = {
        intersectionId: `${baseId}_${i}`,
        vehicleCount: Math.max(10, intersectionVehicleCount), // Minimum 10 vehicles
        congestionLevel,
        waitTime: waitTime + Math.floor(Math.random() * 20) - 10, // Add variation
        status,
        timestamp: trafficData.timestamp,
        twoWheelers: Math.floor(intersectionVehicleCount * 0.55),
        autoRickshaws: Math.floor(intersectionVehicleCount * 0.25),
        buses: Math.floor(intersectionVehicleCount * 0.08)
      };

      intersections.push({
        id: `${baseId}_${i}`,
        name: this.getIntersectionName(cityName, i),
        location: `${trafficData.coordinates.lat + latOffset},${trafficData.coordinates.lon + lngOffset}`,
        currentPhase: Math.random() > 0.5 ? 'North-South' : 'East-West',
        trafficData: trafficDataObj
      });
    }

    return intersections;
  }

  // Get city ID for mapping
  private getCityId(cityName: string): string {
    const cityMap: { [key: string]: string } = {
      'bangalore': '5',
      'bengaluru': '5',
      'delhi': '1',
      'new delhi': '1',
      'mumbai': '3',
      'chennai': '6',
      'kolkata': '7',
      'ahmedabad': '4',
      'patna': '8',
      'bhopal': '9',
      'nagpur': '10',
      'guwahati': '11',
      'gangtok': '12',
      'ranchi': '13',
      'jharkhand': '13'
    };
    return cityMap[cityName.toLowerCase()] || '1';
  }

  // Get intersection name for city
  private getIntersectionName(cityName: string, index: number = 0): string {
    const intersectionNames: { [key: string]: string[] } = {
      'bangalore': ['MG Road & Brigade Road', 'Electronic City Junction', 'Koramangala Crossing', 'Indiranagar Circle', 'Whitefield Square'],
      'bengaluru': ['MG Road & Brigade Road', 'Electronic City Junction', 'Koramangala Crossing', 'Indiranagar Circle', 'Whitefield Square'],
      'delhi': ['Connaught Place Circle', 'India Gate Junction', 'Karol Bagh Crossing', 'Dwarka Intersection', 'Lajpat Nagar Square'],
      'new delhi': ['Connaught Place Circle', 'India Gate Junction', 'Karol Bagh Crossing', 'Dwarka Intersection', 'Lajpat Nagar Square'],
      'mumbai': ['Marine Drive Junction', 'Bandra-Worli Link', 'Andheri Crossing', 'Sion Circle', 'CST Junction'],
      'chennai': ['Anna Salai Junction', 'T Nagar Crossing', 'Mount Road Circle', 'Besant Nagar Square', 'Guindy Intersection'],
      'kolkata': ['Park Street Crossing', 'Howrah Bridge Junction', 'Salt Lake Circle', 'Gariahat Crossing', 'Dum Dum Square'],
      'ahmedabad': ['SG Highway Crossing', 'CG Road Junction', 'Kalupur Circle', 'Navrangpura Square', 'Maninagar Intersection'],
      'patna': ['Patna Junction', 'Gandhi Maidan Crossing', 'Kankarbagh Circle', 'Boring Road Square', 'Ashok Rajpath Junction'],
      'bhopal': ['MP Nagar Zone 1', 'Hoshangabad Road Crossing', 'BHEL Junction', 'New Market Square', 'Arera Colony Circle'],
      'nagpur': ['Sitabuldi Main Road', 'Wardha Road Junction', 'Ramdaspeth Crossing', 'Sadar Square', 'Laxmi Nagar Intersection'],
      'guwahati': ['GS Road Junction', 'Pan Bazaar Crossing', 'Dispur Circle', 'Zoo Road Square', 'Fancy Bazaar Intersection'],
      'gangtok': ['MG Marg Crossing', 'Tadong Junction', 'Rumtek Square', 'Deorali Circle', 'Gangtok Tok Intersection'],
      'ranchi': ['Main Road Junction', 'Ratu Road Crossing', 'Harmu Bazaar', 'Kanke Thana Square', 'Doranda Circle'],
      'jharkhand': ['Main Road Junction', 'Ratu Road Crossing', 'Harmu Bazaar', 'Kanke Thana Square', 'Doranda Circle']
    };
    
    const names = intersectionNames[cityName.toLowerCase()] || [`${cityName} Junction`];
    return names[index % names.length];
  }

  // Fallback to mock data if API fails
  private async getFallbackData(): Promise<Intersection[]> {
    console.log('Using fallback mock data');
    try {
      const { mockIntersections } = await import('../data/mockTrafficData');
      return mockIntersections;
    } catch (error) {
      console.error('Failed to load fallback data:', error);
      // Return minimal data to prevent complete failure
      return [{
        id: '1',
        name: 'Default Location',
        location: '12.9716,77.5946',
        currentPhase: 'North-South',
        trafficData: {
          intersectionId: '1',
          vehicleCount: 50,
          congestionLevel: 'Medium',
          waitTime: 45,
          status: 'Normal',
          timestamp: new Date().toISOString(),
          twoWheelers: 30,
          autoRickshaws: 15,
          buses: 5
        }
      }];
    }
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
  }
}

export const realTimeTrafficService = new RealTimeTrafficService();
