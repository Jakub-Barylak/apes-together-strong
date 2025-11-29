export default function Card({
  title,
  author,
  sponsored = false,
  imageUrl = "https://placehold.co/600x400",
}: {
  title: string;
  author: string;
  sponsored?: boolean;
  imageUrl?: string;
}) {
  return (
    <div className="rounded relative aspect-video overflow-hidden">
      <img
        src={imageUrl}
        alt={title}
        className="absolute top-1/2 left-1/2 w-full h-full object-cover -translate-x-1/2 -translate-y-1/2"
      />
      <div className="absolute top-2 left-2 p-2 bg-ats-secondary-bg/50 rounded-xl font-bold backdrop-blur-sm">
        {author}
      </div>
      {sponsored ? (
        <div className="absolute bottom-2 right-2 text-sm bg-ats-yellow-500/50 rounded-md p-2 backdrop-blur-xs font-bold">
          Sponsored ⭐️
        </div>
      ) : null}
    </div>
  );
}
