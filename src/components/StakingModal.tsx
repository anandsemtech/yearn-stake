// src/components/StakingModal.tsx
import { X, DollarSign, Calendar, TrendingUp, Zap, Plus } from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import type { Address, Hex } from "viem";
import { parseUnits, formatUnits } from "viem";

import {
  useAccount,
  usePublicClient as useWagmiPublicClient,
  useWalletClient,
} from "wagmi";
import { useAllowedCompositionsFromSubgraph as useAllowedCompositions } from "@/hooks/useAllowedCompositionsSubgraph";

import { STAKING_ABI } from "@/web3/abi/stakingAbi";
import { bsc } from "viem/chains";
import { createPublicClient, http } from "viem";
import {
  explainTxError,
  showUserSuccess,
  showEvmError,
  normalizeEvmError,
} from "@/lib/errors";

/* ===========================
   Debug helpers (toggle-able)
=========================== */
const DBG = false;
const log = (...a: any[]) => { if (DBG) console.log(...a); };
const warn = (...a: any[]) => { if (DBG) console.warn(...a); };
const err  = (...a: any[]) => { if (DBG) console.error(...a); };
const short = (s?: string) => (s && s.length > 12 ? `${s.slice(0, 6)}…${s.slice(-4)}` : s);
const fmt = (x: bigint) => x.toString();
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const ZERO_ADDR = "0x0000000000000000000000000000000000000000" as Address;
const MAX_UINT256 = 2n ** 256n - 1n;

/* ======= tuning ======= */
const USE_MAX_ALLOWANCE_FOR_YY = false; // exact approvals for YY
const WAIT_CONFIRMATIONS = 1;
const ALLOWANCE_POLL_ATTEMPTS = 6;
const ALLOWANCE_POLL_DELAY_MS = 400;

/* ===========================
   Props
=========================== */
interface StakingModalProps {
  package: {
    id: string;
    name: string;
    apy: number;
    durationYears: number;
    minAmount: number;
    stakeMultiple?: number; // may be missing in prod
  };
  onClose: () => void;
}

/* ===========================
   Env addresses
=========================== */
const yYearn = (import.meta.env.VITE_YYEARN_TOKEN_ADDRESS ||
  import.meta.env.VITE_YYEARN_ADDRESS ||
  "") as Address;
const sYearn = (import.meta.env.VITE_SYEARN_TOKEN_ADDRESS ||
  import.meta.env.VITE_SYEARN_ADDRESS ||
  "") as Address;
const pYearn = (import.meta.env.VITE_PYEARN_TOKEN_ADDRESS ||
  import.meta.env.VITE_PYEARN_ADDRESS ||
  "") as Address;

const stakingContract = (import.meta.env.VITE_BASE_CONTRACT_ADDRESS ?? "") as Address;

// ✅ Always use env default referrer
const DEFAULT_REFERRER = (import.meta.env.VITE_DEFAULT_REFERRER ||
  "0xD2Dd094539cfF0F279078181E43A47fC9764aC0D") as Address;

// Subgraph (you said this is the correct env)
const SUBGRAPH_URL: string | undefined = import.meta.env.VITE_SUBGRAPH_YEARN;

/* ===========================
   Small utils
=========================== */
const addCommas = (n: string) => n.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
const prettyFixed = (v: bigint, decimals: number, places = 2) => {
  if (decimals <= 0) return addCommas(v.toString());
  const s = v.toString().padStart(decimals + 1, "0");
  const i = s.length - decimals;
  const whole = s.slice(0, i) || "0";
  let frac = s.slice(i);
  if (places <= 0) return addCommas(whole);
  if (frac.length < places) frac = frac.padEnd(places, "0");
  else frac = frac.slice(0, places);
  return `${addCommas(whole)}.${frac}`;
};
const prettyUSD = (n: number) =>
  n.toLocaleString(undefined, { maximumFractionDigits: 6 });

/* ===========================
   ERC20 ABIs (view/approve)
=========================== */
const ERC20_ABI = [
  { type: "function", name: "allowance", stateMutability: "view", inputs: [
      { name: "owner", type: "address" }, { name: "spender", type: "address" },
    ], outputs: [{ type: "uint256" }] },
  { type: "function", name: "approve", stateMutability: "nonpayable", inputs: [
      { name: "spender", type: "address" }, { name: "amount", type: "uint256" },
    ], outputs: [{ type: "bool" }] },
] as const;

const ERC20_VIEW_ABI = [
  { type: "function", name: "decimals", stateMutability: "view", inputs: [], outputs: [{ type: "uint8" }] },
  { type: "function", name: "symbol", stateMutability: "view", inputs: [], outputs: [{ type: "string" }] },
  { type: "function", name: "name", stateMutability: "view", inputs: [], outputs: [{ type: "string" }] },
  { type: "function", name: "balanceOf", stateMutability: "view", inputs: [{ name: "owner", type: "address" }], outputs: [{ type: "uint256" }] },
] as const;

/* ===========================
   Minimal reads for staking (view)
=========================== */
const STAKING_READS_ABI = [
  { type: "function", name: "userTotalStaked", stateMutability: "view", inputs: [{ name: "user", type: "address" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "isWhitelisted", stateMutability: "view", inputs: [{ name: "user", type: "address" }], outputs: [{ type: "bool" }] },
  { type: "function", name: "paused", stateMutability: "view", inputs: [], outputs: [{ type: "bool" }] },
] as const;

/* ===========================
   Component
=========================== */
const StakingModal: React.FC<StakingModalProps> = ({ package: pkg, onClose }) => {
  const { address, chainId: connectedChainId, isConnected } = useAccount();
  const wagmiPublic = useWagmiPublicClient({ chainId: bsc.id });

  const fallbackPublic = useMemo(
    () =>
      createPublicClient({
        chain: bsc,
        transport: http(
          import.meta.env.VITE_BSC_RPC_URL || "https://bsc-dataseed1.bnbchain.org"
        ),
      }),
    []
  );
  const publicClient = wagmiPublic ?? fallbackPublic;
  const { data: walletClient } = useWalletClient();

  const [chainIssue, setChainIssue] = useState<string | null>(null);

  // Authoritative wallet chain check
  useEffect(() => {
    let stop = false;

    (async () => {
      if (!isConnected || !walletClient) {
        if (!stop) setChainIssue(null);
        return;
      }
      const targetHex = `0x${bsc.id.toString(16)}`.toLowerCase();
      try {
        const hex = (await walletClient.request({ method: "eth_chainId" })) as string;
        const onBsc = hex?.toLowerCase() === targetHex;
        if (!stop) setChainIssue(onBsc ? null : "Please switch your wallet to BSC Mainnet");
      } catch {
        if (!stop) setChainIssue("Please switch your wallet to BSC Mainnet");
      }
    })();

    const t = setInterval(async () => {
      if (!isConnected || !walletClient) return;
      try {
        const hex = (await walletClient.request({ method: "eth_chainId" })) as string;
        if (hex?.toLowerCase() === `0x${bsc.id.toString(16)}`.toLowerCase()) {
          setChainIssue(null);
          clearInterval(t);
        }
      } catch {}
    }, 600);

    return () => { stop = true; clearInterval(t); };
  }, [isConnected, walletClient]);

  async function ensureBsc(): Promise<void> {
    if (!walletClient) throw new Error("Connect wallet.");
    const targetHex = `0x${bsc.id.toString(16)}`;
    let currentHex: string | null = null;
    try { currentHex = (await walletClient.request({ method: "eth_chainId" })) as string; } catch {}
    if (currentHex?.toLowerCase() === targetHex.toLowerCase()) return;

    try {
      await walletClient.request({ method: "wallet_switchEthereumChain", params: [{ chainId: targetHex }] });
    } catch (e: any) {
      const needsAdd = e?.code === 4902 || /not added|unrecognized chain/i.test(e?.message || "");
      if (!needsAdd) throw new Error("Please switch your wallet to BSC Mainnet.");
      await walletClient.request({
        method: "wallet_addEthereumChain",
        params: [{
          chainId: targetHex,
          chainName: "BSC Mainnet",
          rpcUrls: [import.meta.env.VITE_BSC_RPC_URL || "https://bsc-dataseed1.bnbchain.org"],
          nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
          blockExplorerUrls: ["https://bscscan.com"],
        }],
      });
      await walletClient.request({ method: "wallet_switchEthereumChain", params: [{ chainId: targetHex }] });
    }
    const afterHex = (await walletClient.request({ method: "eth_chainId" })) as string;
    if (afterHex?.toLowerCase() !== targetHex.toLowerCase())
      throw new Error("Please switch your wallet to BSC Mainnet.");
  }

  /* ===========================
     Allowed compositions
  =========================== */
  const {
    compositions: compRows,
    isLoading: compLoading,
    error: compError,
  } = useAllowedCompositions();

  const validCompositions = useMemo<number[][]>(() => {
    const rows = compRows.map((r) => [r.yYearnPct, r.sYearnPct, r.pYearnPct]);
    return rows.length ? rows : [[100, 0, 0]];
  }, [compRows]);

  const [selectedIdx, setSelectedIdx] = useState(0);
  useEffect(() => {
    if (selectedIdx >= validCompositions.length) setSelectedIdx(0);
  }, [validCompositions.length, selectedIdx]);

  const selected =
    validCompositions.length > 0 ? validCompositions[selectedIdx] : [100, 0, 0];

  /* ===========================
     Stake multiple via SUBGRAPH
  =========================== */
 // Stake multiple via SUBGRAPH (wei -> human)
const [sgMultiple, setSgMultiple] = useState<number>(0);

useEffect(() => {
  if (!SUBGRAPH_URL) {
    setSgMultiple(0);
    return;
  }
  let cancelled = false;

  (async () => {
    try {
      const query = `
        query Pkgs {
          packages(first: 50, orderBy: packageId, orderDirection: asc) {
            packageId
            stakeMultiple
          }
        }
      `;
      const res = await fetch(SUBGRAPH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const json = await res.json();
      const rows: any[] = json?.data?.packages || [];
      const row = rows.find((r) => String(r?.packageId) === String(pkg.id));

      // stakeMultiple is a big-int string in wei (18 decimals).
      // Convert to human units so the UI works with the same "amount" units as the input.
      let mHuman = 0;
      if (row?.stakeMultiple != null) {
        const wei = BigInt(row.stakeMultiple);
        const humanStr = formatUnits(wei, 18); // ← 18-decimals
        const n = Number(humanStr);
        mHuman = Number.isFinite(n) && n > 0 ? n : 0;
      }

      if (!cancelled) setSgMultiple(mHuman);
    } catch {
      if (!cancelled) setSgMultiple(0);
    }
  })();

  return () => { cancelled = true; };
}, [pkg.id]);


  // Effective multiple preference: subgraph → prop → none
  const effectiveMultiple = useMemo(() => {
    if (sgMultiple > 0) return sgMultiple;
    if (typeof pkg.stakeMultiple === "number" && pkg.stakeMultiple > 0) return pkg.stakeMultiple;
    return 0;
  }, [sgMultiple, pkg.stakeMultiple]);

  /* ===========================
     Amount & multiple UX
  =========================== */
  const initialAmount = useMemo(() => {
    const m = effectiveMultiple || 0;
    if (!m) return String(Math.max(pkg.minAmount, 0));
    const k = Math.ceil(Math.max(pkg.minAmount, 0) / m);
    return String(k * m);
  }, [pkg.minAmount, effectiveMultiple]);

  const [amount, setAmount] = useState(initialAmount);

  // If multiple arrives later from subgraph, softly align the default
  useEffect(() => {
    setAmount((prev) => {
      if (prev !== initialAmount && prev !== String(pkg.minAmount)) return prev;
      return initialAmount;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialAmount]);

  const amountNum = useMemo(() => {
    const n = Number(amount || 0);
    return !isFinite(n) || n < 0 ? 0 : n;
  }, [amount]);

  const meetsMin = amountNum >= pkg.minAmount;
  const isMultipleOk = effectiveMultiple ? amountNum % effectiveMultiple === 0 : true;

  const toNextMultipleDelta = useMemo(() => {
    const m = effectiveMultiple;
    if (!m) return 0;
    if (amountNum <= 0) return m;
    const next = Math.ceil(amountNum / m) * m;
    const delta = next - amountNum;
    return delta === 0 ? m : delta;
  }, [amountNum, effectiveMultiple]);

  const bumpByMultiples = (count: number) => {
    const m = effectiveMultiple;
    if (!m || count <= 0) return;
    const base = Math.max(0, amountNum);
    const next = base + m * count;
    setAmount(String(next));
  };

  const nudgeToNextValid = () => {
    const m = effectiveMultiple;
    if (!m) return;
    setAmount(String(amountNum + toNextMultipleDelta));
  };

  const nudgeToMin = () => {
    const m = effectiveMultiple;
    if (!m) {
      setAmount(String(Math.max(pkg.minAmount, 0)));
      return;
    }
    const k = Math.ceil(Math.max(pkg.minAmount, 0) / m);
    setAmount(String(k * m));
  };

  /* ===========================
     Token splits (per composition)
  =========================== */
  const humanPerToken = useMemo<[number, number, number]>(() => {
    const [py, ps, pp] = selected;
    if (py + ps + pp !== 100) return [0, 0, 0];
    return [
      (amountNum * py) / 100,
      (amountNum * ps) / 100,
      (amountNum * pp) / 100,
    ];
  }, [amountNum, selected]);

  /* ===========================
     Token meta/balances
  =========================== */
  type TokenMeta = {
    address: Address;
    symbol: string;
    name: string;
    decimals: number;
    balance: bigint;
  };
  const [tokenMeta, setTokenMeta] = useState<TokenMeta[] | null>(null);

  useEffect(() => {
    (async () => {
      if (!address) {
        setTokenMeta(null);
        return;
      }
      try {
        const addrs: Address[] = [yYearn, sYearn, pYearn];
        const meta = await Promise.all(
          addrs.map(async (addr) => {
            const [dec, sym, nam, bal] = await Promise.all([
              publicClient.readContract({ address: addr, abi: ERC20_VIEW_ABI, functionName: "decimals" }) as Promise<number>,
              publicClient.readContract({ address: addr, abi: ERC20_VIEW_ABI, functionName: "symbol" }) as Promise<string>,
              publicClient.readContract({ address: addr, abi: ERC20_VIEW_ABI, functionName: "name" }) as Promise<string>,
              publicClient.readContract({ address: addr, abi: ERC20_VIEW_ABI, functionName: "balanceOf", args: [address] }) as Promise<bigint>,
            ]);
            return { address: addr, symbol: sym, name: nam, decimals: dec, balance: bal };
          })
        );
        setTokenMeta(meta);
      } catch (e) {
        err("token meta read failed", e);
        setTokenMeta(null);
      }
    })();
  }, [address, connectedChainId, publicClient]);

  const decimals = useMemo<[number, number, number]>(() => {
    if (!tokenMeta) return [18, 18, 18];
    return [
      tokenMeta[0]?.decimals ?? 18,
      tokenMeta[1]?.decimals ?? 18,
      tokenMeta[2]?.decimals ?? 18,
    ];
  }, [tokenMeta]);

  const weiPerToken = useMemo<[bigint, bigint, bigint]>(() => {
    try {
      const [dy, ds, dp] = decimals;
      return [
        parseUnits(String(humanPerToken[0] || 0), dy),
        parseUnits(String(humanPerToken[1] || 0), ds),
        parseUnits(String(humanPerToken[2] || 0), dp),
      ];
    } catch (e) {
      err("parseUnits failed", e);
      return [0n, 0n, 0n];
    }
  }, [humanPerToken, decimals]);

  /* ===========================
     Stake args
  =========================== */
  const tokensAll: Address[] = [yYearn, sYearn, pYearn];
  const amtsAll: bigint[] = [weiPerToken[0], weiPerToken[1], weiPerToken[2]];

  /* ===========================
     Contract paused
  =========================== */
  async function isPaused(): Promise<boolean | null> {
    try {
      return (await publicClient.readContract({
        address: stakingContract,
        abi: STAKING_READS_ABI,
        functionName: "paused",
      })) as boolean;
    } catch {
      return null;
    }
  }

  /* ===========================
     Approvals & checks
  =========================== */
  function validateEnv(): string | null {
    const isAddr = (a?: string) => !!a && /^0x[a-fA-F0-9]{40}$/.test(a);
    if (!isAddr(stakingContract)) return "Invalid staking contract address (env).";
    if (!isAddr(yYearn)) return "Invalid yYearn token address (env).";
    if (!isAddr(sYearn)) return "Invalid sYearn token address (env).";
    if (!isAddr(pYearn)) return "Invalid pYearn token address (env).";
    if (
      yYearn.toLowerCase() === sYearn.toLowerCase() ||
      yYearn.toLowerCase() === pYearn.toLowerCase() ||
      sYearn.toLowerCase() === pYearn.toLowerCase()
    ) {
      return "Token addresses must be distinct.";
    }
    if (stakingContract === ZERO_ADDR) return "Staking contract cannot be zero address.";
    return null;
  }

  async function isReferrerValid(addr: Address): Promise<boolean> {
    try {
      const [wl, staked] = await Promise.all([
        publicClient.readContract({
          address: stakingContract,
          abi: STAKING_READS_ABI,
          functionName: "isWhitelisted",
          args: [addr],
        }) as Promise<boolean>,
        publicClient.readContract({
          address: stakingContract,
          abi: STAKING_READS_ABI,
          functionName: "userTotalStaked",
          args: [addr],
        }) as Promise<bigint>,
      ]);
      return wl || staked > 0n;
    } catch {
      // If contract doesn't use these rules, allow.
      return true;
    }
  }

  async function preStakeSanityCheck(finalRef: Address): Promise<string | null> {
    const envIssue = validateEnv();
    if (envIssue) return envIssue;

    if (!address) return "Connect wallet.";

    // Authoritative chain check
    try {
      if (walletClient) {
        const hex = (await walletClient.request({ method: "eth_chainId" })) as string;
        const onBsc = hex?.toLowerCase() === `0x${bsc.id.toString(16)}`.toLowerCase();
        if (!onBsc) return "Please switch your wallet to BSC Mainnet.";
      }
    } catch {
      return "Please switch your wallet to BSC Mainnet.";
    }

    const sumPct = selected[0] + selected[1] + selected[2];
    if (sumPct !== 100) return "Composition must sum to 100%.";
    if (amtsAll[0] + amtsAll[1] + amtsAll[2] === 0n) return "Total amount is zero.";

    // Client-side early validation for min and multiple (from subgraph/prop)
    if (!meetsMin) return `Amount must be at least ${pkg.minAmount}.`;
    if (!isMultipleOk && effectiveMultiple) {
      const delta = toNextMultipleDelta;
      return `Amount must be a multiple of ${effectiveMultiple}. Add +${delta} to fix.`;
    }

    const paused = await isPaused();
    if (paused === true) return "Contract is paused.";

    if (!finalRef) return "Internal: missing default referrer.";
    const refOk = await isReferrerValid(finalRef);
    if (!refOk) return "Referrer is not eligible (must be whitelisted or have staked before).";

    // Balance checks
    const names = tokenMeta?.map((m) => m.symbol) ?? ["YY", "SY", "PY"];
    for (let i = 0; i < tokensAll.length; i++) {
      const want = amtsAll[i] || 0n;
      if (want === 0n) continue;
      const bal = (await publicClient.readContract({
        address: tokensAll[i],
        abi: ERC20_VIEW_ABI,
        functionName: "balanceOf",
        args: [address],
      })) as bigint;
      if (bal < want)
        return `${names[i]}: insufficient balance. Need ${fmt(want)}, have ${fmt(bal)}`;
    }
    return null;
  }

  async function readAllowance(
    owner: Address,
    token: Address,
    spender: Address
  ): Promise<bigint> {
    return (await publicClient.readContract({
      address: token,
      abi: ERC20_ABI,
      functionName: "allowance",
      args: [owner, spender],
    })) as bigint;
  }

  async function approveWithRetry(
    owner: Address,
    token: Address,
    spender: Address,
    target: bigint
  ) {
    const doApprove = async (amount: bigint) => {
      const sim = await publicClient.simulateContract({
        chain: bsc,
        address: token,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [spender, amount],
        account: owner,
      });
      const tx = await walletClient!.writeContract({ ...sim.request, chain: bsc });
      await publicClient.waitForTransactionReceipt({ hash: tx, confirmations: WAIT_CONFIRMATIONS });
    };

    try {
      await doApprove(target);
    } catch {
      try { await doApprove(0n); } catch {}
      await doApprove(target);
    }
  }

  async function ensureApprovalForBundle(
    owner: Address,
    spender: Address,
    tokens: Address[],
    amounts: bigint[]
  ) {
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      const need = amounts[i] ?? 0n;
      if (need === 0n) continue;

      const before = await readAllowance(owner, token, spender);
      const isYY = token.toLowerCase() === yYearn.toLowerCase();
      const target = isYY && !USE_MAX_ALLOWANCE_FOR_YY ? need : MAX_UINT256;

      if (before >= need && (!isYY || (USE_MAX_ALLOWANCE_FOR_YY ? before > 0n : true))) {
        continue; // sufficient
      }

      await approveWithRetry(owner, token, spender, target);

      // verify via polling
      let ok = false;
      for (let tries = 0; tries < ALLOWANCE_POLL_ATTEMPTS; tries++) {
        const a = await readAllowance(owner, token, spender);
        if (a >= need) { ok = true; break; }
        await sleep(ALLOWANCE_POLL_DELAY_MS);
      }
      if (!ok) {
        const a = await readAllowance(owner, token, spender);
        throw new Error(`${isYY ? "YY" : token.toLowerCase() === sYearn.toLowerCase() ? "SY" : "PY"} approval not sufficient. Have ${a.toString()}, need ${need.toString()}`);
      }
    }
  }

  function resolveFinalReferrer(): Address {
    return DEFAULT_REFERRER;
  }

  async function sendStakeTx(finalReferrer: Address) {
    if (!walletClient || !address) throw new Error("Wallet not ready");

    const call = {
      address: stakingContract,
      abi: STAKING_ABI,
      functionName: "stake" as const,
      args: [BigInt(pkg.id), tokensAll, amtsAll, finalReferrer] as const,
      account: address,
      chain: bsc,
    };

    try {
      const sim = await publicClient.simulateContract(call);
      const hash = await walletClient.writeContract(sim.request);
      setStakeTxHash(hash);
      return hash;
    } catch (e: any) {
      safeShowEvmError(e, "Stake");
      const msg = safeNormalizeMsg(e, e?.shortMessage || e?.message || "Stake simulation failed");
      throw new Error(msg);
    }
  }

  /* ===========================
     Tx / Flow state
  =========================== */
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [stakeTxHash, setStakeTxHash] = useState<Hex | null>(null);
  const [stakeConfirmed, setStakeConfirmed] = useState(false);
  const stakeWaitRef = useRef<Promise<void> | null>(null);

  const [isApproving, setIsApproving] = useState(false);
  const [isStaking, setIsStaking] = useState(false);
  const lastStakeKeyRef = useRef<string | null>(null);

  function buildStakeKey(finalRef: Address) {
    return JSON.stringify({
      pkg: pkg.id,
      tokens: tokensAll.map((t) => t.toLowerCase()),
      amts: amtsAll.map((a) => a.toString()),
      ref: finalRef.toLowerCase(),
    });
  }

  useEffect(() => {
    if (!stakeTxHash || stakeConfirmed) return;
    if (stakeWaitRef.current) return;

    stakeWaitRef.current = (async () => {
      try {
        const receipt = await publicClient.waitForTransactionReceipt({
          hash: stakeTxHash,
          confirmations: WAIT_CONFIRMATIONS,
        });
        if (receipt.status === "reverted") {
          setStakeConfirmed(false);
          const appErr = explainTxError("stake", new Error("Transaction reverted"));
          window.dispatchEvent(new CustomEvent("toast:error", { detail: { title: appErr.title, description: appErr.message, severity: appErr.severity } }));
          setActionMsg(appErr.message);
          return;
        }

        // Optimistic event for UI tables
        try {
          let stakeIndexStr: string | undefined;
          let pkgIdNum: number | undefined;
          let startTsNum: number | undefined;

          for (const lg of receipt.logs || []) {
            try {
              const decoded = (await publicClient.decodeEventLog({
                abi: STAKING_ABI as any,
                data: lg.data,
                topics: lg.topics,
              })) as any;
              if (decoded?.eventName === "Staked") {
                const args = decoded.args || {};
                const userArg: Address | undefined = (args.user ?? args._user ?? args.account) as Address | undefined;
                if (!userArg || userArg.toLowerCase() !== address?.toLowerCase()) continue;

                stakeIndexStr = String(args.stakeIndex ?? args._stakeIndex ?? args.index ?? args.id ?? "");
                pkgIdNum = Number(args.packageId ?? args._packageId ?? args.pid ?? args.package ?? pkg.id);
                startTsNum = Number(args.startTs ?? args.start ?? args.timestamp ?? Math.floor(Date.now() / 1000));
                break;
              }
            } catch {}
          }

          const amountLabel = `${amountNum.toLocaleString(undefined, { maximumFractionDigits: 6 })}`;

          window.dispatchEvent(new CustomEvent("stake:optimistic", {
            detail: {
              user: address,
              stakeIndex: stakeIndexStr,
              packageId: pkgIdNum ?? Number(pkg.id),
              packageName: pkg.name,
              amountLabel,
              startTs: startTsNum,
              txHash: stakeTxHash,
            },
          }));
        } catch (err) {
          console.warn("Failed to emit optimistic stake event", err);
        }

        setStakeConfirmed(true);
        window.dispatchEvent(new CustomEvent("staking:updated"));
        showUserSuccess("Stake submitted", "We’ll refresh your positions in a moment.");

        window.dispatchEvent(new CustomEvent("active-packages:refresh"));
        window.dispatchEvent(new CustomEvent("stakes:changed"));
        onClose();
      } catch (e) {
        safeShowEvmError(e, "Stake");
        setActionMsg(safeNormalizeMsg(e));
      } finally {
        stakeWaitRef.current = null;
      }
    })();
  }, [publicClient, onClose, stakeTxHash, stakeConfirmed, amountNum, pkg.id, pkg.name, address]);

  /* ===========================
     CTA handler
  =========================== */
  async function handleApproveAndStake() {
    setActionMsg(null);
    try {
      // Early UI guard
      if (!meetsMin) throw new Error(`Amount must be at least ${pkg.minAmount}.`);
      if (!isMultipleOk && effectiveMultiple) {
        throw new Error(`Amount must be a multiple of ${effectiveMultiple}. Tip: tap “+${toNextMultipleDelta}” to fix.`);
      }

      if (!walletClient || !address) throw new Error("Connect wallet.");
      await ensureBsc();
      const finalRef = resolveFinalReferrer();
      const key = buildStakeKey(finalRef);
      if (isStaking || isApproving || lastStakeKeyRef.current === key) {
        warn("duplicate approve&stake suppressed", { key });
        return;
      }
      lastStakeKeyRef.current = key;

      const sanity = await preStakeSanityCheck(finalRef);
      if (sanity) throw new Error(sanity);

      // 1) Approvals
      setIsApproving(true);
      await ensureApprovalForBundle(address as Address, stakingContract, tokensAll, amtsAll);
      setIsApproving(false);

      // 2) Stake
      setIsStaking(true);
      await sendStakeTx(finalRef);
    } catch (e: unknown) {
      lastStakeKeyRef.current = null;
      setIsApproving(false);
      setIsStaking(false);
      safeShowEvmError(e, "Stake");
      setActionMsg(safeNormalizeMsg(e));
    }
  }

  /* ===========================
     Allocation helpers
  =========================== */
  const formatWei = (wei: bigint, dec: number) => prettyFixed(wei, dec, 2);

  const haveWei: [bigint, bigint, bigint] = [
    tokenMeta?.[0]?.balance ?? 0n,
    tokenMeta?.[1]?.balance ?? 0n,
    tokenMeta?.[2]?.balance ?? 0n,
  ];
  const decs: [number, number, number] = [
    tokenMeta?.[0]?.decimals ?? 18,
    tokenMeta?.[1]?.decimals ?? 18,
    tokenMeta?.[2]?.decimals ?? 18,
  ];
  const needWei: [bigint, bigint, bigint] = [
    amtsAll[0] ?? 0n,
    amtsAll[1] ?? 0n,
    amtsAll[2] ?? 0n,
  ];
  const shortWei: [bigint, bigint, bigint] = [
    needWei[0] > haveWei[0] ? needWei[0] - haveWei[0] : 0n,
    needWei[1] > haveWei[1] ? needWei[1] - haveWei[1] : 0n,
    needWei[2] > haveWei[2] ? needWei[2] - haveWei[2] : 0n,
  ];
  const hasSufficientBalances =
    shortWei[0] === 0n && shortWei[1] === 0n && shortWei[2] === 0n;

  /* ===========================
     UI state
  =========================== */
  const projectedEarnings = amountNum * (pkg.apy / 100);

  const mainDisabled =
    isApproving ||
    isStaking ||
    !!stakeTxHash ||
    !address ||
    amountNum < pkg.minAmount ||
    (!!effectiveMultiple && !isMultipleOk) || // enforce multiples from subgraph/prop
    validCompositions.length === 0 ||
    !!chainIssue ||
    (amtsAll[0] + amtsAll[1] + amtsAll[2] === 0n) ||
    !hasSufficientBalances;

  const mainBtnText =
    isApproving
      ? "Approving…"
      : isStaking && !stakeTxHash
      ? "Sending stake…"
      : !!stakeTxHash
      ? "Confirming…"
      : stakeConfirmed
      ? "Staked"
      : "Approve & Stake";

  /* ===========================
     Render
  =========================== */
  return (
    <div className="fixed inset-0 z-50 flex items-stretch sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 w-full h-full sm:h-auto sm:max-h-[90vh] sm:rounded-2xl shadow-2xl max-w-lg sm:max-w-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 sm:px-6 py-4 border-b border-gray-200/60 dark:border-white/10 bg-white/80 dark:bg-gray-900/80 backdrop-blur">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
            Stake {pkg.name}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5 space-y-5">
          {/* Summary */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl p-3 sm:p-4 bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-900/20 dark:to-indigo-900/20 border border-violet-100 dark:border-white/10">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 shrink-0 text-violet-500" />
                <span className="text-gray-600 dark:text-gray-400">Duration</span>
                <span className="ml-auto font-medium text-gray-900 dark:text-white">
                  {pkg.durationYears} {pkg.durationYears === 1 ? "Year" : "Years"}
                </span>
              </div>
            </div>
            <div className="rounded-xl p-3 sm:p-4 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-100 dark:border-white/10">
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="w-4 h-4 shrink-0 text-emerald-600" />
                <span className="text-gray-600 dark:text-gray-400">APY</span>
                <span className="ml-auto font-medium text-emerald-700 dark:text-emerald-400">
                  {pkg.apy}%
                </span>
              </div>
            </div>
          </div>

          {/* Amount + Multiples UX */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-800 dark:text-gray-200">
              Stake Amount
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min={pkg.minAmount}
                step={effectiveMultiple || 1}
                inputMode="decimal"
                className={`w-full pl-11 pr-4 py-3 rounded-xl border text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:ring-2 focus:border-transparent
                  {!!effectiveMultiple && (!isMultipleOk || !meetsMin)
                    ? "bg-rose-50/60 dark:bg-rose-900/20 border-rose-300 dark:border-rose-700 focus:ring-rose-500"
                    : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-white/10 focus:ring-violet-500"}`}
                aria-invalid={!!effectiveMultiple && (!isMultipleOk || !meetsMin)}
              />
            </div>

            {/* Helper + Quick Add Multiples */}
            <div className="flex flex-col gap-2">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Minimum: {prettyUSD(pkg.minAmount)} •{" "}
                {effectiveMultiple ? `Multiples of ${prettyUSD(effectiveMultiple)}` : "Multiples not enforced"}
              </p>

              <div className="flex flex-wrap items-center gap-2">
                {/* Fix chip only when invalid multiple */}
                {!!effectiveMultiple && !isMultipleOk && (
                  <button
                    type="button"
                    onClick={nudgeToNextValid}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
                               bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200 hover:opacity-90"
                  >
                    <Plus className="w-3 h-3" />
                    Fix +{toNextMultipleDelta}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => effectiveMultiple && bumpByMultiples(1)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
                              ${effectiveMultiple
                                ? "bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-200 hover:opacity-90"
                                : "bg-gray-200/50 text-gray-500 dark:bg-white/10 dark:text-gray-400 cursor-not-allowed"}`}
                  disabled={!effectiveMultiple}
                >
                  <Plus className="w-3 h-3" />
                  +1×
                </button>

                <button
                  type="button"
                  onClick={() => effectiveMultiple && bumpByMultiples(5)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
                              ${effectiveMultiple
                                ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-200 hover:opacity-90"
                                : "bg-gray-200/50 text-gray-500 dark:bg-white/10 dark:text-gray-400 cursor-not-allowed"}`}
                  disabled={!effectiveMultiple}
                >
                  <Plus className="w-3 h-3" />
                  +5×
                </button>

                <button
                  type="button"
                  onClick={nudgeToMin}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
                             bg-gray-100 text-gray-800 dark:bg-white/10 dark:text-gray-200 hover:opacity-90"
                >
                  Set to Min
                </button>
              </div>

              {!meetsMin && (
                <p className="text-xs text-rose-600 dark:text-rose-400">
                  Amount must be at least {prettyUSD(pkg.minAmount)}.
                </p>
              )}
              {!!effectiveMultiple && !isMultipleOk && (
                <p className="text-xs text-rose-600 dark:text-rose-400">
                  Amount must be a multiple of {prettyUSD(effectiveMultiple)}. Tap “Fix +{toNextMultipleDelta}”.
                </p>
              )}
            </div>
          </div>

          {/* Composition */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                Choose a composition
              </h4>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {compLoading ? "Loading…" : compError ? "Failed to load" : `${validCompositions.length} options`}
              </span>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {validCompositions.map((c, i) => {
                const active = i === selectedIdx;
                return (
                  <button
                    key={`${c.join("-")}-${i}`}
                    onClick={() => setSelectedIdx(i)}
                    className={`px-4 py-2 rounded-2xl border text-sm transition-all touch-manipulation ${
                      active
                        ? "bg-violet-600 text-white border-violet-600 shadow-sm"
                        : "bg-white/60 dark:bg-white/5 text-gray-800 dark:text-gray-200 border-gray-300/60 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10"
                    }`}
                  >
                    [{c.join(", ")}]
                  </button>
                );
              })}
            </div>
          </div>

          {/* Allocation (Need vs Have) */}
          <div className="rounded-xl p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/10">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
              Allocation
            </h3>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className={`rounded-lg px-2 py-2 border ${
                (amtsAll[0] ?? 0n) > (haveWei[0] ?? 0n)
                  ? "bg-rose-50/60 dark:bg-rose-900/20 border-rose-200/60 dark:border-rose-900/40"
                  : "bg-white dark:bg-white/5 border-gray-200 dark:border-white/10"
              }`}>
                <div className="text-[11px] uppercase tracking-wide text-gray-500">YYEARN</div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                  Need {formatWei(amtsAll[0] ?? 0n, decs[0])}
                </div>
                <div className="mt-1 text-[11px]">
                  <span className="text-gray-500">Have </span>
                  <span className="font-medium">{formatWei(haveWei[0], decs[0])}</span>
                </div>
              </div>
              <div className={`rounded-lg px-2 py-2 border ${
                (amtsAll[1] ?? 0n) > (haveWei[1] ?? 0n)
                  ? "bg-rose-50/60 dark:bg-rose-900/20 border-rose-200/60 dark:border-rose-900/40"
                  : "bg-white dark:bg-white/5 border-gray-200 dark:border-white/10"
              }`}>
                <div className="text-[11px] uppercase tracking-wide text-gray-500">SYEARN</div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                  Need {formatWei(amtsAll[1] ?? 0n, decs[1])}
                </div>
                <div className="mt-1 text-[11px]">
                  <span className="text-gray-500">Have </span>
                  <span className="font-medium">{formatWei(haveWei[1], decs[1])}</span>
                </div>
              </div>
              <div className={`rounded-lg px-2 py-2 border ${
                (amtsAll[2] ?? 0n) > (haveWei[2] ?? 0n)
                  ? "bg-rose-50/60 dark:bg-rose-900/20 border-rose-200/60 dark:border-rose-900/40"
                  : "bg-white dark:bg-white/5 border-gray-200 dark:border-white/10"
              }`}>
                <div className="text-[11px] uppercase tracking-wide text-gray-500">PYEARN</div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                  Need {formatWei(amtsAll[2] ?? 0n, decs[2])}
                </div>
                <div className="mt-1 text-[11px]">
                  <span className="text-gray-500">Have </span>
                  <span className="font-medium">{formatWei(haveWei[2], decs[2])}</span>
                </div>
              </div>
            </div>
            {((amtsAll[0] ?? 0n) > (haveWei[0] ?? 0n) ||
              (amtsAll[1] ?? 0n) > (haveWei[1] ?? 0n) ||
              (amtsAll[2] ?? 0n) > (haveWei[2] ?? 0n)) && (
              <p className="mt-3 text-xs text-rose-600 dark:text-rose-400">
                Insufficient balance for the selected allocation. Reduce amount or adjust composition.
              </p>
            )}
          </div>

          {/* Earnings */}
          <div className="rounded-xl p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/10">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
              Projected Annual Earnings
            </h3>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {prettyUSD(projectedEarnings)}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Based on {pkg.apy}% APY</p>
          </div>

          {chainIssue && (
            <div className="text-xs text-amber-600 dark:text-amber-400">{chainIssue}</div>
          )}
          {actionMsg && <div className="text-sm text-rose-500">{actionMsg}</div>}
        </div>

        {/* Footer (single CTA) */}
        <div className="sticky bottom-0 z-10 p-4 sm:p-5 bg-white/80 dark:bg-gray-900/80 backdrop-blur border-t border-gray-200/60 dark:border-white/10">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleApproveAndStake}
              disabled={mainDisabled}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all ${
                mainDisabled
                  ? "bg-gradient-to-r from-violet-900/30 to-indigo-900/30 text-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 text-white shadow-sm"
              }`}
            >
              {isApproving || isStaking || !!stakeTxHash ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Zap className="w-4 h-4" />
              )}
              <span>{mainBtnText}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StakingModal;
