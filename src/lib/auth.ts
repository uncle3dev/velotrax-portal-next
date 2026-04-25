import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { signInSchema } from "@/lib/validators/auth";
import { gatewayFetch } from "@/lib/gateway";
import { type SignInResponse } from "@/types/index";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/sign-in",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = signInSchema.safeParse(credentials);
        if (!parsed.success) return null;

        try {
          const response = await gatewayFetch<SignInResponse>(
            "/v1/auth/login",
            parsed.data,
          );
          
          return {
            id: response.user.id,
            email: response.user.email,
            accessToken: response.accessToken,
            roles: response.user.roles,
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = (user as typeof user & { accessToken: string }).accessToken;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.accessToken = token.accessToken as string;
      return session;
    },
  },
};

export default NextAuth(authOptions);
