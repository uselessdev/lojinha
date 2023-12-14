"use client";

import { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "./ui/button";
import { Loader2Icon } from "lucide-react";

type Props = {
  children: ReactNode;
  /** this text is used for sr-only */
  text?: string;
};

export function SubmitButton({ children, text = "Atualizando" }: Props) {
  const { pending } = useFormStatus();

  return (
    <Button size="sm" className="sticky bottom-0 w-[160px]" aria-disabled={pending}>
      {pending ? (
        <>
          <Loader2Icon className="animate-spin" />
          <span className="sr-only">{text}</span>
        </>
      ) : (
        children
      )}
    </Button>
  );
}
