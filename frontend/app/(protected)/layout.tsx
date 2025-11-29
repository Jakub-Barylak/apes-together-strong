import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route"; // <-- IMPORT

export default async function ProtectedLayout({ children, }: { children: React.ReactNode }) {

	// TODO: check if user is logged in (if not redirect to login with callback to here)

	const session = await getServerSession(authOptions);

	if (session === null) {
		redirect("/login");
	}


	console.log(session.user.tags.length);
	if (session.user.tags.length === 0) {
		redirect("/update_profile");
	}

	return <>{children}</>
}
