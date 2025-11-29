"use client";

import { signIn } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function LoginPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const router = useRouter();
	const searchParams = useSearchParams();
	const callbackUrl = searchParams.get("callbackUrl") || "/";

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();

		console.log("Login");
		// setLoading(true);

		const result = await signIn("credentials", {
			redirect: false,
			email,
			password,
			callbackUrl
		})

		// setLoading(false);

		if (result?.error) {
			alert("Niepoprawny login lub hasło");
			return;
		}

		router.push(callbackUrl);
	};

	return <div><form onSubmit={handleSubmit}>
		<label>
			Username
			<input value={email} type="text" onChange={(e) => setEmail(e.target.value)} required />
		</label>
		<label>
			Password
			<input value={password} type="password" onChange={(e) => setPassword(e.target.value)} required />
		</label>
		<button type="submit" disabled={loading} className="cursor-pointer">Login</button>
	</form></div>;
}