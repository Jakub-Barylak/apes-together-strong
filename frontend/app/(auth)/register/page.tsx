"use client";

import { ApeBackground } from "@/components/ApeSlider";
import { FormEvent, useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { BananaButton } from "@/components/BananaButton";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { PERSONALITY_TYPES } from "@/assets/personalityTypes";

export default function RegisterPage() {
	const [loading, setLoading] = useState(false);
	const [personality, setPersonality] = useState("");
	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const router = useRouter();

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();

		setLoading(true);

		try {
			const body = JSON.stringify({
				username: username,
				email: email,
				password: password,
				personality: [parseInt(personality)],
			});

			const res = await fetch(
				`${process.env.NEXT_PUBLIC_API_HOST}/users/`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: body,
				}
			);

			if (!res.ok) {
				// TODO: lepszy opis
				const json = await res.json();
				console.log("Register error");
				console.log(json);
				toast.error("Nie udało się zarejestrować");
				return;
			}

			const result = await signIn("credentials", {
				redirect: false,
				email,
				password,
				callbackUrl: "",
			});

			if (result?.error) {
				router.push("/login?callbackUrl=/update_profile");
				return;
			}

			router.push("/update_profile");
		} catch (error) {
			console.log(error);
			toast.error("Nie udało się zarejestrować");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="relative h-screen w-screen flex flex-col items-center justify-start bg-amber-200 overflow-hidden pt-12  dark:bg-slate-950">
			<ApeBackground />
			<div className="flex flex-col items-center gap-2 mb-2">
				<div className="relative w-60 h-60">
					<Image
						src="/monke_sign_in_na_odwrut.png"
						alt="Ape Together Strong"
						fill
					/>
				</div>
			</div>
			<form
				onSubmit={handleSubmit}
				className="relative z-10 grid gap-4 p-6 rounded-lg shadow-md bg-white w-80"
			>
				<div className="grid grid-cols-[auto,1fr] items-center gap-2">
					<label htmlFor="username">Username</label>
					<input
						id="username"
						type="text"
						required
						className="border px-2 py-1 rounded"
						value={username}
						onChange={(e) => setUsername(e.target.value)}
						disabled={loading}
					/>
				</div>

				<div className="grid grid-cols-[auto,1fr] items-center gap-2">
					<label htmlFor="email">Email</label>
					<input
						id="email"
						type="email"
						className="border px-2 py-1 rounded"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						disabled={loading}
					/>
				</div>

				<div className="grid grid-cols-[auto,1fr] items-center gap-2">
					<label htmlFor="password">Password</label>
					<input
						id="password"
						type="password"
						className="border px-2 py-1 rounded"
						required
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						disabled={loading}
					/>
				</div>

				<label
					htmlFor="personality"
					className="text-sm font-medium"
				>
					Personality type (16Personalities)
				</label>

				<div className="grid grid-cols-[auto,1fr] items-center gap-2">
					<select
						id="personality"
						name="personality"
						value={personality}
						onChange={(e) => setPersonality(e.target.value)}
						required
						className="border px-2 py-1 rounded"
						disabled={loading}
					>
						<option value="">Select your type...</option>
						{PERSONALITY_TYPES.map((type) => (
							<option
								key={type.id}
								value={type.id}
							>
								{type.label}
							</option>
						))}
					</select>
				</div>

				<BananaButton
					label="Register"
					loadingLabel="Loading..."
					loading={loading}
				/>
			</form>
		</div>
	);
}
