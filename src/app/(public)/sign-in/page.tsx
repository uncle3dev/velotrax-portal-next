import { SignInForm } from "@/components/auth/sign-in-form";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function SignInPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <h1 className="text-xl font-semibold text-gray-900">Sign in</h1>
          <p className="text-sm text-gray-500">
            Enter your credentials to access your account.
          </p>
        </CardHeader>
        <CardContent>
          <SignInForm />
        </CardContent>
      </Card>
    </main>
  );
}
