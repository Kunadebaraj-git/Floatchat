import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const OceanMap = ({ region, parameter, month, year, floatCount, onFloatSelect }) => {
  const [profiles, setProfiles] = useState([]);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Preloaded mock data
  const mockArgoData = {
    equator: [
      { id: '6902743', lat: 0.5, lon: -20.3, salinity: 35.2, temp: 28.1, depth: 2000 },
      { id: '6902744', lat: -0.3, lon: -15.7, salinity: 34.8, temp: 27.8, depth: 1500 },
      { id: '6902745', lat: 0.2, lon: -10.2, salinity: 35.5, temp: 28.3, depth: 1800 },
    ],
    pacific: [
      { id: '6902750', lat: 10.5, lon: -150.3, salinity: 34.5, temp: 25.1, depth: 1800 },
    ],
    atlantic: [
      { id: '6902760', lat: 15.5, lon: -45.3, salinity: 36.2, temp: 22.1, depth: 2100 },
    ],
    indian: [
      { id: '6902770', lat: -15.5, lon: 65.3, salinity: 35.8, temp: 26.1, depth: 2000 },
    ]
  };

  useEffect(() => {
    // Preload data immediately
    const regionData = mockArgoData[region.toLowerCase()] || mockArgoData.equator;
    setProfiles(regionData.slice(0, Math.min(floatCount, regionData.length)));
    
    // Simulate map loading
    const timer = setTimeout(() => setMapLoaded(true), 100);
    return () => clearTimeout(timer);
  }, [region, floatCount]);

  const createArgoIcon = (color) => {
    return L.divIcon({
      html: `
        <div style="
          background: ${color};
          width: 20px;
          height: 20px;
          border: 2px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 6px rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: bold;
        ">🌊</div>
      `,
      className: 'argo-float-marker',
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });
  };

  const getParameterColor = (value, param) => {
    const colors = {
      salinity: ['#4575b4', '#74add1', '#abd9e9', '#fee090', '#f46d43'],
      temperature: ['#313695', '#4575b4', '#74add1', '#abd9e9', '#fdae61']
    };
    const scale = colors[param] || colors.salinity;
    return scale[Math.min(4, Math.floor((value - 30) * 2))] || scale[2];
  };

  const getRegionCenter = (region) => {
    const centers = {
      equator: [0, -20],
      pacific: [10, -160],
      atlantic: [15, -45],
      indian: [-15, 70]
    };
    return centers[region.toLowerCase()] || [0, 0];
  };

  if (!mapLoaded) {
    return (
      <div className="w-full h-96 rounded-lg bg-gray-900/50 flex items-center justify-center border border-cyan-500/30">
        <div className="text-center">
          <div className="text-4xl mb-2">🌊</div>
          <p className="text-cyan-300">Loading Ocean Data Map...</p>
          <div className="mt-2 w-16 h-1 bg-cyan-500 rounded-full mx-auto animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-96 rounded-lg overflow-hidden border border-cyan-500/30">
      <MapContainer
        center={getRegionCenter(region)}
        zoom={3}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        preferCanvas={true} // Better performance
      >
        {/* SINGLE optimized tile layer */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          maxZoom={10}
          minZoom={2}
        />
        
        <ZoomControl position="topright" />

        {profiles.map((float) => (
          <Marker
            key={float.id}
            position={[float.lat, float.lon]}
            icon={createArgoIcon(getParameterColor(float[parameter], parameter))}
            eventHandlers={{
              click: () => onFloatSelect(float.id)
            }}
          >
            <Popup className="custom-popup">
              <div className="p-2 min-w-[200px]">
                <h3 className="font-bold text-cyan-700">ARGO Float {float.id}</h3>
                <div className="mt-2 space-y-1 text-sm">
                  <p><strong>Location:</strong> {float.lat}°N, {float.lon}°E</p>
                  <p><strong>Salinity:</strong> {float.salinity} PSU</p>
                  <p><strong>Temperature:</strong> {float.temp}°C</p>
                  <p><strong>Data:</strong> {month} {year}</p>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default OceanMap;