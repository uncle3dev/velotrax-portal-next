import { SignUpForm } from "@/components/auth/sign-up-form";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function SignUpPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <h1 className="text-xl font-semibold text-gray-900">Create account</h1>
          <p className="text-sm text-gray-500">
            Sign up to start tracking your orders.
          </p>
        </CardHeader>
        <CardContent>
          <SignUpForm />
        </CardContent>
      </Card>
    </main>
  );
}
