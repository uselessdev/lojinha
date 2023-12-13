"use client";

import { useEffect } from "react";
import { useToast } from "~/components/ui/use-toast";

type Props = {
  open?: boolean;
  title?: string;
  description?: string;
  variant?: "default" | "destructive" | null;
};

export function Toast({ open = false, ...props }: Props) {
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      toast({
        ...props,
        className: "p-3",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, toast]);

  return undefined;
}
