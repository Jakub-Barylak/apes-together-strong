"use client";
import Card from "@/components/card";
import EventTile from "@/components/EventTile";
import { InfoPanel } from "@/components/InfoPanel";
import MapClient from "@/components/mapClient";
import ProfileView from "@/components/ProfileView";
import { FormEvent, useEffect, useRef, useState } from "react";
import {
	InfoPanelHandle,
	LatLng,
	AtsEvent,
	MapBounds,
	DraftEvent,
	MapClientHandle,
	eventType,
	userType,
	Tag,
} from "@/types/types";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import { BananaButton } from "@/components/BananaButton";
import EventDetails from "@/components/EventDetails";

const API_HOST = process.env.NEXT_PUBLIC_API_HOST;

export default function DashboardPage() {
	const infoRef = useRef<InfoPanelHandle | null>(null);
	const addRef = useRef<InfoPanelHandle | null>(null);
	const mapRef = useRef<MapClientHandle | null>(null);

	const boundsDebounceRef = useRef<NodeJS.Timeout | null>(null);

	const [events, setEvents] = useState<AtsEvent[]>([]);
	const [draftPosition, setDraftPosition] = useState<LatLng | null>(null);
	const [draftEvent, setDraftEvent] = useState<DraftEvent | null>();
	const [currentEvent, setCurrentEvent] = useState<AtsEvent | null>();

	const [mapBounds, setMapBounds] = useState<MapBounds | null>(null);
	const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

	const [eventsError, setEventsError] = useState<string | null>(null);

	const [myEvents, setMyEvents] = useState<eventType[]>([]);
	const [hasLoadedMyEvents, setHasLoadedMyEvents] = useState(false);

	const { data: session, status } = useSession();

	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [locationName, setLocationName] = useState("");
	const [date, setDate] = useState<Date | null>(null);
	const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);

	const [recommendedEvents, setRecommendedEvents] = useState<any[]>([]);

	const [tags, setTags] = useState<Tag[]>([]);
	const [centerRequest, setCenterRequest] = useState<{
		position: LatLng;
		zoom?: number;
		requestId: number;
	} | null>(null);

	const getLatLngFromEvent = (
		event: Partial<AtsEvent> & Partial<eventType>
	): LatLng | null => {
		if (event.position && Array.isArray(event.position)) {
			return event.position as LatLng;
		}
		if (
			event.latitude !== undefined &&
			event.longitude !== undefined &&
			event.latitude !== null &&
			event.longitude !== null
		) {
			const lat = Number(event.latitude);
			const lng = Number(event.longitude);
			if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
				return [lat, lng];
			}
		}
		return null;
	};

	const toAtsEvent = (event: eventType): AtsEvent => {
		// @ts-ignore
		const coords = getLatLngFromEvent(event) ?? [0, 0];
		return {
			id: event.id,
			title: event.title,
			description: event.description,
			date: event.date,
			position: coords,
			organizer: event.organizer ?? Number(event.host) ?? 0,
			tags: event.tags ?? [],
			location_name: event.location_name,
			personality: (event.personality ?? []).map((p) => p.toString()),
		};
	};

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

	const joinEvent = async (eventId: number) => {
		if (!session) return;
		if (!API_HOST) {
			console.error("NEXT_PUBLIC_API_HOST is not set");
			return;
		}
		const url = `${API_HOST}/events/${eventId}/join/`;
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
			console.error("Error joining event:", error);
		} finally {
			fetchMyEvents();
		}
	};

	const fetchEvents = async () => {
		setEventsError(null);

		try {
			const { n, s, e, w } = mapBounds!;
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

	useEffect(() => {
		if (!mapBounds) return;
		if (!API_HOST) {
			return;
		}
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

			const mergedEvents: eventType[] = Array.from(
				mergedById.values()
			).map((evt) => ({
				id: evt.id,
				title: evt.title,
				description: evt.description,
				date: evt.date,
				latitude: evt.latitude,
				longitude: evt.longitude,
				location_name: evt.location_name,
				host:
					evt.host ??
					(evt.organizer !== undefined
						? String(evt.organizer)
						: undefined),
				organizer: evt.organizer,
				tags: evt.tags ?? [],
				personality: evt.personality ?? [],
				starred: evt.starred ?? false,
			}));

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
			console.error(
				"No access token available, cannot fetch user events"
			);
			return;
		}
		fetchMyEvents();
	}, [API_HOST, hasLoadedMyEvents, session, status]);

	useEffect(() => {
		// TODO: fetch all tags
		const fetchTags = async () => {
			try {
				if (status === "loading") return;
				console.log(session);
				const res = await fetch(
					`${process.env.NEXT_PUBLIC_API_HOST}/tags/`,
					{
						method: "GET",
						headers: {
							"Content-Type": "application/json",
							Authorization: `Bearer ${session?.accessToken}`,
						},
					}
				);

				const tagsResponse = await res.json();
				console.log(tagsResponse);
				setTags(tagsResponse);
			} catch (error) {
				toast.error("Cannot load tags.");
			}
		};

		fetchTags();
	}, [status]);

	useEffect(() => {
		setTitle("");
		setDescription("");
		setLocationName("");
		setDate(null);
		setSelectedTagIds([]);
	}, [draftPosition]);

	const handleConfirmAdd = async (e: FormEvent) => {
		e.preventDefault();

		if (!draftPosition) return;

		const newEvent = {
			title,
			description,
			date,
			latitude: draftPosition[0],
			longitude: draftPosition[1],
			location_name: locationName,
			tags: selectedTagIds,
		};
		const eventBody = JSON.stringify(newEvent);

		const res = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/events/`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${session?.accessToken}`,
			},
			body: eventBody,
		});

		if (!res.ok) {
			toast.error("Could not load nearby events.");
			return;
		}

		fetchEvents();

		// setDraftEvent(newEvent);
		// setEvents((prevEvents) => [...prevEvents, newEvent]);
		setDraftPosition(null);
		addRef.current?.close();
	};

	useEffect(() => {
		const fetchReccomended = async () => {
			const res = await fetch(
				`${process.env.NEXT_PUBLIC_API_HOST}/events/reccommendations/`,
				{
					method: "GET",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${session?.accessToken}`,
					},
				}
			);
			const recommendedEvents_res = await res.json();
			console.log(recommendedEvents_res);
			setRecommendedEvents(recommendedEvents_res);
		};

		if (status === "loading") {
			return;
		}

		fetchReccomended();
	}, [status]);

	const onDetailsClick = (event: any) => {
		const coords =
			//@ts-ignore
			getLatLngFromEvent(event);
		if (coords) {
			console.log("Centering on", coords, event);
			if (!mapRef.current) {
				console.warn("Map ref not ready");
			}
			setCenterRequest({
				position: coords,
				zoom: 15,
				requestId: Date.now(),
			});
		} else {
			console.warn("Missing coords for event", event);
		}
		setCurrentEvent(toAtsEvent(event));
		infoRef.current?.open();
	};

	if (!session) {
		return <div>Loading...</div>;
	}

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
								{recommendedEvents.map((event, index) => {
									return (
										<Card
											key={index}
											title={event.title}
											author={event.title}
											imageUrl="https://images.pexels.com/photos/33129/popcorn-movie-party-entertainment.jpg"
											sponsored={index === 0}
										/>
									);
								})}
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
									onDetailsClick={() => onDetailsClick(event)}
									onStarClick={() => updateSelection(event)}
								/>
							))}
						</div>
					</div>
					<div>
						<h2 className="text-ats-green-500 font-extrabold text-2xl">
							Events nearby
						</h2>
						{events.map((event, index) => {
							// let isStarred = false;
							// myEvents.forEach(myEvent => {
							// 	if (event.id === myEvent.id && parseInt(session.user.id) !== myEvent.organizer) {
							// 		isStarred = true;
							// 	}
							// });

							const newEvent: eventType = {
								date: event.date,
								description: event.description,
								id: event.id,
								latitude: event.position[0],
								longitude: event.position[1],
								location_name: event.location_name,
								tags: event.tags,
								title: event.title,
								organizer: event.organizer,
								personality: [], // TODO map
								starred: false,
							};
							return (
								<EventTile
									key={index}
									event={newEvent}
									onDetailsClick={() =>
										onDetailsClick(newEvent)
									}
									onStarClick={() =>
										updateSelection(newEvent)
									}
								/>
							);
						})}
					</div>
				</div>
			</main>
			<div className="relative">
				<div className="w-[calc(100%+0.5rem)] h-full overflow-hidden backdrop-blur-xl border -ml-2">
					<MapClient
						ref={mapRef}
						// @ts-ignore
						centerTarget={centerRequest}
						events={events}
						draftPosition={draftPosition}
						onClickCallback={(latlng) => {
							console.log(latlng);
							setDraftPosition(latlng);
							addRef.current?.open();
						}}
						onMarkerCallback={(marker) => {
							if (marker.id < 0) return;
							setCurrentEvent(marker);
							infoRef.current?.open();
						}}
						onPanCallback={handleMapBoundsChange}
					/>
				</div>
				<InfoPanel
					ref={infoRef}
					headerComponent={
						<h1 className="font-extrabold">
							{currentEvent?.title}
						</h1>
					}
					onClose={() => setCurrentEvent(null)}
				>
					<div>
						<EventDetails
							event={currentEvent}
							tags={tags}
							onJoin={() => {
								joinEvent(currentEvent!.id);
							}}
						/>
					</div>
				</InfoPanel>
				<InfoPanel
					ref={addRef}
					headerComponent={
						<h2 className="text-xl font-semibold mb-4">
							Add new event
						</h2>
					}
					onClose={() => {
						setDraftEvent(null);
						setDraftPosition(null);
					}}
				>
					{/* TODO: add tags */}
					<form
						className="flex flex-col gap-4 overflow-y-auto"
						onSubmit={handleConfirmAdd}
					>
						{/* Tytuł */}
						<div className="flex flex-col gap-1">
							<label
								htmlFor="name"
								className="text-sm font-medium text-gray-700"
							>
								Event title
							</label>
							<input
								id="name"
								type="text"
								required
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								placeholder="e.g. Ape meetup"
							/>
						</div>

						{/* Opis */}
						<div className="flex flex-col gap-1">
							<label
								htmlFor="description"
								className="text-sm font-medium text-gray-700"
							>
								Description
							</label>
							<textarea
								id="description"
								required
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								className="border border-gray-300 rounded-md px-3 py-2 text-sm h-20 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								placeholder="Short description of the event"
							/>
						</div>

						{/* Lokalizacja */}
						<div className="flex flex-col gap-1">
							<label
								htmlFor="locationName"
								className="text-sm font-medium text-gray-700"
							>
								Location name
							</label>
							<input
								id="locationName"
								required
								value={locationName}
								onChange={(e) =>
									setLocationName(e.target.value)
								}
								className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								placeholder="e.g. Main stage"
							/>
						</div>

						{/* Data */}
						<div className="flex flex-col gap-1">
							<label
								htmlFor="date"
								className="text-sm font-medium text-gray-700"
							>
								Start date
							</label>
							<input
								id="date"
								type="date"
								required
								onChange={(e) => {
									const val = e.target.value;
									if (!val) {
										setDate(null);
										return;
									}
									setDate(new Date(val));
								}}
								className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
							/>
						</div>

						{/* TAGI – multi select */}
						<div className="flex flex-col gap-2">
							<span className="text-sm font-medium text-gray-700">
								Tags
							</span>
							<p className="text-[11px] text-gray-500">
								You can choose multiple tags.
							</p>
							<div className="flex flex-wrap gap-2">
								{tags.map((tag) => {
									const isChecked = selectedTagIds.includes(
										tag.id
									);
									return (
										<label
											key={tag.id}
											className={`cursor-pointer text-xs px-3 py-1 rounded-full border transition 
              ${isChecked ? "bg-blue-500 text-white border-blue-500" : "bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100"}`}
										>
											<input
												type="checkbox"
												className="hidden"
												checked={isChecked}
												onChange={() => {
													setSelectedTagIds((prev) =>
														prev.includes(tag.id)
															? prev.filter(
																	(id) =>
																		id !==
																		tag.id
																)
															: [...prev, tag.id]
													);
												}}
											/>
											{tag.name}
										</label>
									);
								})}
							</div>
						</div>

						<BananaButton
							type="submit"
							label="Add event"
							className="max-w-[80%] self-center"
						/>
					</form>
				</InfoPanel>
			</div>
		</div>
	);
}
