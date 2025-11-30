import { userType } from "@/types/types";

export default function ProfileView({ user }: { user: userType }) {
  return (
    <div className="grid grid-cols-[1fr_auto] gap-4 items-center h-14">
      <div className="text-right">
        <h2 className="font-extrabold">{user.username}</h2>
        <h3>Ape</h3>
      </div>
      <div className="">
        <img
          src={`https://api.dicebear.com/9.x/lorelei/svg?flip=true&seed=${user.username}`}
          alt="Ape Avatar"
          className="h-14 w-14 bg-ats-yellow-500 rounded-full"
        />
      </div>
    </div>
  );
}
