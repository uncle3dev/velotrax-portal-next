import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="max-w-2xl text-center">
        <h1 className="text-5xl font-bold tracking-tight text-gray-900">
          Velo<span className="text-blue-600">Trax</span>
        </h1>
        <p className="mt-4 text-xl text-gray-500">
          Real-time order tracking and management for your business.
          Streamline operations, delight customers.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link href="/sign-in">
            <Button variant="primary">Sign In</Button>
          </Link>
          <Link href="/sign-up">
            <Button variant="secondary">Get Started</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
