"use client";

import * as React from "react";

type UseDislocureOpen = {
  open?: boolean;
};

export function useDisclosure(props?: UseDislocureOpen) {
  const [isOpen, setIsOpen] = React.useState(() => props?.open ?? false);

  const handleOpenState = () => {
    setIsOpen(true);
  };

  const handleCloseState = () => {
    setIsOpen(false);
  };

  return {
    isOpen,
    onOpen: handleOpenState,
    onClose: handleCloseState,
  };
}
