export interface TrafficData {
  intersectionId: string;
  vehicleCount: number;
  congestionLevel: 'Low' | 'Medium' | 'High';
  waitTime: number;
  status: 'Normal' | 'Incident' | 'Emergency';
  timestamp: string;
  twoWheelers: number;
  autoRickshaws: number;
  buses: number;
}

export interface Intersection {
  id: string;
  name: string;
  location: string; // Format: "latitude,longitude"
  currentPhase: 'North-South' | 'East-West';
  trafficData: TrafficData;
}

export interface RealTimeUpdate {
  intersectionId: string;
  vehicleCount: number;
  congestionLevel: 'Low' | 'Medium' | 'High';
  waitTime: number;
  status: 'Normal' | 'Incident' | 'Emergency';
  twoWheelers: number;
  autoRickshaws: number;
  buses: number;
  timestamp?: string;
}

export interface PredictedIncident {
  intersectionId: string;
  probability: number;
  predictedTime: string;
  severity: 'Low' | 'Medium' | 'High';
  type: string;
}

export interface TrafficControlAction {
  intersectionId: string;
  suggestedPhase: 'North-South' | 'East-West';
  phaseDuration: number;
  emergencyPriority: boolean;
  congestionAction: string;
  timestamp: string;
}