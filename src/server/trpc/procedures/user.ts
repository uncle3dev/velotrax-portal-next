import { router, protectedProcedure } from "@/server/trpc/trpc";
import { gatewayFetch } from "@/lib/gateway";
import { profileUpdateSchema } from "@/lib/validators/profile";
import { type UserProfile } from "@/types/index";

function normalizeProfile(profile: UserProfile): UserProfile {
  const raw = profile as Record<string, unknown>;
  const id = typeof raw.id === "string" ? raw.id : "";
  const email = typeof raw.email === "string" ? raw.email : "";
  const name =
    (typeof raw.name === "string" ? raw.name : undefined) ??
    (typeof raw.fullName === "string" ? raw.fullName : undefined) ??
    (typeof raw.full_name === "string" ? raw.full_name : undefined);

  const createdAt =
    (typeof raw.createdAt === "string" ? raw.createdAt : undefined) ??
    (typeof raw.created_at === "string" ? raw.created_at : undefined);

  const updatedAt =
    (typeof raw.updatedAt === "string" ? raw.updatedAt : undefined) ??
    (typeof raw.updated_at === "string" ? raw.updated_at : undefined);

  const rest = { ...raw };
  delete rest.fullName;
  delete rest.full_name;
  delete rest.createdAt;
  delete rest.created_at;
  delete rest.updatedAt;
  delete rest.updated_at;

  return {
    ...rest,
    id,
    email,
    name,
    createdAt,
    updatedAt,
  };
}

export const userRouter = router({
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const profile = await gatewayFetch<UserProfile>("/v1/auth/profile", undefined, ctx.accessToken, {
      method: "GET",
    });
    return normalizeProfile(profile);
  }),

  profile: protectedProcedure.query(async ({ ctx }) => {
    const profile = await gatewayFetch<UserProfile>("/v1/auth/profile", undefined, ctx.accessToken, {
      method: "GET",
    });
    return normalizeProfile(profile);
  }),

  updateProfile: protectedProcedure
    .input(profileUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const profile = await gatewayFetch<UserProfile>("/v1/auth/profile", input, ctx.accessToken, {
        method: "PUT",
      });
      return normalizeProfile(profile);
    }),
});
