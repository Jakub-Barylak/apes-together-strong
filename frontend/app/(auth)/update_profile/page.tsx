"use client";

import { ApeBackground } from "@/components/ApeSlider";
import { BananaButton } from "@/components/BananaButton";
import { FormEvent, useState } from "react";

export default function UpdateProfilePag() {
	const [loading, setLoading] = useState(false);

	// TODO: Uzupełnić tagi
	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		setLoading(true);
	};

	return <div className="relative h-screen w-screen flex items-center justify-center bg-amber-200 overflow-hidden">
		<ApeBackground />
		<form
			onSubmit={handleSubmit}
			className="relative z-10 grid gap-4 p-6 rounded-lg shadow-md bg-white"
		>
			<BananaButton label="Save" loadingLabel="Loading" loading={loading} />
		</form>
	</div>;
}