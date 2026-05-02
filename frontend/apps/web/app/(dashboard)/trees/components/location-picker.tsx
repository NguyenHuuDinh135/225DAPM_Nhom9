"use client";

import * as React from "react";
import { Map, MapMarker, MarkerContent, MapControls, type MapRef } from "@workspace/ui/components/ui/map";
import { TreePine } from "lucide-react";

interface LocationPickerProps {
  latitude: number;
  longitude: number;
  onChange: (lat: number, lng: number) => void;
}

export function LocationPicker({ latitude, longitude, onChange }: LocationPickerProps) {
  const mapRef = React.useRef<MapRef>(null);

  const handleMapClick = (e: any) => {
    const { lng, lat } = e.lngLat;
    onChange(lat, lng);
  };

  return (
    <div className="h-[300px] w-full rounded-2xl overflow-hidden border border-slate-200 relative">
      <Map
        ref={mapRef}
        center={[longitude || 108.206, latitude || 16.047]}
        zoom={15}
        onClick={handleMapClick}
        cursor="crosshair"
      >
        <MapControls showLocate showZoom />
        <MapMarker
            longitude={longitude}
            latitude={latitude}
            draggable
            onDragEnd={(coords) => onChange(coords.lat, coords.lng)}
        >
          <MarkerContent>
            <div className="size-8 bg-green-600 rounded-full flex items-center justify-center text-white shadow-lg border-2 border-white">
              <TreePine className="size-5" />
            </div>
          </MarkerContent>
        </MapMarker>
      </Map>
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-sm border border-slate-100 pointer-events-none">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tọa độ đang chọn</p>
        <p className="text-xs font-mono font-bold text-slate-700">{latitude.toFixed(6)}, {longitude.toFixed(6)}</p>
      </div>
      <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-green-600 text-white px-4 py-1.5 rounded-full shadow-lg text-[10px] font-bold uppercase tracking-widest animate-pulse pointer-events-none">
        Click hoặc kéo icon để chọn vị trí
      </div>
    </div>
  );
}
