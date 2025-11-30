import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
	// co dostajesz w session.user
	interface User {
		id: string;
		email: string;
		bananas: number;
		personality: number[];
		tags: number[];
		accessToken: string;
		refreshToken: string;
	}

	interface Session {
		user: {
			id: string;
			email: string;
			bananas: number;
			personality: number[];
			tags: number[];
			accessToken: string;
			refreshToken: string;
		};
		accessToken?: string;
		refreshToken?: string;
	}
}

declare module "next-auth/jwt" {
	interface JWT {
		id: string;
		email: string;
		accessToken?: string;
		refreshToken?: string;
		accessTokenExpires?: number;
	}
}
