"use client";
import Card from "@/components/card";
import EventTile from "@/components/EventTile";
import { InfoPanel } from "@/components/InfoPanel";
import MapClient from "@/components/mapClient";
import ProfileView from "@/components/ProfileView";
import { useEffect, useRef, useState } from "react";
import {
  InfoPanelHandle,
  LatLng,
  AtsEvent,
  MapBounds,
  eventType,
} from "@/types/types";
import { useSession } from "next-auth/react";

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

  const [myEvents, setMyEvents] = useState<eventType[]>([]);
  const [hasLoadedMyEvents, setHasLoadedMyEvents] = useState(false);

  const { data: session, status } = useSession();

  const handleMapBoundsChange = (bounds: any) => {
    if (boundsDebounceRef.current) {
      clearTimeout(boundsDebounceRef.current);
    }

    boundsDebounceRef.current = setTimeout(() => {
      const newBounds = {
        n: bounds.getNorth(),
        s: bounds.getSouth(),
        e: bounds.getEast(),
        w: bounds.getWest(),
      };

      setMapBounds((prev) => {
        if (!prev) {
          return newBounds;
        }

        const same =
          prev.n === newBounds.n &&
          prev.s === newBounds.s &&
          prev.e === newBounds.e &&
          prev.w === newBounds.w;

        if (same) {
          return prev;
        }

        return newBounds;
      });
    }, 300);
  };

  useEffect(() => {
    if (!mapBounds) return;
    if (!API_HOST) {
      return;
    }

    const fetchEvents = async () => {
      setEventsError(null);

      try {
        const { n, s, e, w } = mapBounds;
        const url = `${API_HOST}/events?n=${n}&s=${s}&e=${e}&w=${w}`;
        console.log("Fetching events from:", url);

        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: any[] = await response.json();

        console.log(data);

        const mapped: AtsEvent[] = data.map((item: any) => ({
          id: item.id,
          position: [item.latitude, item.longitude],
          organizer: item.organizer,
          title: item.title,
          description: item.description,
          tags: item.tags,
          location_name: item.location_name,
          date: item.date,
          personality: item.personality,
        }));

        setEvents(mapped);
        setHasLoadedOnce(true);
      } catch (error: any) {
        console.error("Error fetching events:", error);
        setEventsError(error.message);
      }
    };

    fetchEvents();
  }, [mapBounds]);

  useEffect(() => {
    if (hasLoadedMyEvents) return;

    // Fetch user's events here and set them to state
    // TODO!!!
  }, [hasLoadedMyEvents]);

  const handleConfirmAdd = () => {
    if (!draftPosition) return;

    const newEvent: AtsEvent = {
      id: -1,
      date: Date.now().toString(),
      position: draftPosition,
      organizer: 1,
      title: "New Event",
      description: "Description",
      tags: [],
      location_name: "Unknown",
      personality: [],
    };
    setEvents((prevEvents) => [...prevEvents, newEvent]);
    setDraftPosition(null);
    addRef.current?.close();
  };

  return (
    <div className="grid grid-cols-[2fr_3fr] h-screen">
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
