"use client";

import { toast } from "react-toastify";
import { signIn } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { ApeBackground } from "@/components/ApeSlider";
import { BananaButton } from "@/components/BananaButton";

export default function LoginPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const router = useRouter();
	const searchParams = useSearchParams();
	const callbackUrl = searchParams.get("callbackUrl") || "/";

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();

		setLoading(true);

		const result = await signIn("credentials", {
			redirect: false,
			email,
			password,
			callbackUrl
		})

		setLoading(false);

		if (result?.error) {
			toast.error("Nieprawidłowy login lub haslo");
			return;
		}

		router.push(callbackUrl);
	};

	return <div className="relative h-screen w-screen flex items-center justify-center bg-amber-200 overflow-hidden">
		<ApeBackground />

		<form
			onSubmit={handleSubmit}
			className="relative z-10 grid gap-4 p-6 rounded-lg shadow-md bg-white"
		>
			<div className="grid grid-cols-[auto,1fr] items-center gap-2">
				<label htmlFor="username">Username</label>
				<input
					id="username"
					value={email}
					type="text"
					onChange={(e) => setEmail(e.target.value)}
					required
					className="border px-2 py-1 rounded"
				/>
			</div>

			<div className="grid grid-cols-[auto,1fr] items-center gap-2">
				<label htmlFor="password">Password</label>
				<input
					id="password"
					value={password}
					type="password"
					onChange={(e) => setPassword(e.target.value)}
					required
					className="border px-2 py-1 rounded"
				/>
			</div>

			<BananaButton label="Login" loadingLabel="Loading..." loading={loading} />
		</form>
	</div>

}