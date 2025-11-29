import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const API_BASE = "http://127.0.0.1:8000/api";

async function loginOnDjango(email: string, password: string) {
  const res = await fetch(`${API_BASE}/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ "username": email, "password": password }),
  });

  if (!res.ok) {
    throw new Error("Invalid credentials");
  }

  return res.json();
}

async function refreshAccessToken(token: any) {
  try {
    const res = await fetch(`${API_BASE}/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: token.refreshToken }),
    });

    if (!res.ok) {
      throw new Error("Failed to refresh");
    }

    const data = await res.json();

    const accessToken = data.access;
		const refresh = data.refresh;
		// TODO: ustawić faktyczny expiration token
    const accessTokenExpires = Date.now() +  60 * 24 * 30;

    return {
      ...token,
      accessToken,
      accessTokenExpires,
			refreshToken: refresh
    };
  } catch (e) {
    console.error("Refresh token error", e);
    return {
      ...token,
      error: "RefreshTokenError",
    };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

				console.log("Authorize");
        try {
          const data = await loginOnDjango(
            credentials.email,
            credentials.password
          );
					console.log(data);

          if (!data?.access || !data?.refresh) return null;

          return {
            email: credentials.email,
            ...data.user,
            accessToken: data.access,
            refreshToken: data.refresh,
          };
        } catch (e) {
          console.error("Authorize error", e);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    // zapis/odświeżanie tokenów w JWT NextAuth
    async jwt({ token, user }) {
      // Pierwsze logowanie
      if (user) {
        return {
          ...token,
          accessToken: (user as any).accessToken,
          refreshToken: (user as any).refreshToken,
          // Załóżmy 5 minut ważności accessa (albo weź z payloadu jeśli kodujesz exp)
          accessTokenExpires: Date.now() + 60 * 24 * 30,
          user,
        };
      }

      // Jeśli access token jeszcze ważny – zwracamy istniejący
      if (Date.now() < (token.accessTokenExpires as number)) {
        return token;
      }

      // Inaczej – odświeżamy
      return await refreshAccessToken(token);
    },

    // Co trafi do session po stronie klienta
    async session({ session, token }) {
      if (token) {
        (session as any).accessToken = token.accessToken;
        (session as any).refreshToken = token.refreshToken;
        (session as any).error = token.error;
        session.user = token.user as any;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login", // własna strona logowania
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
