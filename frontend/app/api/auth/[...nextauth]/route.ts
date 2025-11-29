import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

// TODO: podmienić na faktyczny ulr do API
const API_BASE = "localhost:5000";

async function loginOnDjango(email: string, password: string) {
	// TODO: podmienić endpoint na login
  const res = await fetch(`${API_BASE}/auth/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    throw new Error("Invalid credentials");
  }

  return res.json();
}

async function refreshAccessToken(token: any) {
  try {
		// TODO: zmienić na faktyczny endpoint refresh
    const res = await fetch(`${API_BASE}/auth/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: token.refreshToken }),
    });

    if (!res.ok) {
      throw new Error("Failed to refresh");
    }

    const data = await res.json();

		// TODO: ewentualnie zmienić 
    const accessToken = data.access;
		// TODO: ustawić faktyczny expiration token
    const accessTokenExpires = Date.now() + 5 * 60 * 1000;

    return {
      ...token,
      accessToken,
      accessTokenExpires,
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

        try {
          const data = await loginOnDjango(
            credentials.email,
            credentials.password
          );

          // data: { access, refresh, user }
          if (!data?.access || !data?.refresh) return null;

          return {
            id: data.user.id,
            email: data.user.email,
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
          accessTokenExpires: Date.now() + 5 * 60 * 1000,
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
