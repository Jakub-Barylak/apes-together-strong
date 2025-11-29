"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedPage() {
	// SESSION EXAMPLE
	const { data: session, status } = useSession();
	// const router = useRouter();


	// useEffect(() => {
	// 	if (status === "loading") return;
	// 	if (!session) {
	// 		router.push("/login?callbackUrl=/protected");
	// 	}
	// }, [session, status, router]);

	// if (status === "loading" || !session) {
	// 	return <p>Ładowanie...</p>;
	// }

	return (
		<div>
			<h1>Chroniona strona</h1>
			<pre>{JSON.stringify(session, null, 2)}</pre>
		</div>
	);
}
