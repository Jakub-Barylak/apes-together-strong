import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const API_BASE = "http://127.0.0.1:8000/api";

async function loginOnDjango(email: string, password: string) {
	const res = await fetch(`${API_BASE}/token/`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ username: email, password })
	});

	if (!res.ok) {
		throw new Error("Invalid credentials");
	}

	return res.json(); // { access, refresh }
}

async function refreshAccessToken(token: any) {
	try {
		const res = await fetch(`${API_BASE}/token/refresh/`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ refresh: token.refreshToken })
		});

		if (!res.ok) {
			throw new Error("Failed to refresh");
		}

		const data = await res.json();

		const accessToken = data.access;
		const refreshToken = data.refresh ?? token.refreshToken;
		const accessTokenExpires = Date.now() + 1000 * 60 * 60 * 24 * 30; // 30 dni

		return {
			...token,
			accessToken,
			accessTokenExpires,
			refreshToken: refreshToken
			// UWAGA: token.user (z tags) zostaje bez zmian, bo go nie ruszamy
		};
	} catch (e) {
		console.error("Refresh token error", e);
		return {
			...token,
			error: "RefreshTokenError"
		};
	}
}

export const authOptions: NextAuthOptions = {
	providers: [
		CredentialsProvider({
			name: "Credentials",
			credentials: {
				email: { label: "Email", type: "email" },
				password: { label: "Password", type: "password" }
			},
			async authorize(credentials) {
				if (!credentials?.email || !credentials?.password) return null;

				try {
					const data = await loginOnDjango(credentials.email, credentials.password);

					if (!data?.access || !data?.refresh) return null;

					const res = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/users/me/`, {
						method: "GET",
						headers: {
							"Content-Type": "application/json",
							Authorization: `Bearer ${data.access}`
						}
					});

					const me = await res.json();
					console.log("USER FROM DJANGO:", me);

					// To jest "user", który trafi do jwt({ token, user })
					return {
						id: me.id,
						name: me.username,
						bananas: me.bananas,
						email: me.email,
						personality: me.personality,
						tags: me.tags, // <<< TU MAMY TAGI
						accessToken: data.access,
						refreshToken: data.refresh
					};
				} catch (e) {
					console.error("Authorize error", e);
					return null;
				}
			}
		})
	],
	session: {
		strategy: "jwt"
	},
	callbacks: {
		async jwt({ token, user }) {
			// Pierwsze wywołanie po logowaniu – mamy usera z authorize()
			if (user) {
				const u = user as any;

				const nextToken = {
					...token,
					user: {
						id: u.id,
						name: u.name,
						bananas: u.bananas,
						email: u.email,
						personality: u.personality,
						tags: u.tags // <<< TAGI LĄDUJĄ W token.user.tags
					},
					accessToken: u.accessToken,
					refreshToken: u.refreshToken,
					accessTokenExpires: Date.now() + 1000 * 60 * 60 * 24 * 30
				};

				// Dla debugowania:
				console.log("JWT AFTER LOGIN:", JSON.stringify(nextToken.user, null, 2));

				return nextToken;
			}

			// Kolejne wywołania – jeśli token jeszcze ważny, zwróć aktualny
			if (Date.now() < (token.accessTokenExpires as number)) {
				return token;
			}

			// Po wygaśnięciu access tokena odświeżamy
			const refreshed = await refreshAccessToken(token);
			console.log("JWT AFTER REFRESH:", JSON.stringify(refreshed.user, null, 2));
			return refreshed;
		},

		async session({ session, token }) {
			// Przerzucamy całego token.user do session.user
			const nextSession: any = {
				...session,
				user: token.user, // <<< TU WRZUCA CAŁEGO USERA Z TAGAMI
				accessToken: token.accessToken,
				refreshToken: token.refreshToken,
				error: token.error
			};

			console.log("SESSION IN CALLBACK:", JSON.stringify(nextSession.user, null, 2));

			return nextSession;
		}
	},
	pages: {
		signIn: "/login"
	},
	secret: process.env.NEXTAUTH_SECRET
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
