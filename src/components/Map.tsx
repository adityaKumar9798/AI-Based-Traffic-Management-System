import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, LayersControl } from 'react-leaflet';
import L from 'leaflet';
import { Intersection } from '../types';

interface MapProps {
  intersections: Intersection[];
  onIntersectionClick: (intersection: Intersection) => void;
}

const Map: React.FC<MapProps> = ({ intersections, onIntersectionClick }) => {
  useEffect(() => {
    // Force map to recalculate when data changes
    const timer = setTimeout(() => {
      const mapContainer = document.querySelector('.leaflet-container') as HTMLElement;
      if (mapContainer) {
        mapContainer.style.height = '500px';
        window.dispatchEvent(new Event('resize'));
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [intersections]);

  if (!intersections || intersections.length === 0) {
    return (
      <div className="w-full h-[500px] rounded-xl overflow-hidden shadow-lg bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading map data...</p>
        </div>
      </div>
    );
  }
  const getMarkerIcon = (status: string) => {
    const getColor = () => {
      switch (status) {
        case 'Normal': return '#22c55e';
        case 'Incident': return '#eab308';
        case 'Emergency': return '#ef4444';
        default: return '#22c55e';
      }
    };

    return L.divIcon({
      className: 'custom-marker',
      html: `<div style="
        background-color: ${getColor()};
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      "></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });
  };

  return (
    <div className="relative w-full h-[500px] rounded-xl overflow-hidden shadow-lg" style={{ zIndex: 1 }}>
      <MapContainer
        center={[20.5937, 78.9629]} // Center of India
        zoom={5}
        className="w-full h-full"
        style={{ zIndex: 1 }}
      >
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Standard">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Satellite">
            <TileLayer
              attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          </LayersControl.BaseLayer>
        </LayersControl>

        {/* Test marker to ensure markers work */}
        <Marker
          position={[20.5937, 78.9629]} // Center of India
          icon={getMarkerIcon('Normal')}
        >
          <Popup>
            <div className="p-2">
              <h3 className="font-semibold">Test Location</h3>
              <p className="text-sm text-gray-600">This should always be visible</p>
            </div>
          </Popup>
        </Marker>

        {intersections.map((intersection) => {
          console.log('Processing intersection:', intersection);
          const [lat, lng] = intersection.location.split(',').map(coord => parseFloat(coord));
          
          if (isNaN(lat) || isNaN(lng)) {
            console.error(`Invalid coordinates for intersection ${intersection.id}:`, intersection.location);
            return null;
          }

          console.log('Coordinates:', [lat, lng]);
          
          return (
            <Marker
              key={intersection.id}
              position={[lat, lng]}
              icon={getMarkerIcon(intersection.trafficData.status)}
              eventHandlers={{
                click: () => onIntersectionClick(intersection),
              }}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-semibold">{intersection.name}</h3>
                  <p className="text-sm text-gray-600">Status: {intersection.trafficData.status}</p>
                  <p className="text-sm text-gray-600">Two Wheelers: {intersection.trafficData.twoWheelers}</p>
                  <p className="text-sm text-gray-600">Auto Rickshaws: {intersection.trafficData.autoRickshaws}</p>
                  <p className="text-sm text-gray-600">Buses: {intersection.trafficData.buses}</p>
                  <p className="text-sm text-gray-600">Wait Time: {intersection.trafficData.waitTime}s</p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default Map;