// src/web3/web3.config.tsx
import { createAppKit } from "@reown/appkit/react";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { ReactNode } from "react";
import { WagmiProvider, createConfig } from "wagmi";
import { bsc } from "wagmi/chains";
import { http } from "viem";

// -----------------------------
// Query client
// -----------------------------
const queryClient = new QueryClient();

// -----------------------------
// Env
// -----------------------------
const projectId = import.meta.env.VITE_REOWN_PROJECT_ID as string | undefined;
if (!projectId) {
  throw new Error("Missing VITE_REOWN_PROJECT_ID");
}

// Prefer explicit site URL if set (e.g., production), else use live origin (Vercel previews), else dev
const APP_URL =
  (import.meta.env.VITE_PUBLIC_SITE_URL as string | undefined) ||
  (typeof window !== "undefined" ? window.location.origin : "http://localhost:5173");

// -----------------------------
// Chains & wagmi config (BSC mainnet)
// -----------------------------
const chains = [bsc] as const;

const wagmiConfig = createConfig({
  chains,
  transports: {
    // Prefer env; fall back to reliable public RPC
    [bsc.id]: http(
      (import.meta.env.VITE_BSC_RPC_URL as string | undefined) ||
        "https://bsc-dataseed1.bnbchain.org"
    ),
  },
  // If you truly do SSR, set ssr: true. For Vite SPA, keep it false.
  ssr: false,
});

// -----------------------------
// AppKit + Adapter (singletons)
// -----------------------------
const wagmiAdapter = new WagmiAdapter({
  networks: chains,
  projectId,
  // Use the wagmi config we just created so transports are defined.
  wagmiConfig,
});

let __APPKIT_INIT__ = false;
function ensureAppKitOnce() {
  if (__APPKIT_INIT__) return;
  __APPKIT_INIT__ = true;

  createAppKit({
    adapters: [wagmiAdapter],
    networks: chains,
    projectId,
    metadata: {
      name: "affiliateDAO",
      description: "Staking platform",
      url: APP_URL, // ✅ matches actual page origin (fixes WC warning)
      icons: [`${APP_URL}/favicon.ico`],
    },
    features: {
      analytics: false,
    },
  });

  console.log("[AppKit] initialized @", APP_URL);
}

// -----------------------------
// Provider
// -----------------------------
export function AppKitProvider({ children }: { children: ReactNode }) {
  ensureAppKitOnce();
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
