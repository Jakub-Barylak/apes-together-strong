"use client";

import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import { greenIcon, blueIcon, redIcon } from "@/assets/mapMarkers";
import { AtsEvent, LatLng, MapLibs } from "@/types/types";

const DEFAULT_CENTER: LatLng = [50.288636634077264, 18.677458290326385]; // AEI

export default function MapClient({
  events,
  draftPosition,
  onClickCallback,
  onPanCallback,
  onMarkerCallback,
}: {
  events: AtsEvent[];
  draftPosition: LatLng | null;
  onClickCallback: (latlng: LatLng) => void;
  onPanCallback: (bounds: any) => void;
  onMarkerCallback: (event: AtsEvent) => void;
}) {
  const [libs, setLibs] = useState<MapLibs | null>(null);
  const [userPos, setUserPos] = useState<LatLng | null>(null);
  const [userAccuracy, setUserAccuracy] = useState<number | null>(null);
  const [initialized, setInitialized] = useState(false);

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
        Circle: RL.Circle,
        CircleMarker: RL.CircleMarker,
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
        const { latitude, longitude, accuracy } = pos.coords;
        setUserPos([latitude, longitude]);
        setUserAccuracy(accuracy);
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

  const {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    useMap,
    Circle,
    CircleMarker,
  } = libs;
  const initialCenter = DEFAULT_CENTER;

  function RecenterOnUser({ position }: { position: LatLng }) {
    const map = useMap();
    const [hasCentered, setHasCentered] = useState(false);

    useEffect(() => {
      if (!position || hasCentered) return;
      map.setView(position, 13);
    }, [map, position, hasCentered]);

    return null;
  }

  function OneTimeCenterOnUser() {
    const map = useMap();

    useEffect(() => {
      if (userPos && !initialized) {
        map.setView(userPos, 13);
        setInitialized(true);
      }
    }, [map, userPos, initialized]);

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

        const target = e.originalEvent?.target as HTMLElement | null;

        if (target?.closest(".leaflet-marker-icon, .leaflet-interactive")) {
          start = null;
          return;
        }

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

  function MapBoundsListener({
    onChange,
  }: {
    onChange: (bounds: any) => void;
  }) {
    const map = useMap();

    useEffect(() => {
      const update = () => {
        const b = map.getBounds();
        onChange(b);
      };

      map.on("moveend", update);
      map.on("zoomend", update);

      update();

      return () => {
        map.off("moveend", update);
        map.off("zoomend", update);
      };
    }, [map, onChange]);

    return null;
  }

  return (
    <div className="h-full w-full">
      <MapContainer
        center={initialCenter} // podmień na swoje coords
        zoom={13}
        scrollWheelZoom
        className="h-full w-full"
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {events.map((event) => (
          <Marker
            key={event.id}
            position={event.position}
            icon={blueIcon}
            eventHandlers={{
              click() {
                onMarkerCallback(event);
              },
            }}
          />
        ))}
        {draftPosition && (
          <>
            <Marker position={draftPosition} icon={redIcon} />
          </>
        )}
        <Marker
          key={-1}
          position={DEFAULT_CENTER}
          icon={greenIcon}
          eventHandlers={{
            click() {
              onMarkerCallback({ id: -1, position: DEFAULT_CENTER });
            },
          }}
        >
          <Popup>Here be Apes 🐒</Popup>
        </Marker>
        <MapClickHandler onClick={onClickCallback} />
        <MapBoundsListener onChange={onPanCallback} />
        {userPos && (
          <>
            <CircleMarker
              center={userPos}
              radius={6}
              pathOptions={{
                color: "#2563eb",
                fillColor: "#3b82f6",
                fillOpacity: 1,
                weight: 2,
              }}
            />
            <Circle
              center={userPos}
              radius={userAccuracy ?? 500} // metry; fallback 500m
              pathOptions={{
                color: "#2563eb",
                fillColor: "#3b82f6",
                fillOpacity: 0.15,
                weight: 1,
              }}
            />
            <OneTimeCenterOnUser />
          </>
        )}
      </MapContainer>
    </div>
  );
}
