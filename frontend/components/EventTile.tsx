import type { eventType } from "@/types/types";
import { StarIcon } from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";

export default function EventTile({
  event,
  onDetailsClick,
  onStarClick,
}: {
  event: eventType;
  onDetailsClick?: () => void;
  onStarClick?: (event: eventType) => void;
}) {
  return (
    <div className="w-full grid grid-cols-[auto_1fr_auto] gap-4 justify-center items-center ">
      <img
        src="https://images.pexels.com/photos/33129/popcorn-movie-party-entertainment.jpg"
        alt="Event"
        className="h-30 w-auto max-w-60 rounded-xl"
      />
      <div className="flex flex-col justify-center">
        <span className="inline-flex items-center">
          <h3 className="text-lg font-bold">{event.title}</h3>
          {event.starred ? (
            <StarIconSolid
              className="h-6 w-6 text-ats-yellow-500 inline-block ml-2 cursor-pointer"
              onClick={() => onStarClick && onStarClick(event)}
            />
          ) : (
            <StarIcon
              className="h-6 w-6 text-ats-yellow-500 inline-block ml-2 cursor-pointer"
              onClick={() => onStarClick && onStarClick(event)}
            />
          )}
        </span>
        {event.host && (
          <p className="text-sm text-gray-600">Hosted by: {event.host}</p>
        )}
        <p className="text-sm text-gray-600">
          {new Date(event.date).toLocaleDateString()}
          {": "}
          {new Date(event.date).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
      <button
        onClick={onDetailsClick}
        className="bg-ats-green-500 text-white px-4 py-2 rounded hover:bg-ats-green-600"
      >
        View Details
      </button>
    </div>
  );
}
