# AGENTS.md

Tài liệu ngắn cho agent và người mới làm việc trong repo này.

## Mục tiêu

- Giữ thay đổi sát với kiến trúc thật của dự án
- Ưu tiên sửa nhỏ, rõ, ít lan rộng
- Không làm lệch contract giữa frontend và Go gateway

## Quy ước chính

- Ưu tiên React Server Components, chỉ dùng `"use client"` khi thật sự cần
- Không gọi gateway trực tiếp từ UI nếu đã có `gatewayFetch()`
- Giữ auth flow theo NextAuth JWT, không tự chế session riêng
- Tôn trọng `getServerSession(authOptions)` và `accessToken` trong session
- Nếu gateway đổi shape response thì normalize ở tầng server/tRPC, không để UI tự đoán
- Tránh sửa file generated, file spec, hoặc file không liên quan tới task
- Khi cần chỉnh logic bảo vệ route, ưu tiên helper dùng chung thay vì lặp code ở từng page

## File nguồn sự thật

- `src/lib/auth.ts`
  - NextAuth config, callbacks `jwt` và `session`
- `src/lib/gateway.ts`
  - Lớp gọi HTTP chung tới gateway
- `src/server/trpc/*`
  - Context, router, procedures, server caller
- `src/app/*`
  - App Router pages, layouts, API routes
- `src/types/index.ts`
  - Type dùng chung cho frontend và payload gateway

## Khi làm việc với protected pages

- Dữ liệu protected nên đi qua `createServerCaller()`
- Lỗi auth nên được xử lý ở tầng page/server wrapper hoặc layout, không để bung ra UI
- Với `UNAUTHORIZED`/`FORBIDDEN`, ưu tiên redirect về `/sign-in`; `NOT_FOUND` thì dùng `notFound()`
- Các route protected có thể nằm ngoài `dashboard` nếu vẫn đi qua `src/app/(protected)`

## Khi làm việc với gateway

- Luôn kiểm tra JSON key thật từ backend, nhất là trường hợp camelCase vs snake_case
- Nếu response có wrapper như `{ orders, page, total }`, hãy unwrap trước khi render
- Đừng giả định response là một mảng nếu backend trả object bao ngoài

## Khi thêm feature mới

- Kiểm tra route đã tồn tại chưa
- Kiểm tra có cần cập nhật `README.md` hoặc type chung không
- Giữ naming nhất quán với phần đang có trong repo
