import { TrafficData, Intersection, PredictedIncident, TrafficControlAction } from '../types';

// AI model for traffic prediction and control
class TrafficAIController {
  private historicalData: Map<string, TrafficData[]> = new Map();
  private readonly HISTORY_WINDOW = 72; // 3 days in hours
  
  // Add new traffic data and maintain rolling window
  addTrafficData(intersection: Intersection) {
    const id = intersection.id;
    if (!this.historicalData.has(id)) {
      this.historicalData.set(id, []);
    }
    
    const data = this.historicalData.get(id)!;
    data.push(intersection.trafficData);
    
    // Keep only last 72 hours of data
    if (data.length > this.HISTORY_WINDOW) {
      data.shift();
    }
  }

  // Predict vehicle counts for an intersection
  predictVehicleCount(intersection: Intersection): {
    twoWheelers: number;
    autoRickshaws: number;
    buses: number;
  } {
    const currentData = intersection.trafficData;
    const historicalData = this.historicalData.get(intersection.id);
    
    // Get time-based factors
    const hour = new Date().getHours();
    const isRushHour = (hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 19);
    const isNightTime = hour >= 22 || hour <= 5;
    
    // Base variation percentages
    const baseVariation = Math.random() * 0.2 - 0.1; // -10% to +10%
    
    // Time-based adjustments
    const timeMultiplier = isRushHour ? 1.3 : 
                          isNightTime ? 0.6 : 
                          1.0;
    
    // Historical trend analysis
    let trendMultiplier = 1.0;
    if (historicalData && historicalData.length > 0) {
      const recentTrend = this.analyzeTrend(historicalData.slice(-3));
      trendMultiplier = recentTrend > 0 ? 1.1 : 
                        recentTrend < 0 ? 0.9 : 
                        1.0;
    }
    
    // Calculate new vehicle counts
    const calculateNewCount = (current: number) => {
      return Math.round(
        current * (1 + baseVariation) * timeMultiplier * trendMultiplier
      );
    };
    
    return {
      twoWheelers: calculateNewCount(currentData.twoWheelers),
      autoRickshaws: calculateNewCount(currentData.autoRickshaws),
      buses: calculateNewCount(currentData.buses)
    };
  }

  // Predict incidents based on historical patterns
  predictIncidents(intersection: Intersection): PredictedIncident | null {
    const data = this.historicalData.get(intersection.id);
    if (!data || data.length < 24) return null; // Need at least 24 hours of data
    
    const recentData = data.slice(-24);
    
    // Calculate trend indicators
    const congestionTrend = this.analyzeCongestionTrend(recentData);
    const waitTimeTrend = this.analyzeWaitTimeTrend(recentData);
    const vehicleCountTrend = this.analyzeVehicleCountTrend(recentData);
    
    // Incident prediction logic
    if (this.shouldPredictIncident(congestionTrend, waitTimeTrend, vehicleCountTrend)) {
      return {
        intersectionId: intersection.id,
        probability: this.calculateIncidentProbability(congestionTrend, waitTimeTrend, vehicleCountTrend),
        predictedTime: this.predictIncidentTime(recentData),
        severity: this.predictIncidentSeverity(congestionTrend, waitTimeTrend, vehicleCountTrend),
        type: this.determineIncidentType(recentData)
      };
    }
    
    return null;
  }

  // Suggest traffic control actions
  suggestTrafficControl(intersection: Intersection): TrafficControlAction {
    const currentData = intersection.trafficData;
    
    // Determine optimal phase duration
    const optimalPhaseDuration = this.calculateOptimalPhaseDuration(currentData);
    
    // Calculate emergency vehicle priority
    const needsEmergencyPriority = this.checkEmergencyVehiclePriority(currentData);
    
    // Determine if congestion requires intervention
    const congestionAction = this.determineCongestionAction(currentData);
    
    return {
      intersectionId: intersection.id,
      suggestedPhase: this.determineOptimalPhase(intersection),
      phaseDuration: optimalPhaseDuration,
      emergencyPriority: needsEmergencyPriority,
      congestionAction,
      timestamp: new Date().toISOString()
    };
  }

  private analyzeTrend(data: TrafficData[]): number {
    if (data.length < 2) return 0;
    
    const changes = data.slice(1).map((curr, index) => 
      curr.vehicleCount - data[index].vehicleCount
    );
    
    return changes.reduce((sum, change) => sum + change, 0) / changes.length;
  }

  private analyzeCongestionTrend(data: TrafficData[]): number {
    return data.reduce((acc, curr) => 
      acc + (curr.congestionLevel === 'High' ? 3 : 
             curr.congestionLevel === 'Medium' ? 2 : 1), 0) / data.length;
  }

  private analyzeWaitTimeTrend(data: TrafficData[]): number {
    return data.reduce((acc, curr) => acc + curr.waitTime, 0) / data.length;
  }

  private analyzeVehicleCountTrend(data: TrafficData[]): number {
    return data.reduce((acc, curr) => acc + curr.vehicleCount, 0) / data.length;
  }

  private shouldPredictIncident(
    congestionTrend: number,
    waitTimeTrend: number,
    vehicleCountTrend: number
  ): boolean {
    return congestionTrend > 2.5 || 
           waitTimeTrend > 180 || 
           vehicleCountTrend > 200;
  }

  private calculateIncidentProbability(
    congestionTrend: number,
    waitTimeTrend: number,
    vehicleCountTrend: number
  ): number {
    const congestionWeight = 0.4;
    const waitTimeWeight = 0.35;
    const vehicleCountWeight = 0.25;
    
    const normalizedCongestion = Math.min(congestionTrend / 3, 1);
    const normalizedWaitTime = Math.min(waitTimeTrend / 300, 1);
    const normalizedVehicleCount = Math.min(vehicleCountTrend / 300, 1);
    
    return (
      normalizedCongestion * congestionWeight +
      normalizedWaitTime * waitTimeWeight +
      normalizedVehicleCount * vehicleCountWeight
    ) * 100;
  }

  private predictIncidentTime(data: TrafficData[]): string {
    const now = new Date();
    const predictedHours = this.calculatePredictedTimeOffset(data);
    const predictedTime = new Date(now.getTime() + predictedHours * 60 * 60 * 1000);
    return predictedTime.toISOString();
  }

  private calculatePredictedTimeOffset(data: TrafficData[]): number {
    const trendAcceleration = this.calculateTrendAcceleration(data);
    return Math.max(1, Math.min(24, Math.round(12 / trendAcceleration)));
  }

  private calculateTrendAcceleration(data: TrafficData[]): number {
    if (data.length < 2) return 1;
    
    const recent = data.slice(-12);
    const older = data.slice(-24, -12);
    
    const recentAvg = this.analyzeWaitTimeTrend(recent);
    const olderAvg = this.analyzeWaitTimeTrend(older);
    
    return Math.max(0.1, recentAvg / olderAvg);
  }

  private predictIncidentSeverity(
    congestionTrend: number,
    waitTimeTrend: number,
    vehicleCountTrend: number
  ): 'Low' | 'Medium' | 'High' {
    const severityScore = this.calculateIncidentProbability(
      congestionTrend,
      waitTimeTrend,
      vehicleCountTrend
    );
    
    if (severityScore > 75) return 'High';
    if (severityScore > 50) return 'Medium';
    return 'Low';
  }

  private determineIncidentType(data: TrafficData[]): string {
    const recentData = data.slice(-3);
    
    if (this.isAccidentPattern(recentData)) return 'Accident';
    if (this.isEventCongestion(recentData)) return 'Event Congestion';
    if (this.isWeatherRelated(recentData)) return 'Weather Related';
    return 'General Congestion';
  }

  private isAccidentPattern(data: TrafficData[]): boolean {
    return data.some(d => d.status === 'Emergency');
  }

  private isEventCongestion(data: TrafficData[]): boolean {
    return data.every(d => d.vehicleCount > 150);
  }

  private isWeatherRelated(data: TrafficData[]): boolean {
    return data.every(d => d.waitTime > 200);
  }

  private calculateOptimalPhaseDuration(data: TrafficData): number {
    const baseTime = 30;
    const congestionFactor = data.congestionLevel === 'High' ? 2 :
                            data.congestionLevel === 'Medium' ? 1.5 : 1;
    
    return Math.round(baseTime * congestionFactor);
  }

  private checkEmergencyVehiclePriority(data: TrafficData): boolean {
    return data.status === 'Emergency';
  }

  private determineCongestionAction(data: TrafficData): string {
    if (data.congestionLevel === 'High' && data.waitTime > 180) {
      return 'Implement emergency traffic flow measures';
    }
    if (data.congestionLevel === 'Medium' && data.waitTime > 120) {
      return 'Extend green phase duration';
    }
    return 'Maintain normal operation';
  }

  private determineOptimalPhase(intersection: Intersection): 'North-South' | 'East-West' {
    const currentPhase = intersection.currentPhase;
    const data = intersection.trafficData;
    
    if (data.congestionLevel === 'High' && data.waitTime > 240) {
      return currentPhase === 'North-South' ? 'East-West' : 'North-South';
    }
    
    return currentPhase;
  }
}

export const aiController = new TrafficAIController();