// src/components/Header.tsx
import {
  Moon,
  Sun,
  Settings,
  Star as StarIcon,
  Menu,
  X,
  Zap,
  Copy,
  Share2,
  Wallet,
} from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAccount, useDisconnect, useBalance, usePublicClient } from "wagmi";
import { Address, formatUnits } from "viem";

import { useTheme } from "../contexts/hooks/useTheme";
import { useWallet } from "../contexts/hooks/useWallet";

import ReferralShareModal from "./ReferralShareModal";
import ReferralStatus from "./ReferralStatus";
import TokenSwapModal from "./TokenSwapModal";
import UserSettingsModal from "./UserSettingsModal";
import YearnTogetherMark from "./YearnTogetherMark";

/* =========================
   ENV token addresses (optional)
========================= */
const YYEARN = (import.meta.env.VITE_YYEARN_ADDRESS ?? "") as Address;
const SYEARN = (import.meta.env.VITE_SYEARN_ADDRESS ?? "") as Address;
const PYEARN = (import.meta.env.VITE_PYEARN_ADDRESS ?? "") as Address;
const USDT = (import.meta.env.VITE_USDT_ADDRESS ?? "") as Address;

/* =========================
   Minimal ERC20 ABI (balance only)
========================= */
const ERC20_ABI = [
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
] as const;

/* =========================
   Helpers
========================= */
const fmt = (value: bigint, decimals: number, maxFrac = 4) => {
  const raw = formatUnits(value, decimals);
  if (!raw.includes(".")) return Number(raw).toLocaleString();
  const [w, f] = raw.split(".");
  const wf = Number(w).toLocaleString();
  const trimmed = f.slice(0, maxFrac).replace(/0+$/, "");
  return trimmed ? `${wf}.${trimmed}` : wf;
};

type ErcRow = {
  key: "YY" | "SY" | "PY" | "USDT";
  address?: Address;
  fallbackDecimals: number;
  label: string; // static symbol label
};

const TOKENS: ErcRow[] = [
  { key: "YY", address: YYEARN, fallbackDecimals: 18, label: "YY" },
  { key: "SY", address: SYEARN, fallbackDecimals: 18, label: "SY" },
  { key: "PY", address: PYEARN, fallbackDecimals: 18, label: "PY" },
  { key: "USDT", address: USDT, fallbackDecimals: 6, label: "USDT" },
];

/* =========================
   Tiny row for balances
========================= */
const Row: React.FC<{ symbol: string; value: string; note?: string }> = ({
  symbol,
  value,
}) => (
  <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
    <div className="flex items-center gap-2">
      <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
        <Wallet className="w-3.5 h-3.5 text-white/80" />
      </div>
      <div className="text-sm text-white/90">{symbol}</div>
    </div>
    <div className="text-sm tabular-nums text-white/90">{value}</div>
  </div>
);

/* =========================
   Popover / Bottom-sheet
========================= */
const BalancesPopover: React.FC<{
  anchorRef: React.RefObject<HTMLButtonElement>;
  open: boolean;
  onClose: () => void;
  rows: Array<{ symbol: string; value: string }>;
  native: { symbol: string; value: string };
}> = ({ anchorRef, open, onClose, rows, native }) => {
  const popRef = useRef<HTMLDivElement>(null);

  // close on click outside / Esc
  useEffect(() => {
    if (!open) return;
    const handle = (e: MouseEvent) => {
      if (!popRef.current || !anchorRef.current) return;
      if (popRef.current.contains(e.target as Node)) return;
      if (anchorRef.current.contains(e.target as Node)) return;
      onClose();
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("mousedown", handle);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", handle);
      document.removeEventListener("keydown", esc);
    };
  }, [open, onClose, anchorRef]);

  if (!open) return null;

  return (
    <>
      {/* overlay for mobile */}
      <div
        className="fixed inset-0 z-[60] md:hidden bg-black/50"
        onClick={onClose}
      />
      {/* desktop dropdown */}
      <div
        ref={popRef}
        className="hidden md:block absolute z-[70] mt-2 w-[360px] right-0 rounded-2xl border border-white/10 bg-gray-900/95 backdrop-blur shadow-xl p-4"
        style={{
          top:
            (anchorRef.current?.getBoundingClientRect().bottom ?? 0) +
            window.scrollY,
        }}
      >
        <div className="mb-3 text-xs uppercase tracking-wide text-white/60">
          Balances
        </div>
        <div className="space-y-2">
          <Row symbol={native.symbol} value={native.value} />
          {rows.map((r) => (
            <Row key={r.symbol} symbol={r.symbol} value={r.value} />
          ))}
        </div>
      </div>

      {/* mobile bottom sheet */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-[70] rounded-t-2xl border-t border-white/10 bg-gray-900/95 backdrop-blur p-4">
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-white/20" />
        <div className="mb-3 text-xs uppercase tracking-wide text-white/60">
          Balances
        </div>
        <div className="space-y-2">
          <Row symbol={native.symbol} value={native.value} />
          {rows.map((r) => (
            <Row key={r.symbol} symbol={r.symbol} value={r.value} />
          ))}
        </div>
        <button
          onClick={onClose}
          className="mt-4 w-full rounded-xl bg-white/10 text-white py-2 text-sm hover:bg-white/15"
        >
          Close
        </button>
      </div>
    </>
  );
};

/* =========================
   Header
========================= */
const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useWallet();
  const { isConnected, address } = useAccount();
  const { disconnect } = useDisconnect();
  const publicClient = usePublicClient();

  // Use wagmi's reactive address first; fall back to context if needed
  const activeAddress = address ?? user?.address ?? "";
  const shortAddress = activeAddress
    ? `${activeAddress.slice(0, 6)}...${activeAddress.slice(-4)}`
    : "";

  const [showSettings, setShowSettings] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showTokenSwapModal, setShowTokenSwapModal] = useState(false);
  const [showCopiedTooltip, setShowCopiedTooltip] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [showBalances, setShowBalances] = useState(false);
  const walletBtnRef = useRef<HTMLButtonElement>(null);

  const getStarDisplay = (starLevel: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon
        key={i}
        className={`w-4 h-4 ${
          i < starLevel
            ? "text-yellow-400 fill-yellow-400"
            : "text-gray-300 dark:text-gray-600"
        }`}
      />
    ));
  };

  const copyAddress = async () => {
    if (activeAddress) {
      try {
        await navigator.clipboard.writeText(activeAddress);
        setShowCopiedTooltip(true);
        setTimeout(() => setShowCopiedTooltip(false), 2000);
      } catch (err) {
        console.error("Failed to copy address:", err);
      }
    }
  };

  /* Native balance (ETH/BNB depending on chain) */
  const { data: nativeBal } = useBalance({ address, watch: true });

  /* ERC20 balances (only balanceOf; metadata is static) */
  const [erc20, setErc20] = useState<
    Record<ErcRow["key"], { symbol: string; decimals: number; value: bigint }>
  >({
    YY: { symbol: "YY", decimals: 18, value: 0n },
    SY: { symbol: "SY", decimals: 18, value: 0n },
    PY: { symbol: "PY", decimals: 18, value: 0n },
    USDT: { symbol: "USDT", decimals: 6, value: 0n },
  });

  useEffect(() => {
    let disposed = false;
    const load = async () => {
      if (!publicClient || !address || !isConnected) return;

      // Skip on poor connectivity
      const online =
        typeof navigator !== "undefined" ? navigator.onLine : true;
      if (!online) return;

      try {
        const results = await Promise.all(
          TOKENS.map(async (row) => {
            if (!row.address) {
              return { key: row.key, value: 0n as bigint };
            }
            try {
              const value = (await publicClient.readContract({
                address: row.address,
                abi: ERC20_ABI,
                functionName: "balanceOf",
                args: [address],
              })) as bigint;
              return { key: row.key, value: value ?? 0n };
            } catch (e) {
              console.warn("[Header] balance read failed:", row.key, e);
              return { key: row.key, value: 0n as bigint };
            }
          })
        );

        if (disposed) return;

        setErc20((prev) => {
          const next = { ...prev };
          for (const r of results) {
            const tokenDef = TOKENS.find((t) => t.key === r.key)!;
            next[r.key] = {
              symbol: tokenDef.label,
              decimals: prev[r.key]?.decimals ?? tokenDef.fallbackDecimals,
              value: r.value,
            };
          }
          return next;
        });
      } catch {
        // No-op; keep previous values
      }
    };

    load();
    const id = setInterval(load, 15_000);
    return () => {
      disposed = true;
      clearInterval(id);
    };
  }, [address, publicClient, isConnected]);

  /* Values for popover */
  const popRows = useMemo(() => {
    return (["YY", "SY", "PY", "USDT"] as const).map((k) => ({
      symbol: erc20[k].symbol,
      value: fmt(erc20[k].value, erc20[k].decimals),
    }));
  }, [erc20]);

  const nativeRow = useMemo(() => {
    const symbol = nativeBal?.symbol || "ETH";
    const value =
      nativeBal?.value && typeof nativeBal.decimals === "number"
        ? fmt(nativeBal.value, nativeBal.decimals)
        : "0";
    return { symbol, value };
  }, [nativeBal]);

  return (
    <>
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <YearnTogetherMark
                className="h-7 text-white dark:text-white"
                ariaLabel="yearnTogether"
              />
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-3">
              <ReferralStatus />

              {/* Wallet balances button (only when connected) */}
              {isConnected && (
                <button
                  ref={walletBtnRef}
                  onClick={() => setShowBalances((v) => !v)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative"
                  aria-haspopup="dialog"
                  aria-expanded={isConnected ? showBalances : false}
                  aria-label="Wallet balances"
                >
                  <Wallet className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>
              )}

              {/* Settings (only when connected) */}
              {isConnected && (
                <button
                  onClick={() => setShowSettings(true)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-label="Open settings"
                >
                  <Settings className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                </button>
              )}

              {/* Address + actions */}
              {isConnected ? (
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-sm font-medium text-green-700 dark:text-green-300">
                      {shortAddress}
                    </span>
                    <div className="relative">
                      <button
                        onClick={copyAddress}
                        className="p-1 hover:bg-green-100 dark:hover:bg-green-800 rounded transition-colors"
                        title="Copy address"
                        aria-label="Copy address"
                      >
                        <Copy className="w-3 h-3 text-green-600 dark:text-green-400" />
                      </button>
                      {showCopiedTooltip && (
                        <div className="absolute top-[110%] left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded shadow-lg whitespace-nowrap z-10">
                          Copied!
                          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-800" />
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => setShowReferralModal(true)}
                      className="p-1 hover:bg-green-100 dark:hover:bg-green-800 rounded transition-colors"
                      title="Profile"
                      aria-label="Your YearnTogether Profile"
                    >
                      <Share2 className="w-3 h-3 text-green-600 dark:text-green-400" />
                    </button>
                  </div>

                  <button
                    onClick={() => setShowTokenSwapModal(true)}
                    className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white rounded-lg transition-all duration-200 transform hover:scale-105 text-sm font-medium"
                  >
                    <Zap className="w-4 h-4" />
                    <span>Swap</span>
                  </button>
                  <button
                    onClick={() => disconnect()}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm font-medium"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <appkit-button label="Connect Wallet"></appkit-button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu((v) => !v)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle menu"
            >
              {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile menu */}
          {showMobileMenu && (
            <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-col space-y-4">
                {/* Referral status is fine to show always */}
                <ReferralStatus />

                {isConnected ? (
                  <>
                    {/* Wallet balances button (opens bottom sheet) */}
                    <button
                      onClick={() => setShowBalances(true)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white/60 dark:bg-gray-800 text-gray-800 dark:text-gray-100"
                    >
                      <span className="flex items-center gap-2">
                        <Wallet className="w-4 h-4" />
                        <span className="text-sm font-medium">Wallet balances</span>
                      </span>
                      <span className="text-xs opacity-70">View</span>
                    </button>

                    <div className="space-y-2">
                      {/* Share address on mobile */}
                      <button
                        onClick={() => {
                          setShowReferralModal(true);
                          setShowMobileMenu(false);
                        }}
                        className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        <Share2 className="w-4 h-4" />
                        <span className="text-sm">Profile</span>
                      </button>

                      <button
                        onClick={() => {
                          setShowSettings(true);
                          setShowMobileMenu(false);
                        }}
                        className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        <span className="text-sm">Settings</span>
                      </button>

                      <button
                        onClick={() => {
                          setShowTokenSwapModal(true);
                          setShowMobileMenu(false);
                        }}
                        className="w-full flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-lg transition-colors"
                      >
                        <Zap className="w-4 h-4" />
                        <span className="text-sm">Swap Tokens</span>
                      </button>

                      <button
                        onClick={() => disconnect()}
                        className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm font-medium"
                      >
                        Disconnect
                      </button>
                    </div>
                  </>
                ) : (
                  <appkit-button label="Connect Wallet" />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Balances Popover / Sheet */}
        <BalancesPopover
          anchorRef={walletBtnRef}
          open={isConnected ? showBalances : false}
          onClose={() => setShowBalances(false)}
          rows={popRows}
          native={nativeRow}
        />
      </header>

      {/* Modals outside header */}
      {showTokenSwapModal && (
        <TokenSwapModal onClose={() => setShowTokenSwapModal(false)} />
      )}
      {showSettings && isConnected && (
        <UserSettingsModal onClose={() => setShowSettings(false)} />
      )}
      {showReferralModal && (
        <ReferralShareModal onClose={() => setShowReferralModal(false)} />
      )}
    </>
  );
};

export default Header;

/* typing for custom element */
declare global {
  interface HTMLElementTagNameMap {
    "appkit-button": HTMLElement;
  }
}
