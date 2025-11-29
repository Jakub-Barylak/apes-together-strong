"use client";

import { ApeBackground } from "@/components/ApeSlider";
import { FormEvent, useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const PERSONALITY_TYPES = [
	{ id: 1, code: "INTJ", label: "Architect (INTJ)" },
	{ id: 2, code: "INTP", label: "Logician (INTP)" },
	{ id: 3, code: "ENTJ", label: "Commander (ENTJ)" },
	{ id: 4, code: "ENTP", label: "Debater (ENTP)" },
	{ id: 5, code: "INFJ", label: "Advocate (INFJ)" },
	{ id: 6, code: "INFP", label: "Mediator (INFP)" },
	{ id: 7, code: "ENFJ", label: "Protagonist (ENFJ)" },
	{ id: 8, code: "ENFP", label: "Campaigner (ENFP)" },
	{ id: 9, code: "ISTJ", label: "Logistician (ISTJ)" },
	{ id: 10, code: "ISFJ", label: "Defender (ISFJ)" },
	{ id: 11, code: "ESTJ", label: "Executive (ESTJ)" },
	{ id: 12, code: "ESFJ", label: "Consul (ESFJ)" },
	{ id: 13, code: "ISTP", label: "Virtuoso (ISTP)" },
	{ id: 14, code: "ISFP", label: "Adventurer (ISFP)" },
	{ id: 15, code: "ESTP", label: "Entrepreneur (ESTP)" },
	{ id: 16, code: "ESFP", label: "Entertainer (ESFP)" },
];

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
			// TODO: potem przesłać tablicę z jednym elementem 16P
			// TODO: personalities po ID a nie nazwie

			const body = JSON.stringify({
				"username": username,
				"email": email,
				"password": password,
				"personality": personality,
			});

			console.log(body);

			console.log(process.env.NEXT_PUBLIC_API_HOST);
			const res = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/users/`, {
				method: "POST",
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
				},
				body: body,
			});

			if (!res.ok) {
				// TODO: lepszy opis
				const json = await res.json();
				console.log(json);
				console.log("Register error");
				toast.error("Nie udało się zarejestrować");
			} else {
				router.push("/update_profile");
			}
		} catch (error) {
			console.log(error);
			toast.error("Nie udało się zarejestrować");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="relative h-screen w-screen flex items-center justify-center bg-amber-200 overflow-hidden">
			<ApeBackground />
			<form
				onSubmit={handleSubmit}
				className="relative z-10 grid gap-4 p-6 rounded-lg shadow-md bg-white"
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

				<label htmlFor="personality" className="text-sm font-medium">
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
							<option key={type.id} value={type.id}>
								{type.label}
							</option>
						))}
					</select>
				</div>

				<button
					type="submit"
					disabled={loading}
					className="mt-2 px-4 py-2 rounded bg-yellow-400 text-white cursor-pointer disabled:opacity-50 text-xl flex items-center justify-center gap-2"
				>
					{loading ? (
						<>
							<span className="animate-spin inline-block" aria-hidden="true">
								🍌
							</span>
							<span>Loading…</span>
						</>
					) : (
						"Register"
					)}
				</button>
			</form>
		</div>
	);
}
