import Card from "@/components/card";
import MapClient from "@/components/mapClient";

export default function DashboardPage() {
  return (
    <div className="grid grid-cols-2 h-screen">
      <main className="shadow-2xl rounded-2xl p-4">
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
      <div className="w-full h-full overflow-hidden bg-slate-900/60 backdrop-blur-xl border border-slate-700">
        <MapClient />
      </div>
    </div>
  );
}
