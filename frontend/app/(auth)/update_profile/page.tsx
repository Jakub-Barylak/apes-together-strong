"use client";

import { ApeBackground } from "@/components/ApeSlider";
import { BananaButton } from "@/components/BananaButton";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

export default function UpdateProfilePag() {
	const [description, setDescription] = useState("");
	const [loading, setLoading] = useState(false);
	const { data: session, status } = useSession();
	const router = useRouter();

	useEffect(() => {
		// TODO: check if user has already updated their profile

		if (status === "loading") return;
		if (!session) {
			router.push("/login?callbackUrl=/update_profile");
		}
	}, [session, status, router]);

	// TODO: Uzupełnić tagi
	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		setLoading(true);
	};

	return <div className="relative h-screen w-screen flex items-center justify-center bg-amber-200 overflow-hidden">
		<ApeBackground />
		<form
			onSubmit={handleSubmit}
			className="relative z-10 grid gap-4 p-6 rounded-lg shadow-md bg-white w-80"
		>
			<label htmlFor="description">Say something about yourself</label>
			<textarea
				id="description"
				value={description}
				onChange={(e) => setDescription(e.target.value)}
				disabled={loading}
				required
				rows={10}
				className="border px-2 py-1 rounded"
			/>
			<BananaButton label="Save" loadingLabel="Loading" loading={loading} />
		</form>
	</div>;
}