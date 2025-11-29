import type { eventType } from "@/types/types";

export default function EventTile({ event }: { event: eventType }) {
  return (
    <div className="border border-ats-green-500 rounded-lg overflow-hidden shadow-md w-80">
      <img
        src="https://images.pexels.com/photos/33129/popcorn-movie-party-entertainment.jpg"
        alt="Event"
        className="w-full h-40 object-cover"
      />
      <div className="p-4">
        <h3 className="text-lg font-bold mb-2">{event.title}</h3>
        <p className="text-sm text-gray-600 mb-4">Hosted by: Event Host</p>
        <button className="bg-ats-green-500 text-white px-4 py-2 rounded hover:bg-ats-green-600">
          View Details
        </button>
      </div>
    </div>
  );
}
