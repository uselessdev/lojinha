"use client";

import Link from "next/link";
import { MoveRightIcon } from "lucide-react";
import { SignInButton, useSession } from "@clerk/nextjs";
import { Button } from "./ui/button";

export function SignIn() {
  const { isSignedIn } = useSession();

  if (isSignedIn) {
    return (
      <Button variant="outline" size="sm" asChild>
        <Link href="/dashboard" className="flex items-center gap-2">
          Dashboard <MoveRightIcon />
        </Link>
      </Button>
    );
  }

  return (
    <SignInButton mode="modal" afterSignInUrl="/dashboard" afterSignUpUrl="/dashboard">
      <Button className="flex w-[122px] items-center gap-2" size="sm" variant="outline">
        Entrar <MoveRightIcon />
      </Button>
    </SignInButton>
  );
}
