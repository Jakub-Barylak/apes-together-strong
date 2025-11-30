"use client";
import Card from "@/components/card";
import { InfoPanel } from "@/components/InfoPanel";
import MapClient from "@/components/mapClient";
import { FormEvent, useEffect, useRef, useState } from "react";
import { InfoPanelHandle, LatLng, AtsEvent, MapBounds, DraftEvent } from "@/types/types";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import { BananaButton } from "@/components/BananaButton";

const API_HOST = process.env.NEXT_PUBLIC_API_HOST;

export default function DashboardPage() {
	const infoRef = useRef<InfoPanelHandle | null>(null);
	const addRef = useRef<InfoPanelHandle | null>(null);

	const boundsDebounceRef = useRef<NodeJS.Timeout | null>(null);

	const [events, setEvents] = useState<AtsEvent[]>([]);
	const [draftPosition, setDraftPosition] = useState<LatLng | null>(null);
	const [draftEvent, setDraftEvent] = useState<DraftEvent | null>();
	const [currentEvent, setCurrentEvent] = useState<AtsEvent | null>();

	const [mapBounds, setMapBounds] = useState<MapBounds | null>(null);
	const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

	const [eventsError, setEventsError] = useState<string | null>(null);

	const { data: session, status } = useSession();

	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [locationName, setLocationName] = useState("");
	const [date, setDate] = useState<Date | null>(null);
	const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);

	type Tag = {
		id: number;
		name: string;
	}
	const [tags, setTags] = useState<Tag[]>([]);

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
			}

			setMapBounds((prev) => {
				if (!prev) {
					return newBounds;
				}

				const same = prev.n === newBounds.n &&
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
					Authorization: `Bearer ${session?.accessToken}`
				}
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data: any[] = await response.json();

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

	useEffect(() => {
		// TODO: fetch all tags
		const fetchTags = async () => {
			try {
				if (status === "loading") return;
				console.log(session);
				const res = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/tags/`, {
					method: "GET",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${session?.accessToken}`
					}
				});

				const tagsResponse = await res.json();
				console.log(tagsResponse);
				setTags(tagsResponse);
			} catch (error) {
				toast.error("Cannot load tags.");
			}

		};

		fetchTags();
	}, [status]);

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
			tags: selectedTagIds
		};
		const eventBody = JSON.stringify(newEvent);

		const res = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/events/`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${session?.accessToken}`
			},
			body: eventBody

		});

		if (!res.ok) {
			toast.error("Could not load nearby events.")
			return;
		}

		fetchEvents();

		// setDraftEvent(newEvent);
		// setEvents((prevEvents) => [...prevEvents, newEvent]);
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
						{/* TODO: list events */}
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
							setDraftPosition(latlng);
							addRef.current?.open();
						}}
						onMarkerCallback={(marker) => {
							setCurrentEvent(marker);
							infoRef.current?.open();
						}}
						onPanCallback={handleMapBoundsChange}
					/>
				</div>
				<InfoPanel ref={infoRef} headerComponent={<>Header</>} onClose={() => setCurrentEvent(null)}>
					<div>
						{/* TODO: wyświetlanie evenut */}
						{JSON.stringify(currentEvent)}
					</div>
				</InfoPanel>
				<InfoPanel
					ref={addRef}
					headerComponent={
						<h2 className="text-xl font-semibold mb-4">Add new event</h2>
					}
					onClose={() => {
						setDraftEvent(null);
						setDraftPosition(null);
					}}
				>
					{/* TODO: add tags */}
					<form
						className="bg-white/90 border border-gray-200 rounded-xl shadow-lg p-6 flex flex-col"
						onSubmit={handleConfirmAdd}
					>
						{/* Tytuł */}
						<div className="flex flex-col gap-1">
							<label htmlFor="name" className="text-sm font-medium text-gray-700">
								Event title
							</label>
							<input
								id="name"
								type="text"
								required
								value={title}
								onChange={e => setTitle(e.target.value)}
								className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								placeholder="e.g. Ape meetup"
							/>
						</div>

						{/* Opis */}
						<div className="flex flex-col gap-1">
							<label htmlFor="description" className="text-sm font-medium text-gray-700">
								Description
							</label>
							<textarea
								id="description"
								required
								value={description}
								onChange={e => setDescription(e.target.value)}
								className="border border-gray-300 rounded-md px-3 py-2 text-sm h-20 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								placeholder="Short description of the event"
							/>
						</div>

						{/* Lokalizacja */}
						<div className="flex flex-col gap-1">
							<label htmlFor="locationName" className="text-sm font-medium text-gray-700">
								Location name
							</label>
							<input
								id="locationName"
								required
								value={locationName}
								onChange={e => setLocationName(e.target.value)}
								className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
								placeholder="e.g. Main stage"
							/>
						</div>

						{/* Data */}
						<div className="flex flex-col gap-1">
							<label htmlFor="date" className="text-sm font-medium text-gray-700">
								Start date
							</label>
							<input
								id="date"
								type="date"
								required
								onChange={e => {
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
							<span className="text-sm font-medium text-gray-700">Tags</span>
							<p className="text-[11px] text-gray-500">
								You can choose multiple tags.
							</p>
							<div className="flex flex-wrap gap-2">
								{tags.map(tag => {
									const isChecked = selectedTagIds.includes(tag.id);
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
													setSelectedTagIds(prev =>
														prev.includes(tag.id)
															? prev.filter(id => id !== tag.id)
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

						<BananaButton type="submit" label="Add event" className="max-w-[80%] self-center" />
					</form>
				</InfoPanel>
			</div>
		</div >
	);
}
