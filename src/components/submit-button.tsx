"use client";

import { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "./ui/button";
import { Loader2Icon } from "lucide-react";
import { cn } from "~/lib/utils";
import { ClassValue } from "clsx";

type Props = {
  children: ReactNode;
  className?: ClassValue;
  /** this text is used for sr-only */
  text?: string;
};

export function SubmitButton({ children, className, text = "Atualizando" }: Props) {
  const { pending } = useFormStatus();

  return (
    <Button size="sm" className={cn("sticky bottom-0 w-[160px]", className)} aria-disabled={pending}>
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
