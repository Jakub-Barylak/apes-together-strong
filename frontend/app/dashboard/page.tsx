"use client";
import Card from "@/components/card";
import { InfoPanel, type InfoPanelHandle } from "@/components/InfoPanel";
import MapClient from "@/components/mapClient";
import { useRef } from "react";

export default function DashboardPage() {
  const infoRef = useRef<InfoPanelHandle | null>(null);
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
            events={[]}
            onClickCallback={(latlng) => {
              console.log(latlng);
              infoRef.current?.open();
            }}
            onMarkerCallback={(marker) => {
              console.log(marker);
            }}
            onPanCallback={(bounds) => console.log(bounds)}
          />
        </div>
        <InfoPanel ref={infoRef} headerComponent={<>Header</>}>
          INFO PANEL CONTENT
        </InfoPanel>
      </div>
    </div>
  );
}
