import { AtsEvent } from "@/types/types";
import { Tag } from "@/types/types";
import { PERSONALITY_TYPES } from "@/assets/personalityTypes";

export default function EventDetails({
	event,
	tags,
}: {
	event: AtsEvent | null | undefined;
	tags: Tag[];
}) {
	if (!event) {
		return <div>No Event Selected</div>;
	}

	const eventTags = tags
		.filter((tag) => event.tags.includes(tag.id))
		.map((tag) => tag.name);

	const personalityLabels = PERSONALITY_TYPES.filter((type) =>
		// @ts-ignore
		event.personality.includes(type.id)
	).map((type) => type.label);

	return (
		<div className="flex flex-col justify-items-start gap-2">
			<p>
				<span className="font-bold">Event hosted by:</span>{" "}
				{event.organizer}
			</p>
			<p>
				<span className="font-bold">Description:</span>{" "}
				{event.description}
			</p>
			<p>
				<span className="font-bold">Location:</span>{" "}
				{event.location_name}
			</p>
			<p>
				<span className="font-bold">Date:</span>{" "}
				{new Date(event.date).toLocaleString()}
			</p>
			{eventTags.length > 0 && (
				<div>
					<span className="font-bold">Tags: </span>
					{eventTags.map((tag) => (
						<span
							key={tag}
							className="text-xs pl-3 pr-2 py-1 rounded-full border bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100 ml-1"
						>
							{tag}{" "}
						</span>
					))}
				</div>
			)}
			{personalityLabels.length > 0 && (
				<div>
					<span className="font-bold">Personality Types: </span>
					{personalityLabels.map((label) => (
						<label
							key={label}
							className="text-xs pl-3 pr-2 py-1 rounded-full border bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100 ml-1"
						>
							{label}{" "}
						</label>
					))}
				</div>
			)}
		</div>
	);
}

// {"id":1,"position":[50.29,18.66],"organizer":1,"title":"Pucowanie butów","description":"Pucowanie butów","tags":[1],"location_name":"string","date":"2025-11-30T23:51:10.178000Z","personality":[9,10,11,12]}
