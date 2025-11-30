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
  userType,
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

  const updateSelection = async (event: eventType) => {
    if (!session) return;
    if (!API_HOST) {
      console.error("NEXT_PUBLIC_API_HOST is not set");
      return;
    }
    let url;
    if (event.starred) {
      url = `${API_HOST}/events/${event.id}/leave/`;
    } else {
      url = `${API_HOST}/events/${event.id}/join/`;
    }
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error updating event selection:", error);
    } finally {
      fetchMyEvents();
    }
  };

  const fetchMyEvents = async () => {
    if (!session) return;
    try {
      const response = await fetch(`${API_HOST}/events/me`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.accessToken}`,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: { participating?: any[]; organizing?: any[] } =
        await response.json();
      console.log("User's events:", data);

      const organizing = data.organizing ?? [];
      const participating = data.participating ?? [];

      const mergedById = new Map<number, any>();

      organizing.forEach((evt) => {
        mergedById.set(evt.id, { ...evt, starred: false });
      });

      participating.forEach((evt) => {
        const existing = mergedById.get(evt.id);
        mergedById.set(evt.id, {
          ...(existing ?? evt),
          ...evt,
          starred: true, // starred when also participating
        });
      });

      const mergedEvents: eventType[] = Array.from(mergedById.values()).map(
        (evt) => ({
          id: evt.id,
          title: evt.title,
          description: evt.description,
          date: evt.date,
          latitude: evt.latitude,
          longitude: evt.longitude,
          location_name: evt.location_name,
          host:
            evt.host ??
            (evt.organizer !== undefined ? String(evt.organizer) : undefined),
          organizer: evt.organizer,
          tags: evt.tags ?? [],
          personality: evt.personality ?? [],
          starred: evt.starred ?? false,
        }),
      );

      setMyEvents(mergedEvents);
      setHasLoadedMyEvents(true);
    } catch (error) {
      console.error("Error fetching user's events:", error);
    }
  };

  useEffect(() => {
    if (hasLoadedMyEvents) return;
    if (status !== "authenticated") return;
    if (!API_HOST) {
      console.error("NEXT_PUBLIC_API_HOST is not set");
      return;
    }
    if (!session?.accessToken) {
      console.error("No access token available, cannot fetch user events");
      return;
    }
    fetchMyEvents();
  }, [API_HOST, hasLoadedMyEvents, session, status]);

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
          <ProfileView user={session?.user as unknown as userType} />
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
              {myEvents.map((event, index) => (
                <EventTile
                  key={index}
                  event={event}
                  onDetailsClick={() => {
                    console.log("Details clicked");
                  }}
                  onStarClick={() => updateSelection(event)}
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
