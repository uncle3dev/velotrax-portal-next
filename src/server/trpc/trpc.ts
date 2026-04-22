import { initTRPC, TRPCError } from "@trpc/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

type Context = {
  accessToken?: string;
};

export async function createContext(): Promise<Context> {
  const session = await getServerSession(authOptions);
  return {
    accessToken: session?.accessToken,
  };
}

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  console.log('ctx: ', ctx);
  
  // // Kiểm tra xem người dùng có session hợp lệ hay không. Nếu chưa, ném lỗi UNAUTHENTICATED.
  // if (!ctx.session || !ctx.session.user) {
  //     throw new TRPCError({ code: "UNAUTHENTICATED", message: "Bạn phải đăng nhập để truy cập trang này." });
  // }

  // // Chỉ kiểm tra accessToken nếu nó cần thiết cho logic nghiệp vụ, 
  // // và coi là không bị lỗi ngay cả khi token hết hạn.
  // if (!ctx.accessToken) {
  //   console.warn("Truy cập protected route mà thiếu Access Token API. Tiếp tục với Context đã có.");
  // }

  return next({
    ctx: {
      accessToken: ctx.accessToken,
    },
  });
});
