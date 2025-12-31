import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, LayersControl } from 'react-leaflet';
import { AlertTriangle, Navigation } from 'lucide-react';
import { Intersection } from '../types';
import 'leaflet/dist/leaflet.css';

interface ActiveIncidentsProps {
  incidents: Intersection[];
  onClose: () => void;
}

const ActiveIncidents: React.FC<ActiveIncidentsProps> = ({ incidents, onClose }) => {
  const getMarkerIcon = () => {
    return L.divIcon({
      className: 'custom-marker',
      html: `<div style="
        background-color: #ef4444;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      "></div>`,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
  };

  const centerCoordinates = incidents.length > 0
    ? incidents[0].location.split(',').map(coord => parseFloat(coord))
    : [20.5937, 78.9629];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[1000] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b flex justify-between items-center bg-red-50">
          <div className="flex items-center">
            <AlertTriangle className="w-6 h-6 text-red-500 mr-2" />
            <h2 className="text-2xl font-bold text-gray-800">Active Incidents</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex">
          <div className="w-1/3 p-4 overflow-y-auto border-r">
            {incidents.map((incident) => (
              <div
                key={incident.id}
                className="mb-4 p-4 bg-red-50 rounded-lg border border-red-100"
              >
                <h3 className="font-semibold text-lg text-gray-800">{incident.name}</h3>
                <p className="text-red-600 font-medium mt-1">
                  Status: {incident.trafficData.status}
                </p>
                <div className="mt-2 space-y-1 text-sm text-gray-600">
                  <p>Congestion: {incident.trafficData.congestionLevel}</p>
                  <p>Wait Time: {incident.trafficData.waitTime}s</p>
                  <p>Vehicle Count: {incident.trafficData.vehicleCount}</p>
                  <p>Last Updated: {new Date(incident.trafficData.timestamp).toLocaleTimeString()}</p>
                </div>
                <div className="mt-3 flex items-center text-sm text-blue-600">
                  <Navigation className="w-4 h-4 mr-1" />
                  <span>{incident.location}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex-1 relative">
            <MapContainer
              center={centerCoordinates as [number, number]}
              zoom={12}
              className="w-full h-full"
              style={{ zIndex: 1 }}
            >
              <LayersControl position="topright">
                <LayersControl.BaseLayer name="Standard">
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                </LayersControl.BaseLayer>
                <LayersControl.BaseLayer checked name="Satellite">
                  <TileLayer
                    attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                  />
                </LayersControl.BaseLayer>
              </LayersControl>

              {incidents.map((incident) => {
                const [lat, lng] = incident.location.split(',').map(coord => parseFloat(coord));
                return (
                  <Marker
                    key={incident.id}
                    position={[lat, lng]}
                    icon={getMarkerIcon()}
                  >
                    <Popup>
                      <div className="p-2">
                        <h3 className="font-semibold">{incident.name}</h3>
                        <p className="text-sm text-red-600">Status: {incident.trafficData.status}</p>
                        <p className="text-sm text-gray-600">Congestion: {incident.trafficData.congestionLevel}</p>
                        <p className="text-sm text-gray-600">Wait Time: {incident.trafficData.waitTime}s</p>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActiveIncidents;