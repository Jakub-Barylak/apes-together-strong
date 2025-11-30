import { userType } from "@/types/types";

export default function ProfileView({ user }: { user: userType }) {
  return (
    <div className="grid grid-cols-[1fr_auto] gap-4 items-center h-14">
      <div className="text-right">
        <h2 className="font-extrabold">{user.name}</h2>
        <h3 className="bg-ats-green-500 text-white rounded-full px-2">
          🍌 {user.bananas}
        </h3>
      </div>
      <div className="">
        <img
          src={`https://api.dicebear.com/9.x/lorelei/svg?flip=true&seed=${user.name}`}
          alt="Ape Avatar"
          className="h-14 w-14 bg-ats-yellow-500 rounded-full"
        />
      </div>
    </div>
  );
}
