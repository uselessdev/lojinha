"use client";

import * as React from "react";

export function useClipboard(): [string | undefined, (text: string) => Promise<boolean>] {
  const [copied, setCopied] = React.useState<string>();

  const copy = async (text: string) => {
    if (!navigator.clipboard) {
      console.warn(`Clipboard not supported`);
      return false;
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopied(text);
      setTimeout(() => setCopied(undefined), 600);
      return true;
    } catch (error) {
      console.warn(`Copy failed`, error);
      setCopied(undefined);
      return false;
    }
  };

  return [copied, copy];
}
