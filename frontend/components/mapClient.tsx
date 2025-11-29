"use client";

import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";

type ReactLeafletModule = typeof import("react-leaflet");
type LeafletModule = typeof import("leaflet");

type MapLibs = {
  L: LeafletModule;
  MapContainer: ReactLeafletModule["MapContainer"];
  TileLayer: ReactLeafletModule["TileLayer"];
  Marker: ReactLeafletModule["Marker"];
  Popup: ReactLeafletModule["Popup"];
  useMap: ReactLeafletModule["useMap"];
};

type LatLng = [number, number];

const DEFAULT_CENTER: LatLng = [50.288636634077264, 18.677458290326385]; // AEI

export default function MapClient() {
  const [libs, setLibs] = useState<MapLibs | null>(null);
  const [userPos, setUserPos] = useState<LatLng | null>(null);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      const [L, RL] = await Promise.all([
        import("leaflet"),
        import("react-leaflet"),
      ]);

      // fix na ikony Leafleta w Next
      const iconRetinaUrl = (
        await import("leaflet/dist/images/marker-icon-2x.png")
      ).default;
      const iconUrl = (await import("leaflet/dist/images/marker-icon.png"))
        .default;
      const shadowUrl = (await import("leaflet/dist/images/marker-shadow.png"))
        .default;

      // @ts-expect-error – nadpisujemy prywatne pole
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl,
        iconUrl,
        shadowUrl,
      });

      if (!isMounted) return;

      setLibs({
        L,
        MapContainer: RL.MapContainer,
        TileLayer: RL.TileLayer,
        Marker: RL.Marker,
        Popup: RL.Popup,
        useMap: RL.useMap,
      });
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      console.log("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        console.log("User position:", pos);
        const { latitude, longitude } = pos.coords;
        setUserPos([latitude, longitude]);
      },
      (err) => {
        console.warn("Unable to retrieve your location", err);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, []);

  // jeszcze się ładuje react-leaflet / leaflet
  if (!libs) {
    return (
      <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">
        Loading map…
      </div>
    );
  }

  const { MapContainer, TileLayer, Marker, Popup, useMap } = libs;
  const center = userPos || DEFAULT_CENTER;

  function RecenterOnUser({ position }: { position: LatLng }) {
    const map = useMap();

    useEffect(() => {
      map.setView(position, 13);
    }, [map, position]);

    return null;
  }

  function MapClickHandler({ onClick }: { onClick: (latlng: LatLng) => void }) {
    const map = useMap();
    let start: { x: number; y: number } | null = null;

    useEffect(() => {
      const handleMouseDown = (e: any) => {
        start = { x: e.originalEvent.clientX, y: e.originalEvent.clientY };
      };

      const handleMouseUp = (e: any) => {
        if (!start) return;
        const dx = Math.abs(e.originalEvent.clientX - start.x);
        const dy = Math.abs(e.originalEvent.clientY - start.y);
        if (dx < 5 && dy < 5) {
          const { lat, lng } = e.latlng;
          onClick([lat, lng]);
        }

        start = null;
      };

      map.on("mousedown", handleMouseDown);
      map.on("mouseup", handleMouseUp);

      return () => {
        map.off("mousedown", handleMouseDown);
        map.off("mouseup", handleMouseUp);
      };
    }, [map, onClick]);

    return null;
  }

  return (
    <div className="h-full w-full">
      <MapContainer
        center={center} // podmień na swoje coords
        zoom={13}
        scrollWheelZoom
        className="h-full w-full"
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        <Marker position={DEFAULT_CENTER}>
          <Popup>Here be Apes 🐒</Popup>
        </Marker>
        {userPos && (
          <>
            <Marker position={userPos}>
              <Popup>Your location 📍</Popup>
            </Marker>
            <RecenterOnUser position={userPos} />
            <MapClickHandler
              onClick={(latlng) => {
                console.log("Map clicked at:", latlng);
              }}
            />
          </>
        )}
      </MapContainer>
    </div>
  );
}
