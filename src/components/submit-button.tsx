"use client";

import { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "./ui/button";
import { Loader2Icon } from "lucide-react";

type Props = {
  children: ReactNode;
};

export function SubmitButton({ children }: Props) {
  const { pending } = useFormStatus();

  return (
    <Button size="sm" className="w-[160px]" aria-disabled={pending}>
      {pending ? (
        <>
          <Loader2Icon className="animate-spin" />
          <span className="sr-only">Atualizando</span>
        </>
      ) : (
        children
      )}
    </Button>
  );
}
