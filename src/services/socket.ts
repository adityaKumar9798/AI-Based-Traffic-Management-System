import { io } from 'socket.io-client';
import { RealTimeUpdate, Intersection } from '../types';
import { aiController } from './aiController';

const SOCKET_URL = 'YOUR_WEBSOCKET_SERVER_URL'; // Replace with your WebSocket server URL

export const socket = io(SOCKET_URL);

export const subscribeToUpdates = (callback: (update: RealTimeUpdate) => void) => {
  socket.on('trafficUpdate', (update: RealTimeUpdate) => {
    // Process update through AI controller
    const intersection: Intersection = {
      id: update.intersectionId,
      name: '', // This would be filled from your existing intersection data
      location: '', // This would be filled from your existing intersection data
      currentPhase: 'North-South', // This would be the actual current phase
      trafficData: {
        ...update,
        timestamp: new Date().toISOString()
      }
    };

    // Add data to AI controller for analysis
    aiController.addTrafficData(intersection);

    // Get AI predictions and control suggestions
    const prediction = aiController.predictIncidents(intersection);
    const controlAction = aiController.suggestTrafficControl(intersection);

    // If there's a high probability incident predicted, emit warning
    if (prediction && prediction.probability > 75) {
      socket.emit('incidentWarning', prediction);
    }

    // Emit control action suggestions
    socket.emit('controlAction', controlAction);

    // Call the original callback with the update
    callback(update);
  });

  return () => {
    socket.off('trafficUpdate');
  };
};