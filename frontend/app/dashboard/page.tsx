"use client";
import Card from "@/components/card";
import EventTile from "@/components/EventTile";
import { InfoPanel, type InfoPanelHandle } from "@/components/InfoPanel";
import MapClient from "@/components/mapClient";
import ProfileView from "@/components/ProfileView";
import { useRef } from "react";

export default function DashboardPage() {
  const infoRef = useRef<InfoPanelHandle | null>(null);
  return (
    <div className="grid grid-cols-[2fr_3fr] max-h-screen">
      <main className="shadow-2xl rounded-xl z-50 bg-white h-screen overflow-y-auto ">
        <header className="flex justify-between items-center w-full sticky top-0 z-1000 bg-white shadow-md px-6 py-4 mb-4">
          <img
            src="/logo.png"
            alt="Apes Together Strong Logo"
            className="h-12 w-auto"
          />
          <ProfileView
            user={{
              id: 1,
              username: "apeUser",
              email: "apeUser@example.com",
              bananas: 100,
              personality: [1, 2, 3],
              tags: [1, 2],
            }}
          />
        </header>
        <div className="flex flex-col gap-2 p-4">
          <div>
            <h2 className="text-ats-green-500 font-extrabold text-2xl">
              Recommendations
            </h2>
            <div className="overflow-x-scroll -mx-4">
              <div className="flex gap-4 py-2 h-50 w-fit px-4">
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
          </div>
          <div>
            <h2 className="text-ats-green-500 font-extrabold text-2xl">
              Your events
            </h2>
            <div className="flex flex-col gap-2">
              {[...Array(3)].map((_, index) => (
                <EventTile
                  key={index}
                  event={{
                    id: 1,
                    title: "Sample Event",
                    description: "This is a sample event.",
                    date: "2024-06-01",
                    latitude: 40.7128,
                    longitude: -74.006,
                    location_name: "New York",
                    host: "apeUser",
                    tags: [1, 2],
                    personality: [1, 2],
                  }}
                  onDetailsClick={() => {
                    console.log("Details clicked");
                  }}
                />
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-ats-green-500 font-extrabold text-2xl">
              Events nearby
            </h2>
            EVENTS NEARBY LIST
          </div>
        </div>
      </main>
      {/* MAP SECTION FROM THIS POINT */}
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
