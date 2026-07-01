import { Suspense } from "react";
import { LoginForm } from "./login-form";

function LoginFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#EFEFEF]">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-primary" />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </Suspense>
  );
}
