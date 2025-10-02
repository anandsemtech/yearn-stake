import { createAppKit } from "@reown/appkit/react";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { ReactNode } from "react";
import { WagmiProvider } from "wagmi";
import { baseSepolia } from "wagmi/chains";



const queryClient = new QueryClient();

// Pull from env (required by AppKit/WC)
const projectId = import.meta.env.VITE_REOWN_PROJECT_ID as string;

// Always identify YOUR app (not reown.com). Use current origin in browser, fall back to localhost in dev tools.
const APP_URL =
  (typeof window !== "undefined" && window.location.origin) ||
  "http://localhost:5173";

// Networks (unchanged)
const networks = [baseSepolia] as Networks;

// Create a single Wagmi adapter (do not recreate per render)
const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  // Only enable SSR if you truly render on the server (Next.js SSR). For Vite SPA, leave it off.
  // ssr: true,
});

// ---- AppKit singleton guard ----
let __APPKIT_INIT__ = false;
function ensureAppKitOnce() {
  if (__APPKIT_INIT__) return;
  __APPKIT_INIT__ = true;

  createAppKit({
    adapters: [wagmiAdapter],
    networks,
    projectId,
    metadata: {
      name: "affiliateDAO",
      description: "Staking platform",
      url: APP_URL,                        // ✅ Back to your app, not reown.com
      icons: [`${APP_URL}/favicon.ico`],   // ✅ Host your own icon (or keep as-is)
    },
    features: {
      analytics: false,                    // ✅ Optional: silence external telemetry
    },
  });

  console.log("[AppKit] initialized @", APP_URL);
}

export function AppKitProvider({ children }: { children: ReactNode }) {
  ensureAppKitOnce();
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
