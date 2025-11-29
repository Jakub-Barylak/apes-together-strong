"use client";

import { ApeBackground } from "@/components/ApeSlider";
import { BananaButton } from "@/components/BananaButton";
import { METHODS } from "http";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { toast } from "react-toastify";

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

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		setLoading(true);

		try {
			// Pobieranie tagów
			const descriptioBody = JSON.stringify({
				text: description
			});

			const res = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/tags/suggest/`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${session?.accessToken}`
				},
				body: descriptioBody,
			});

			const tags = await res.json();

			if (!res.ok) {
				console.log(tags);
				toast.error("Somethign went wrong while generating tags.");
				return;
			}

			type Tag = {
				id: number,
				name: string
			}

			const tagIds = tags.suggested_tags.map((tag: Tag) => tag.id)

			const updateBody = JSON.stringify({
				tags: tagIds
			});

			const res_update = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/users/${session?.user.id}/`,
				{
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
						"Authorization": `Bearer ${session?.accessToken}`
					},
					body: updateBody
				}
			)

			const updateJson = await res_update.json();

			if (!res_update.ok) {
				console.log(updateJson);
				toast.error("Something went wrong while updating tags.");
				return;
			}

			router.push("/dashboard");

		} catch (error) {
			console.log(error);
			toast.error("Something went wrong");
		} finally {
			setLoading(false);
		}
	};

	if (status === "loading") {
		// TODO: loading spinner
		return <div>Loading...</div>
	}

	if (!session) {
		router.push("/login?callbackUrl=/update_profile");
		return;
	}

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