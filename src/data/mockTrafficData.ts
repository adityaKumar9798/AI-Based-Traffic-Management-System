import { Intersection } from '../types';

export const mockIntersections: Intersection[] = [
  // North India
  {
    id: '1',
    name: 'Connaught Place Circle',
    location: '28.6289,77.2074', // New Delhi
    currentPhase: 'North-South',
    trafficData: {
      intersectionId: '1',
      vehicleCount: 145,
      congestionLevel: 'High',
      waitTime: 180,
      status: 'Normal',
      timestamp: new Date().toISOString(),
      twoWheelers: 85,
      autoRickshaws: 25,
      buses: 8
    }
  },
  {
    id: '2',
    name: 'Chandni Chowk Junction',
    location: '28.6506,77.2311', // Delhi
    currentPhase: 'East-West',
    trafficData: {
      intersectionId: '2',
      vehicleCount: 165,
      congestionLevel: 'High',
      waitTime: 200,
      status: 'Incident',
      timestamp: new Date().toISOString(),
      twoWheelers: 95,
      autoRickshaws: 30,
      buses: 10
    }
  },
  // West India
  {
    id: '3',
    name: 'Marine Drive Junction',
    location: '18.9442,72.8235', // Mumbai
    currentPhase: 'North-South',
    trafficData: {
      intersectionId: '3',
      vehicleCount: 123,
      congestionLevel: 'Medium',
      waitTime: 120,
      status: 'Normal',
      timestamp: new Date().toISOString(),
      twoWheelers: 65,
      autoRickshaws: 20,
      buses: 5
    }
  },
  {
    id: '4',
    name: 'SG Highway Crossing',
    location: '23.0225,72.5714', // Ahmedabad
    currentPhase: 'East-West',
    trafficData: {
      intersectionId: '4',
      vehicleCount: 110,
      congestionLevel: 'Medium',
      waitTime: 90,
      status: 'Normal',
      timestamp: new Date().toISOString(),
      twoWheelers: 60,
      autoRickshaws: 15,
      buses: 4
    }
  },
  // South India
  {
    id: '5',
    name: 'MG Road & Brigade Road',
    location: '12.9719,77.6186', // Bangalore
    currentPhase: 'North-South',
    trafficData: {
      intersectionId: '5',
      vehicleCount: 95,
      congestionLevel: 'High',
      waitTime: 150,
      status: 'Incident',
      timestamp: new Date().toISOString(),
      twoWheelers: 55,
      autoRickshaws: 15,
      buses: 6
    }
  },
  {
    id: '6',
    name: 'Anna Salai Junction',
    location: '13.0500,80.2824', // Chennai
    currentPhase: 'East-West',
    trafficData: {
      intersectionId: '6',
      vehicleCount: 135,
      congestionLevel: 'High',
      waitTime: 160,
      status: 'Normal',
      timestamp: new Date().toISOString(),
      twoWheelers: 75,
      autoRickshaws: 22,
      buses: 7
    }
  },
  // East India
  {
    id: '7',
    name: 'Park Street Crossing',
    location: '22.5551,88.3517', // Kolkata
    currentPhase: 'North-South',
    trafficData: {
      intersectionId: '7',
      vehicleCount: 85,
      congestionLevel: 'Medium',
      waitTime: 90,
      status: 'Normal',
      timestamp: new Date().toISOString(),
      twoWheelers: 45,
      autoRickshaws: 18,
      buses: 4
    }
  },
  {
    id: '8',
    name: 'Patna Junction',
    location: '25.5941,85.1376', // Patna
    currentPhase: 'East-West',
    trafficData: {
      intersectionId: '8',
      vehicleCount: 75,
      congestionLevel: 'Medium',
      waitTime: 80,
      status: 'Normal',
      timestamp: new Date().toISOString(),
      twoWheelers: 40,
      autoRickshaws: 15,
      buses: 3
    }
  },
  // Central India
  {
    id: '9',
    name: 'MP Nagar Zone 1',
    location: '23.2599,77.4126', // Bhopal
    currentPhase: 'North-South',
    trafficData: {
      intersectionId: '9',
      vehicleCount: 65,
      congestionLevel: 'Low',
      waitTime: 60,
      status: 'Normal',
      timestamp: new Date().toISOString(),
      twoWheelers: 35,
      autoRickshaws: 12,
      buses: 3
    }
  },
  {
    id: '10',
    name: 'Sitabuldi Main Road',
    location: '21.1458,79.0882', // Nagpur
    currentPhase: 'East-West',
    trafficData: {
      intersectionId: '10',
      vehicleCount: 70,
      congestionLevel: 'Low',
      waitTime: 45,
      status: 'Normal',
      timestamp: new Date().toISOString(),
      twoWheelers: 38,
      autoRickshaws: 14,
      buses: 2
    }
  },
  // Northeast India
  {
    id: '11',
    name: 'GS Road Junction',
    location: '26.1445,91.7362', // Guwahati
    currentPhase: 'North-South',
    trafficData: {
      intersectionId: '11',
      vehicleCount: 55,
      congestionLevel: 'Low',
      waitTime: 40,
      status: 'Normal',
      timestamp: new Date().toISOString(),
      twoWheelers: 30,
      autoRickshaws: 10,
      buses: 2
    }
  },
  {
    id: '12',
    name: 'MG Marg Crossing',
    location: '27.3314,88.6138', // Gangtok
    currentPhase: 'East-West',
    trafficData: {
      intersectionId: '12',
      vehicleCount: 45,
      congestionLevel: 'Low',
      waitTime: 30,
      status: 'Normal',
      timestamp: new Date().toISOString(),
      twoWheelers: 25,
      autoRickshaws: 8,
      buses: 2
    }
  }
];