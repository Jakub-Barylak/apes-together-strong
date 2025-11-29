"use client";
import Card from "@/components/card";
import { InfoPanel } from "@/components/InfoPanel";
import MapClient from "@/components/mapClient";
import { useEffect, useRef, useState } from "react";
import { InfoPanelHandle, LatLng, AtsEvent, MapBounds } from "@/types/types";

const API_HOST = process.env.NEXT_PUBLIC_API_HOST;

export default function DashboardPage() {
  const infoRef = useRef<InfoPanelHandle | null>(null);
  const addRef = useRef<InfoPanelHandle | null>(null);

  const boundsDebounceRef = useRef<NodeJS.Timeout | null>(null);

  const [events, setEvents] = useState<AtsEvent[]>([]);
  const [draftPosition, setDraftPosition] = useState<LatLng | null>(null);

  const [mapBounds, setMapBounds] = useState<MapBounds | null>(null);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  const [eventsError, setEventsError] = useState<string | null>(null);

  const handleMapBoundsChange = (bounds: any) => {
    if (boundsDebounceRef.current) {
      clearTimeout(boundsDebounceRef.current);
    }

    boundsDebounceRef.current = setTimeout(() => {
      setMapBounds({
        n: bounds.getNorth(),
        s: bounds.getSouth(),
        e: bounds.getEast(),
        w: bounds.getWest(),
      });
    }, 300);
  };

  useEffect(() => {
    if (!mapBounds || hasLoadedOnce) return;
    if (!API_HOST) {
      console.error("API_HOST is not defined");
      return;
    }

    const fetchEvents = async () => {
      setEventsError(null);

      try {
        const { n, s, e, w } = mapBounds;
        const url = `${API_HOST}/events?n=${n}&s=${s}&e=${e}&w=${w}`;
        console.log("Fetching events from:", url);

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: any[] = await response.json();

        const mapped: AtsEvent[] = data.map((item: any) => ({
          id: item.id,
          position: [item.latitude, item.longitude],
        }));

        setEvents(mapped);
        setHasLoadedOnce(true);
      } catch (error: any) {
        console.error("Error fetching events:", error);
        setEventsError(error.message);
      }
    };

    fetchEvents();
  }, [mapBounds, hasLoadedOnce]);

  const handleConfirmAdd = () => {
    if (!draftPosition) return;

    const newEvent: AtsEvent = {
      id: Date.now(),
      position: draftPosition,
    };
    setEvents((prevEvents) => [...prevEvents, newEvent]);
    setDraftPosition(null);
    addRef.current?.close();
  };

  return (
    <div className="grid grid-cols-2 h-screen">
      <main className="shadow-2xl rounded-xl p-4 z-50 bg-white">
        <header className="flex justify-between items-center w-full">
          <h1 className="w-auto">ATS</h1>
          <div className="w-auto">PROFILE PIC</div>
        </header>
        <h2 className="text-ats-green-500 font-extrabold text-xl">
          Recommendations
        </h2>
        <div className="overflow-x-scroll">
          <div
            className="flex gap-4 p-2 h-50 w-fit 
          "
          >
            {/* card-scroll */}
            {[...Array(5)].map((_, index) => (
              <Card
                key={index}
                title="Sample Title"
                author="Name"
                imageUrl="https://images.pexels.com/photos/33129/popcorn-movie-party-entertainment.jpg"
                sponsored={index % 2 === 0}
              />
            ))}
          </div>
        </div>
        <h2 className="text-ats-green-500 font-extrabold text-xl">
          Your events
        </h2>
        YOUR EVENTS LIST
        <h2 className="text-ats-green-500 font-extrabold text-xl">
          Events nearby
        </h2>
        EVENTS NEARBY LIST
      </main>
      <div className="relative">
        <div className="w-[calc(100%+0.5rem)] h-full overflow-hidden backdrop-blur-xl border -ml-2">
          <MapClient
            events={events}
            draftPosition={draftPosition}
            onClickCallback={(latlng) => {
              console.log(latlng);
              setDraftPosition(latlng);
              addRef.current?.open();
            }}
            onMarkerCallback={(marker) => {
              console.log(marker);
              infoRef.current?.open();
            }}
            onPanCallback={handleMapBoundsChange}
          />
        </div>
        <InfoPanel ref={infoRef} headerComponent={<>Header</>}>
          INFO PANEL CONTENT
        </InfoPanel>
        <InfoPanel
          ref={addRef}
          headerComponent={<>Add Event</>}
          onClose={() => {
            setDraftPosition(null);
          }}
        >
          ADD EVENT CONTENT
          <button onClick={handleConfirmAdd}>Confirm Add</button>
        </InfoPanel>
      </div>
    </div>
  );
}
