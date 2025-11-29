"use client";
import Card from "@/components/card";
import { InfoPanel } from "@/components/InfoPanel";
import MapClient from "@/components/mapClient";
import { useRef, useState } from "react";
import { useMap } from "react-leaflet";
import { InfoPanelHandle } from "@/types/types";
import { LatLng, AtsEvent } from "@/types/types";

export default function DashboardPage() {
  const infoRef = useRef<InfoPanelHandle | null>(null);
  const addRef = useRef<InfoPanelHandle | null>(null);

  const [events, setEvents] = useState<AtsEvent[]>([]);
  const [draftPosition, setDraftPosition] = useState<LatLng | null>(null);

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
            onPanCallback={(bounds) => console.log(bounds)}
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
