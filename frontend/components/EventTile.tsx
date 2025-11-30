import type { eventType } from "@/types/types";
import { StarIcon } from "@heroicons/react/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/react/24/solid";

export default function EventTile({
  event,
  onDetailsClick,
}: {
  event: eventType;
  onDetailsClick?: () => void;
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
          <StarIcon className="h-6 w-6 text-ats-yellow-500 inline-block ml-2" />
          <StarIconSolid className="h-6 w-6 text-ats-yellow-500 inline-block ml-2" />
        </span>
        <p className="text-sm text-gray-600">Hosted by: {event.host}</p>
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
