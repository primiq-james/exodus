import { useEffect, useState } from "react";

const CHAT_OPEN_KEY = "pv_demo_chat_open";

export function usePersistedChatOpen() {
  const [isOpen, setIsOpen] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(CHAT_OPEN_KEY) === "1";
  });

  useEffect(() => {
    localStorage.setItem(CHAT_OPEN_KEY, isOpen ? "1" : "0");
  }, [isOpen]);

  return [isOpen, setIsOpen] as const;
}
