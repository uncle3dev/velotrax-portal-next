# VeloTrax Portal Next

VeloTrax Portal Next là frontend Next.js cho hệ thống theo dõi và quản lý đơn hàng VeloTrax. Dự án dùng App Router, NextAuth, tRPC và Go gateway để dựng một luồng dữ liệu rõ ràng từ UI đến backend.

## Tổng quan kiến trúc

- Trang public nằm trong `src/app/(public)`
- Khu vực đã đăng nhập nằm trong `src/app/(protected)/dashboard`
- Session được quản lý bằng NextAuth JWT
- Dữ liệu nghiệp vụ đi qua tRPC rồi mới tới Go gateway
- `gatewayFetch()` là lớp gọi HTTP chung để nói chuyện với gateway
- Có `mock-gateway` để dev local khi chưa chạy backend thật

Luồng dữ liệu cơ bản:

`UI / Server Component` → `tRPC` → `gatewayFetch()` → `Go gateway`

Luồng auth:

`authorize()` → `jwt callback` → `session callback` → `getServerSession()` → `tRPC context`

## Các trang chính

### Public

- `/`
  - Trang giới thiệu ngắn, có nút vào đăng nhập hoặc đăng ký
- `/sign-in`
  - Form đăng nhập bằng email và password
- `/sign-up`
  - Form đăng ký tài khoản mới

### Protected dashboard

- `/dashboard`
  - Danh sách orders
- `/dashboard/profile`
  - Thông tin tài khoản
- `/dashboard/tracking`
  - Theo dõi trạng thái đơn hàng

## Tech stack

- Next.js 14 App Router
- React 18
- TypeScript strict
- Tailwind CSS
- tRPC v11
- NextAuth v4
- Zod
- Vitest

## Cách chạy local

### Cài dependencies

```bash
pnpm install
```

### Chạy dev server

```bash
pnpm dev
```

### Build production

```bash
pnpm build
```

### Chạy app production

```bash
pnpm start
```

### Chạy test

```bash
pnpm test
```

### Generate type từ OpenAPI gateway

```bash
pnpm generate:types
```

## Biến môi trường

File `src/lib/env.ts` đang yêu cầu:

- `GATEWAY_URL`
  - URL của Go gateway
- `NEXTAUTH_SECRET`
  - Secret cho NextAuth JWT
- `NEXTAUTH_URL`
  - URL gốc của NextAuth app
- `MOCK_GATEWAY`
  - Bật mock mode khi cần dev local

Ví dụ:

```bash
GATEWAY_URL=http://localhost:8080
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
MOCK_GATEWAY=true
```

## Mock mode

Khi `MOCK_GATEWAY=true`, app sẽ dùng `src/lib/mock-gateway.ts` thay vì gọi backend thật.

Điều này hữu ích khi:

- chưa chạy Go gateway
- muốn test nhanh UI
- cần dữ liệu giả lập cho orders, profile, tracking

## Auth và session

- NextAuth dùng `strategy: "jwt"`
- `authorize()` lấy response từ gateway khi đăng nhập
- `jwt callback` lưu `accessToken` và `id` vào token
- `session callback` đẩy dữ liệu từ token sang session
- `createContext()` dùng `getServerSession(authOptions)` để lấy session trên server
- `protectedProcedure` forward `accessToken` sang gateway

## Data flow trong dashboard

- Page server component gọi `createServerCaller()`
- tRPC procedure validate input bằng Zod
- procedure gọi `gatewayFetch()`
- response từ gateway được normalize trước khi đưa xuống UI nếu cần
- UI chỉ render dữ liệu đã chuẩn hóa

## Quy ước phát triển

- Ưu tiên React Server Components
- Chỉ thêm `"use client"` khi thật sự cần hook hoặc browser API
- Không gọi gateway trực tiếp từ component nếu đã có `gatewayFetch()`
- Giữ contract response đồng bộ giữa frontend và gateway
- Tránh sửa file generated hoặc file không liên quan

## Ghi chú quan trọng

- `middleware.ts` chặn route dashboard cho user chưa đăng nhập
- `src/server/auth/with-auth-redirect.ts` là helper dùng chung (`withAuthNotFound`) để biến lỗi auth thành trang không tồn tại
- `src/server/trpc/procedures/orders.ts` hiện normalize payload orders từ gateway trước khi trả cho UI

## Cấu trúc thư mục chính

```text
src/
├── app/
├── components/
├── lib/
├── server/
├── types/
└── middleware.ts
```
