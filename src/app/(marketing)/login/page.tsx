import { Suspense } from "react";
import type { Metadata } from "next";
import { LoginForm } from "@/components/marketing/LoginForm";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to Claros to save action kits and track your progress.",
};

function LoginCardSkeleton() {
  return (
    <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 sm:p-8 space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-44" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-9rem)] max-w-6xl items-center justify-center px-4 py-16 sm:px-6">
      <Suspense fallback={<LoginCardSkeleton />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
