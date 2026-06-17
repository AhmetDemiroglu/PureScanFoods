import React, { createContext, useContext, useState, useCallback } from "react";

/**
 * Uygulama "shell" durumu — X/Twitter tarzı history slide-over'ı kontrol eder.
 * History sidebar artık her ekrana ayrı mount edilmez; tek bir global shell
 * (AppShellSidebar) bu context üzerinden açılıp kapanır.
 */
interface ShellContextType {
  isSidebarOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;
}

const ShellContext = createContext<ShellContextType>({
  isSidebarOpen: false,
  openSidebar: () => {},
  closeSidebar: () => {},
  toggleSidebar: () => {},
});

export function ShellProvider({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const openSidebar = useCallback(() => setIsSidebarOpen(true), []);
  const closeSidebar = useCallback(() => setIsSidebarOpen(false), []);
  const toggleSidebar = useCallback(() => setIsSidebarOpen((v) => !v), []);

  return (
    <ShellContext.Provider value={{ isSidebarOpen, openSidebar, closeSidebar, toggleSidebar }}>
      {children}
    </ShellContext.Provider>
  );
}

export function useShell() {
  return useContext(ShellContext);
}
