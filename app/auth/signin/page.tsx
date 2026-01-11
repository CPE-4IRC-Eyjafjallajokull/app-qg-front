"use client";

import { Suspense } from "react";
import SignInLoading from "./loading";
import SignInShell from "@/components/auth/signin-shell";

export default function SignInPage() {
  return (
    <Suspense fallback={<SignInLoading />}>
      <SignInShell />
    </Suspense>
  );
}
