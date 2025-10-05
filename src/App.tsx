// src/App.tsx
import React from "react";
import { useAccount } from "wagmi";

import { AppKitProvider } from "@/web3/web3.config";
import Dashboard from "./components/Dashboard";
import Header from "./components/Header";
import WelcomeScreen from "./components/WelcomeScreen";
import ToastHub from "@/components/ui/ToastHub"; // <-- added

function Root() {
  const { status, isConnected } = useAccount();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 relative">
      <Header />

      {isConnected ? (
        <Dashboard />
      ) : (
        <WelcomeScreen connecting={status === "connecting" || status === "reconnecting"} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AppKitProvider>
      <Root />
      <ToastHub /> {/* mounted once, below providers */}
    </AppKitProvider>
  );
}
