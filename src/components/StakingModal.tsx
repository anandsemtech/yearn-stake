// src/components/StakingModal.tsx
import { X, DollarSign, Calendar, TrendingUp, Lock, Zap, User, LockKeyhole } from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Address,
  BaseError,
  Hex,
  decodeErrorResult,
  parseUnits,
} from "viem";

import {
  useAccount,
  usePublicClient as useWagmiPublicClient,
  useWalletClient,
} from "wagmi";

import { useAllowedCompositions } from "@/hooks/useAllowedCompositionsOnChain";
import { STAKING_ABI } from "@/web3/abi/stakingAbi";
import { baseSepolia } from "viem/chains";
import { createPublicClient, http } from "viem";

/* ===========================
   Debug helpers
=========================== */
const DEBUG = true;
const log  = (...a: any[]) => DEBUG && console.log("🟣[stake]", ...a);
const warn = (...a: any[]) => DEBUG && console.warn("🟣[stake]", ...a);
const err  = (...a: any[]) => DEBUG && console.error("🟣[stake]", ...a);
const short = (s?: string) => (s && s.length > 12 ? `${s.slice(0,6)}…${s.slice(-4)}` : s);
const fmt = (x: bigint) => x.toString();

const ZERO_ADDR = "0x0000000000000000000000000000000000000000" as Address;
const NEUTRAL_REF = "0x0000000000000000000000000000000000000001" as Address;
const MAX_UINT256 = (2n ** 256n) - 1n;

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
    stakeMultiple?: number;
  };
  onClose: () => void;
}

/* ===========================
   Env addresses
=========================== */
const yYearn = (
  import.meta.env.VITE_YYEARN_TOKEN_ADDRESS ||
  import.meta.env.VITE_YYEARN_ADDRESS ||
  ""
) as Address;

const sYearn = (
  import.meta.env.VITE_SYEARN_TOKEN_ADDRESS ||
  import.meta.env.VITE_SYEARN_ADDRESS ||
  ""
) as Address;

const pYearn = (
  import.meta.env.VITE_PYEARN_TOKEN_ADDRESS ||
  import.meta.env.VITE_PYEARN_ADDRESS ||
  ""
) as Address;

// address equality (case-insensitive)
const eqAddr = (a?: string, b?: string) =>
  !!a && !!b && a.toLowerCase() === b.toLowerCase();

const stakingContract = (import.meta.env.VITE_BASE_CONTRACT_ADDRESS ?? "") as Address;
const DEFAULT_REFERRER = (import.meta.env.VITE_DEFAULT_REFERRER || "") as Address;

/* ===========================
   ERC20 ABIs
=========================== */
const ERC20_ABI = [
  { type: "function", name: "allowance", stateMutability: "view", inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ], outputs: [{ name: "", type: "uint256" }] },
  { type: "function", name: "approve", stateMutability: "nonpayable", inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ], outputs: [{ name: "", type: "bool" }] },
] as const;

const ERC20_VIEW_ABI = [
  { type: "function", name: "decimals", stateMutability: "view", inputs: [], outputs: [{ type: "uint8" }] },
  { type: "function", name: "symbol", stateMutability: "view", inputs: [], outputs: [{ type: "string" }] },
  { type: "function", name: "name", stateMutability: "view", inputs: [], outputs: [{ type: "string" }] },
  { type: "function", name: "balanceOf", stateMutability: "view", inputs: [{ name: "owner", type: "address" }], outputs: [{ type: "uint256" }] },
] as const;

const ERC20_ERROR_ABI = [
  { type: "error", name: "ERC20InsufficientBalance", inputs: [
      { name: "sender", type: "address" },
      { name: "needed", type: "uint256" },
      { name: "balance", type: "uint256" },
    ] },
  { type: "error", name: "ERC20InsufficientAllowance", inputs: [
      { name: "spender", type: "address" },
      { name: "needed", type: "uint256" },
      { name: "allowance", type: "uint256" },
    ] },
] as const;

/* ===========================
   Minimal ABI frags
=========================== */
const REF_GETTER_ABI = [
  { type: "function", name: "referrerOf", stateMutability: "view", inputs: [{ name: "user", type: "address" }], outputs: [{ type: "address" }] },
] as const;

const STAKING_READS_ABI = [
  { type: "function", name: "userTotalStaked", stateMutability: "view", inputs: [{ name: "user", type: "address" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "isWhitelisted", stateMutability: "view", inputs: [{ name: "user", type: "address" }], outputs: [{ type: "bool" }] },
  { type: "function", name: "paused", stateMutability: "view", inputs: [], outputs: [{ type: "bool" }] },
  {
    type: "function",
    name: "packages",
    stateMutability: "view",
    inputs: [{ name: "id", type: "uint256" }],
    outputs: [
      { name: "id", type: "uint16" },
      { name: "durationInDays", type: "uint16" },
      { name: "apr", type: "uint16" },
      { name: "monthlyUnstake", type: "bool" },
      { name: "isActive", type: "bool" },
      { name: "minStakeAmount", type: "uint256" },
      { name: "monthlyPrincipalReturnPercent", type: "uint16" },
      { name: "monthlyAPRClaimable", type: "bool" },
      { name: "claimableInterval", type: "uint256" },
      { name: "stakeMultiple", type: "uint256" },
      { name: "principalLocked", type: "bool" },
    ],
  },
] as const;

/* ===========================
   Utils
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
const prettyUSD = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 6 });
const clampToMultiple = (amount: number, multiple?: number) => {
  if (!multiple || multiple <= 0) return amount;
  const k = Math.floor(amount / multiple);
  return k * multiple;
};
const isAddressLike = (a?: string) => !!a && /^0x[a-fA-F0-9]{40}$/.test(a);

/* ===========================
   Revert decoding
=========================== */
function decodeRevert(e: unknown): string {
  if (!(e instanceof BaseError)) return (e as Error)?.message || "Transaction reverted";
  const walked = (e as any).walk?.() ?? e;
  const data =
    (walked as any)?.data ||
    (walked as any)?.cause?.data ||
    (walked as any)?.cause?.cause?.data;

  const shortMsg = (walked as any)?.shortMessage || (e as Error)?.message || "Transaction reverted";
  const norm = (shortMsg || "").toLowerCase();

  if (norm.includes("referreralreadyset") || norm.includes("alreadyreferralset") || norm.includes("referrer already set")) {
    return "Referral is already set for this wallet and cannot be changed.";
  }
  if (norm.includes("invalidreferrer")) {
    return "Invalid referrer. Must be whitelisted or have staked before, and cannot be you or zero address.";
  }

  if (typeof data !== "string" || data.length < 10) return shortMsg;

  try {
    const dec = decodeErrorResult({ abi: STAKING_ABI, data });
    if (dec?.errorName) {
      const name = dec.errorName.toLowerCase();
      if (name.includes("referreralreadyset")) return "Referral is already set for this wallet and cannot be changed.";
      if (name.includes("invalidreferrer")) return "Invalid referrer. Must be whitelisted or have staked before.";
      return dec.errorName;
    }
  } catch {}

  try {
    const dec = decodeErrorResult({ abi: ERC20_ERROR_ABI as any, data });
    if (dec?.errorName === "ERC20InsufficientBalance") {
      const [_sender, needed, balance] = dec.args as [string, bigint, bigint];
      return `ERC20InsufficientBalance: need ${fmt(needed)}, have ${fmt(balance)}`;
    }
    if (dec?.errorName === "ERC20InsufficientAllowance") {
      const [_spender, needed, allowance] = dec.args as [string, bigint, bigint];
      return `ERC20InsufficientAllowance: need ${fmt(needed)}, allowance ${fmt(allowance)}`;
    }
  } catch {}

  if (data.slice(0, 10) === "0x08c379a0") return "Error(string) revert";
  if (data.slice(0, 10) === "0x4e487b71") return "Panic(uint256)";
  return `${shortMsg} (selector ${data.slice(0,10)})`;
}

/* ===========================
   Component
=========================== */
const StakingModal: React.FC<StakingModalProps> = ({ package: pkg, onClose }) => {
  log("ENV", {
    chain: "Base Sepolia (84532)",
    staking: short(stakingContract),
    yYearn: short(yYearn),
    sYearn: short(sYearn),
    pYearn: short(pYearn),
  });

  const { address, chainId: connectedChainId, isConnected } = useAccount();
  const wagmiPublic = useWagmiPublicClient({ chainId: baseSepolia.id });

  // Fallback client
  const fallbackPublic = useMemo(
    () =>
      createPublicClient({
        chain: baseSepolia,
        transport: http(
          import.meta.env.VITE_BASE_SEPOLIA_RPC || "https://sepolia.base.org"
        ),
      }),
    []
  );

  const publicClient = wagmiPublic ?? fallbackPublic;
  const { data: walletClient } = useWalletClient();

  const [chainIssue, setChainIssue] = useState<string | null>(null);
  useEffect(() => {
    if (!isConnected) return;
    if (connectedChainId && connectedChainId !== baseSepolia.id) {
      setChainIssue("Please switch your wallet to Base Sepolia");
    } else {
      setChainIssue(null);
    }
  }, [isConnected, connectedChainId]);

  async function ensureBaseSepolia(): Promise<void> {
    if (!walletClient) throw new Error("Connect wallet.");

    const targetHex = `0x${baseSepolia.id.toString(16)}`;

    let currentHex: string | null = null;
    try {
      currentHex = (await walletClient.request({ method: "eth_chainId" })) as string;
    } catch {}
    if (currentHex?.toLowerCase() === targetHex.toLowerCase()) return;

    try {
      await walletClient.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: targetHex }],
      });
    } catch (e: any) {
      const needsAdd = e?.code === 4902 || /not added|unrecognized chain/i.test(e?.message || "");
      if (!needsAdd) throw new Error("Please switch your wallet to Base Sepolia.");

      await walletClient.request({
        method: "wallet_addEthereumChain",
        params: [{
          chainId: targetHex,
          chainName: "Base Sepolia",
          rpcUrls: [import.meta.env.VITE_BASE_SEPOLIA_RPC || "https://sepolia.base.org"],
          nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
          blockExplorerUrls: ["https://sepolia.basescan.org"],
        }],
      });

      await walletClient.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: targetHex }],
      });
    }

    const afterHex = (await walletClient.request({ method: "eth_chainId" })) as string;
    if (afterHex?.toLowerCase() !== targetHex.toLowerCase()) {
      throw new Error("Please switch your wallet to Base Sepolia.");
    }
  }

  /* ===========================
     Allowed compositions
  =========================== */
  const { compositions: compRows, isLoading: compLoading, error: compError } = useAllowedCompositions();

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
     Amount & splits
  =========================== */
  const [amount, setAmount] = useState(
    String(clampToMultiple(pkg.minAmount, pkg.stakeMultiple))
  );

  const amountNum = useMemo(() => {
    const n = Number(amount || 0);
    if (!isFinite(n) || n < 0) return 0;
    const clamped = clampToMultiple(n, pkg.stakeMultiple);
    return Math.max(clamped, pkg.minAmount);
  }, [amount, pkg.stakeMultiple, pkg.minAmount]);

  const humanPerToken = useMemo<[number, number, number]>(() => {
    const [py, ps, pp] = selected;
    const totalPct = py + ps + pp;
    if (totalPct !== 100) return [0, 0, 0];
    return [
      (amountNum * py) / 100,
      (amountNum * ps) / 100,
      (amountNum * pp) / 100,
    ];
  }, [amountNum, selected]);

  /* ===========================
     Token meta/balances
  =========================== */
  type TokenMeta = { address: Address; symbol: string; name: string; decimals: number; balance: bigint };
  const [tokenMeta, setTokenMeta] = useState<TokenMeta[] | null>(null);

  useEffect(() => {
    (async () => {
      if (!address) { setTokenMeta(null); return; }
      try {
        const addrs: Address[] = [yYearn, sYearn, pYearn];
        const meta = await Promise.all(addrs.map(async (addr) => {
          const [dec, sym, nam, bal] = await Promise.all([
            publicClient.readContract({ address: addr, abi: ERC20_VIEW_ABI, functionName: "decimals" }) as Promise<number>,
            publicClient.readContract({ address: addr, abi: ERC20_VIEW_ABI, functionName: "symbol" }) as Promise<string>,
            publicClient.readContract({ address: addr, abi: ERC20_VIEW_ABI, functionName: "name" }) as Promise<string>,
            publicClient.readContract({ address: addr, abi: ERC20_VIEW_ABI, functionName: "balanceOf", args: [address] }) as Promise<bigint>,
          ]);
          return { address: addr, symbol: sym, name: nam, decimals: dec, balance: bal };
        }));
        setTokenMeta(meta);
        log("tokenMeta", meta.map(m => ({ sym: m.symbol, dec: m.decimals, bal: m.balance.toString(), addr: short(m.address) })));
      } catch (e) {
        err("token meta read failed", e);
        setTokenMeta(null);
      }
    })();
  }, [address, connectedChainId, publicClient]);

  const decimals = useMemo<[number, number, number]>(() => {
    if (!tokenMeta) return [18, 18, 18];
    return [tokenMeta[0]?.decimals ?? 18, tokenMeta[1]?.decimals ?? 18, tokenMeta[2]?.decimals ?? 18];
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
  const packageId = useMemo(() => BigInt(pkg.id), [pkg.id]);

  /* ===========================
     Referrer (GLOBAL lock)
  =========================== */
  const [lockedReferrer, setLockedReferrer] = useState<Address | null>(null);
  const [lockedReferrerLoaded, setLockedReferrerLoaded] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!address) { setLockedReferrer(null); setLockedReferrerLoaded(true); return; }
      try {
        const ref = await publicClient.readContract({
          address: stakingContract,
          abi: REF_GETTER_ABI,
          functionName: "referrerOf",
          args: [address],
        }) as Address;

        if (!alive) return;
        if (ref && ref !== ZERO_ADDR) {
          log("locked referrer detected:", ref);
          setLockedReferrer(ref);
        } else {
          setLockedReferrer(null);
        }
        setLockedReferrerLoaded(true);
      } catch (e) {
        warn("referrerOf read failed; treating as not set", e);
        setLockedReferrer(null);
        setLockedReferrerLoaded(true);
      }
    })();
    return () => { alive = false; };
  }, [address, publicClient]);

  const [referrerInput, setReferrerInput] = useState<string>(() => {
    try {
      const raw = localStorage.getItem("yearn_together_referral");
      const ls = raw ? JSON.parse(raw) : null;
      const fromLS = (ls?.referrerAddress ?? "") as string;
      const chosen = (fromLS || DEFAULT_REFERRER || "").trim();
      return chosen || NEUTRAL_REF;
    } catch {
      return DEFAULT_REFERRER || NEUTRAL_REF;
    }
  });

  useEffect(() => {
    if (lockedReferrer) setReferrerInput(lockedReferrer);
  }, [lockedReferrer]);

  useEffect(() => {
    try {
      if (!lockedReferrer) {
        const payload = { referrerAddress: referrerInput?.trim() || "" };
        localStorage.setItem("yearn_together_referral", JSON.stringify(payload));
      }
    } catch {}
  }, [referrerInput, lockedReferrer]);

  const [referrerHint, setReferrerHint] = useState<null | "valid" | "invalid" | "checking" | "locked">(null);

  async function isReferrerValid(addr: Address): Promise<boolean> {
    if (!addr) return false;
    try {
      const [staked, whitelisted] = await Promise.all([
        publicClient.readContract({ address: stakingContract, abi: STAKING_READS_ABI, functionName: "userTotalStaked", args: [addr] }) as Promise<bigint>,
        publicClient.readContract({ address: stakingContract, abi: STAKING_READS_ABI, functionName: "isWhitelisted", args: [addr] }) as Promise<boolean>,
      ]);
      return (staked > 0n) || !!(whitelisted);
    } catch {
      return true;
    }
  }

  useEffect(() => {
    let alive = true;
    if (lockedReferrer) { setReferrerHint("locked"); return; }
    const raw = (referrerInput || "").trim();
    if (!raw) { setReferrerHint(null); return; }
    if (!isAddressLike(raw)) { setReferrerHint("invalid"); return; }
    if (address && raw.toLowerCase() === address.toLowerCase()) { setReferrerHint("invalid"); return; }

    setReferrerHint("checking");
    isReferrerValid(raw as Address).then(ok => {
      if (!alive) return;
      setReferrerHint(ok ? "valid" : "invalid");
    }).catch(() => alive && setReferrerHint(null));
    return () => { alive = false; };
  }, [referrerInput, lockedReferrer, address]);

  async function isPaused(): Promise<boolean | null> {
    try {
      return await publicClient.readContract({
        address: stakingContract,
        abi: STAKING_READS_ABI,
        functionName: "paused",
      }) as boolean;
    } catch {
      return null;
    }
  }

  type PkgInfo = { isActive?: boolean; minStakeAmount?: bigint; stakeMultiple?: bigint; };
  async function readPackageInfo(pid: bigint): Promise<PkgInfo | null> {
    try {
      const res = await publicClient.readContract({
        address: stakingContract,
        abi: STAKING_READS_ABI,
        functionName: "packages",
        args: [pid],
      }) as any;
      const out: PkgInfo = {};
      if (res && typeof res === "object") {
        if ("isActive" in res) out.isActive = Boolean(res.isActive);
        if ("minStakeAmount" in res) out.minStakeAmount = BigInt(res.minStakeAmount);
        if ("stakeMultiple" in res) out.stakeMultiple = BigInt(res.stakeMultiple);
      }
      return out;
    } catch {
      return null;
    }
  }

  /* ===========================
     Preflights / approvals
  =========================== */
  function validateEnv(): string | null {
    if (!isAddressLike(stakingContract)) return "Invalid staking contract address (env).";
    if (!isAddressLike(yYearn)) return "Invalid yYearn token address (env).";
    if (!isAddressLike(sYearn)) return "Invalid sYearn token address (env).";
    if (!isAddressLike(pYearn)) return "Invalid pYearn token address (env).";
    if (yYearn.toLowerCase() === sYearn.toLowerCase() ||
        yYearn.toLowerCase() === pYearn.toLowerCase() ||
        sYearn.toLowerCase() === pYearn.toLowerCase()) {
      return "Token addresses must be distinct.";
    }
    if (stakingContract === ZERO_ADDR) return "Staking contract cannot be zero address.";
    return null;
  }

  async function preStakeSanityCheck(finalRef: Address): Promise<string | null> {
    const envIssue = validateEnv();
    if (envIssue) return envIssue;

    if (!address) return "Connect wallet.";
    if (connectedChainId && connectedChainId !== baseSepolia.id) return "Please switch your wallet to Base Sepolia.";

    const sumPct = selected[0] + selected[1] + selected[2];
    if (sumPct !== 100) return "Composition must sum to 100%.";
    if ((amtsAll[0] + amtsAll[1] + amtsAll[2]) === 0n) return "Total amount is zero.";

    const paused = await isPaused();
    if (paused === true) return "Contract is paused.";

    const onchainPkg = await readPackageInfo(packageId);
    if (onchainPkg?.isActive === false) return "Package is inactive on-chain.";

    if (!lockedReferrer) {
      if (!isAddressLike(finalRef)) return "Provide a valid referrer address.";
      if (finalRef === ZERO_ADDR || (address && finalRef.toLowerCase() === address.toLowerCase())) {
        return "Invalid referrer. Cannot be zero address or yourself.";
      }
      const ok = await isReferrerValid(finalRef);
      if (!ok) return "Invalid referrer. Must be whitelisted or have staked before.";
    }

    const names = tokenMeta?.map(m => m.symbol) ?? ["YY", "SY", "PY"];
    for (let i = 0; i < tokensAll.length; i++) {
      const want = amtsAll[i] || 0n;
      if (want === 0n) continue;
      const bal = await publicClient.readContract({
        address: tokensAll[i],
        abi: ERC20_VIEW_ABI,
        functionName: "balanceOf",
        args: [address],
      }) as bigint;
      if (bal < want) {
        return `${names[i]}: insufficient balance. Need ${fmt(want)}, have ${fmt(bal)}`;
      }
    }
    return null;
  }

  async function readAllowance(owner: Address, token: Address, spender: Address): Promise<bigint> {
    return (await publicClient.readContract({
      address: token,
      abi: ERC20_ABI,
      functionName: "allowance",
      args: [owner, spender],
    })) as bigint;
  }

  async function ensureApprovalForBundle(
    owner: Address,
    spender: Address,
    tokens: Address[],
    amounts: bigint[],
  ) {
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      const need  = amounts[i] ?? 0n;
      if (need === 0n) continue;

      const have = await readAllowance(owner, token, spender);
      const isYY = eqAddr(token, yYearn);

      // Decide behavior per token
      const mustApprove = isYY ? true : (have < need);
      const targetAmount = isYY ? need : MAX_UINT256; // exact for yYearn, max for s/p

      if (!mustApprove) continue;

      // Try direct set; if it reverts, do zero-first then set
      const doApprove = async (amount: bigint) => {
        const sim = await publicClient.simulateContract({
          chain: baseSepolia,
          address: token,
          abi: ERC20_ABI,
          functionName: "approve",
          args: [spender, amount],
          account: owner,
        });
        const tx = await walletClient!.writeContract({ ...sim.request, chain: baseSepolia });
        await publicClient.waitForTransactionReceipt({ hash: tx, confirmations: 1 });
      };

      try {
        await doApprove(targetAmount);
      } catch {
        await doApprove(0n);
        await doApprove(targetAmount);
      }

      // verify
      const after = await readAllowance(owner, token, spender);
      if (!isYY && after < need) {
        throw new Error(`Approval not sufficient for ${short(token)}. Have ${after.toString()}, need ${need.toString()}`);
      }
      if (isYY && after < need) {
        throw new Error(`yYearn exact approval failed. Have ${after.toString()}, need ${need.toString()}`);
      }
    }
  }

  function resolveFinalReferrer(): Address {
    if (lockedReferrer) return lockedReferrer;
    const raw = (referrerInput || "").trim() as Address;
    if (!raw) return NEUTRAL_REF;
    if (address && raw.toLowerCase() === address.toLowerCase()) return NEUTRAL_REF;
    return raw;
  }

  async function sendStakeTx(finalReferrer: Address) {
    if (!walletClient || !address) throw new Error("Wallet not ready");

    const call = {
      address: stakingContract,
      abi: STAKING_ABI,
      functionName: "stake" as const,
      args: [BigInt(pkg.id), tokensAll, amtsAll, finalReferrer] as const,
      account: address,
      chain: baseSepolia,
    };

    log("stake.args", {
      packageId: pkg.id,
      tokens: tokensAll,
      amounts: amtsAll.map(String),
      finalReferrer,
      locked: !!lockedReferrer,
    });

    try {
      const sim = await publicClient.simulateContract(call);
      log("stake.sim OK", { gas: sim?.request?.gas?.toString?.() });
      const hash = await walletClient.writeContract(sim.request);
      log("stake.sent", hash);
      setStakeTxHash(hash);
      return hash;
    } catch (e) {
      const reason = decodeRevert(e);
      err("simulate/send stake failed:", reason, e);
      throw new Error(reason);
    }
  }

  /* ===========================
     Tx / Flow state
  =========================== */
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [stakeTxHash, setStakeTxHash] = useState<Hex | null>(null);
  const [stakeConfirmed, setStakeConfirmed] = useState(false);
  const stakeWaitRef = useRef<Promise<void> | null>(null);

  const [isStaking, setIsStaking] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const lastStakeKeyRef = useRef<string | null>(null);
  function buildStakeKey(finalRef: Address) {
    return JSON.stringify({
      pkg: pkg.id,
      tokens: tokensAll.map(t => t.toLowerCase()),
      amts: amtsAll.map(a => a.toString()),
      ref: finalRef.toLowerCase(),
    });
  }

  useEffect(() => {
    if (!stakeTxHash || stakeConfirmed) return;
    if (stakeWaitRef.current) return;

    stakeWaitRef.current = (async () => {
      try {
        log("waiting receipt", stakeTxHash);
        const receipt = await publicClient.waitForTransactionReceipt({
          hash: stakeTxHash,
          confirmations: 1,
        });
        log("receipt", { status: receipt.status, block: receipt.blockNumber });

        if (receipt.status === "reverted") {
          setStakeConfirmed(false);
          setActionMsg("Transaction reverted on-chain.");
          return;
        }

        setStakeConfirmed(true);
        window.dispatchEvent(new CustomEvent("staking:updated"));
        onClose();
      } catch (e) {
        err("wait receipt failed", e);
        setActionMsg(decodeRevert(e));
      } finally {
        stakeWaitRef.current = null;
      }
    })();
  }, [publicClient, onClose, stakeTxHash, stakeConfirmed]);

  /* ===========================
     Live approval needs (for UX)
  =========================== */
  async function getApprovalDeficits(
    owner: Address,
    tokens: Address[],
    amounts: bigint[],
    spender: Address,
  ) {
    const out: Array<{ token: Address; have: bigint; need: bigint; i: number }> = [];

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      const need  = amounts[i] ?? 0n;
      if (need === 0n) continue;

      const have = await readAllowance(owner, token, spender);

      // yYearn => force approval every time (if need>0)
      if (eqAddr(token, yYearn)) {
        out.push({ token, have, need, i });
        continue;
      }

      // sYearn / pYearn => only when insufficient
      if (have < need) out.push({ token, have, need, i });
    }

    log("approval deficits", out.map(d => ({
      token: short(d.token), have: d.have.toString(), need: d.need.toString()
    })));
    return out;
  }

  const [approvalNeeds, setApprovalNeeds] = useState<{ count: number; tokens: Address[] }>({ count: 0, tokens: [] });
  const symbolFor = (addr: Address) =>
    tokenMeta?.find(m => m.address.toLowerCase() === addr.toLowerCase())?.symbol ?? short(addr);

  const refreshApprovalNeeds = useRef<() => void>(() => {});
  refreshApprovalNeeds.current = async () => {
    try {
      if (!address) { setApprovalNeeds({ count: 0, tokens: [] }); return; }
      const deficits = await getApprovalDeficits(address as Address, tokensAll, amtsAll, stakingContract);
      setApprovalNeeds({ count: deficits.length, tokens: deficits.map(d => d.token) });
    } catch {
      // ignore UX-only errors
    }
  };

  useEffect(() => { refreshApprovalNeeds.current(); }, [address, connectedChainId, stakingContract, tokensAll, amtsAll]);

  /* ===========================
     Handlers
  =========================== */
  async function commonPre(finalRef: Address) {
    setActionMsg(null);
    if (!walletClient || !address) throw new Error("Connect wallet.");
    await ensureBaseSepolia();
    const sanity = await preStakeSanityCheck(finalRef);
    if (sanity) throw new Error(sanity);
  }

  const handleApproveAll = async () => {
    try {
      const finalRef = resolveFinalReferrer();
      await commonPre(finalRef);

      setIsApproving(true);

      // 1) Check if any approvals are actually needed
      const deficits = await getApprovalDeficits(address as Address, tokensAll, amtsAll, stakingContract);
      if (deficits.length === 0) {
        setActionMsg("No approval needed — opening staking…");
        setIsApproving(false);         // stop approve spinner
        await handleStake();           // auto-continue to staking (MetaMask should open)
        return;
      }

      // 2) Do the approvals (MetaMask will open here)
      await ensureApprovalForBundle(address as Address, stakingContract, tokensAll, amtsAll);

      // 3) Refresh status and guide user clearly
      await refreshApprovalNeeds.current();
      setActionMsg("Approvals done. You can stake now.");
    } catch (e) {
      setActionMsg(decodeRevert(e));
    } finally {
      setIsApproving(false);
    }
  };

  const handleStake = async () => {
    try {
      const finalRef = resolveFinalReferrer();
      const key = buildStakeKey(finalRef);

      if (isStaking || lastStakeKeyRef.current === key) {
        warn("duplicate stake suppressed", { key });
        return;
      }
      setIsStaking(true);
      lastStakeKeyRef.current = key;

      await commonPre(finalRef);

      // Make sure allowances are still fine (race-safe)
      await ensureApprovalForBundle(address as Address, stakingContract, tokensAll, amtsAll);

      await sendStakeTx(finalRef);
    } catch (e) {
      lastStakeKeyRef.current = null;
      setActionMsg(decodeRevert(e));
    } finally {
      setIsStaking(false);
    }
  };

  /* ===========================
     Allocation Need/Have helpers
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
    amtsAll[0] ?? 0n, amtsAll[1] ?? 0n, amtsAll[2] ?? 0n,
  ];
  const shortWei: [bigint, bigint, bigint] = [
    needWei[0] > haveWei[0] ? (needWei[0] - haveWei[0]) : 0n,
    needWei[1] > haveWei[1] ? (needWei[1] - haveWei[1]) : 0n,
    needWei[2] > haveWei[2] ? (needWei[2] - haveWei[2]) : 0n,
  ];

  const hasSufficientBalances = (shortWei[0] === 0n && shortWei[1] === 0n && shortWei[2] === 0n);

  /* ===========================
     UI state
  =========================== */
  const projectedEarnings = amountNum * (pkg.apy / 100);

  const approveDisabled =
    isApproving ||
    !address ||
    amountNum < pkg.minAmount ||
    validCompositions.length === 0 ||
    !hasSufficientBalances;

  const stakeDisabled =
    isStaking ||
    !!stakeTxHash ||
    isApproving ||
    !address ||
    amountNum < pkg.minAmount ||
    validCompositions.length === 0 ||
    !!chainIssue ||
    (amtsAll[0] + amtsAll[1] + amtsAll[2] === 0n) ||
    !hasSufficientBalances;

  const approveBtnText =
    isApproving
      ? "Approving…"
      : approvalNeeds.count > 0
        ? `Approve ${approvalNeeds.count} Token${approvalNeeds.count > 1 ? "s" : ""}`
        : "No approval needed — Stake";

  /* ===========================
     Render
  =========================== */
  return (
    <div className="fixed inset-0 z-50 flex items-stretch sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 w-full h-full sm:h-auto sm:max-h-[90vh] sm:rounded-2xl shadow-2xl max-w-lg sm:max-w-2xl flex flex-col overflow-hidden">
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 sm:px-6 py-4 border-b border-gray-200/60 dark:border-white/10 bg-white/80 dark:bg-gray-900/80 backdrop-blur">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Stake {pkg.name}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5 space-y-5">
          {/* Summary pill row */}
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

          {/* Amount */}
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
                step={pkg.stakeMultiple ?? 1}
                inputMode="decimal"
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Minimum: {prettyUSD(pkg.minAmount)}
              {pkg.stakeMultiple ? ` • Multiples of ${prettyUSD(pkg.stakeMultiple)}` : ""}
            </p>
          </div>

          {/* Composition chooser */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Choose a composition</h4>
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
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Allocation</h3>

            <div className="grid grid-cols-3 gap-3 text-center">
              {/* yYearn */}
              <div className={`rounded-lg px-2 py-2 border
                ${needWei[0] > haveWei[0]
                  ? "bg-rose-50/60 dark:bg-rose-900/20 border-rose-200/60 dark:border-rose-900/40"
                  : "bg-white dark:bg-white/5 border-gray-200 dark:border-white/10"}`}>
                <div className="text-[11px] uppercase tracking-wide text-gray-500">YYEARN</div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                  Need {formatWei(needWei[0], decs[0])}
                </div>
                <div className="mt-1 text-[11px]">
                  <span className="text-gray-500">Have </span>
                  <span className="font-medium">{formatWei(haveWei[0], decs[0])}</span>
                </div>
              </div>

              {/* sYearn */}
              <div className={`rounded-lg px-2 py-2 border
                ${needWei[1] > haveWei[1]
                  ? "bg-rose-50/60 dark:bg-rose-900/20 border-rose-200/60 dark:border-rose-900/40"
                  : "bg-white dark:bg-white/5 border-gray-200 dark:border-white/10"}`}>
                <div className="text-[11px] uppercase tracking-wide text-gray-500">SYEARN</div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                  Need {formatWei(needWei[1], decs[1])}
                </div>
                <div className="mt-1 text-[11px]">
                  <span className="text-gray-500">Have </span>
                  <span className="font-medium">{formatWei(haveWei[1], decs[1])}</span>
                </div>
              </div>

              {/* pYearn */}
              <div className={`rounded-lg px-2 py-2 border
                ${needWei[2] > haveWei[2]
                  ? "bg-rose-50/60 dark:bg-rose-900/20 border-rose-200/60 dark:border-rose-900/40"
                  : "bg-white dark:bg-white/5 border-gray-200 dark:border-white/10"}`}>
                <div className="text-[11px] uppercase tracking-wide text-gray-500">PYEARN</div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white">
                  Need {formatWei(needWei[2], decs[2])}
                </div>
                <div className="mt-1 text-[11px]">
                  <span className="text-gray-500">Have </span>
                  <span className="font-medium">{formatWei(haveWei[2], decs[2])}</span>
                </div>
              </div>
            </div>

            {!hasSufficientBalances && (
              <p className="mt-3 text-xs text-rose-600 dark:text-rose-400">
                Insufficient balance for the selected allocation. Reduce amount or adjust composition.
              </p>
            )}
          </div>

          {/* Approvals status */}
          <div className="rounded-lg px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/10">
            {approvalNeeds.count === 0 ? (
              <span className="text-xs text-emerald-700 dark:text-emerald-300">Approvals: none needed ✅</span>
            ) : (
              <span className="text-xs text-amber-700 dark:text-amber-300">
                Approvals needed: {approvalNeeds.tokens.map(symbolFor).join(", ")}
              </span>
            )}
          </div>

          {/* Referrer */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-800 dark:text-gray-200">
                Referrer (address)
              </label>
              {lockedReferrerLoaded && lockedReferrer && (
                <span className="flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-300">
                  <LockKeyhole className="w-3.5 h-3.5" />
                  Referral locked for this wallet
                </span>
              )}
            </div>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={referrerInput}
                onChange={(e) => !lockedReferrer && setReferrerInput(e.target.value)}
                readOnly={!!lockedReferrer}
                disabled={!!lockedReferrer}
                spellCheck={false}
                className={`w-full pl-11 pr-24 py-3 rounded-xl border focus:ring-2 focus:ring-violet-500 focus:border-transparent
                  ${lockedReferrer
                    ? "bg-gray-100 dark:bg-gray-800/60 border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                    : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-white/10 text-gray-900 dark:text-gray-100"}`}
              />
              {referrerHint && (
                <span className={`absolute right-2 top-1/2 -translate-y-1/2 text-xs px-2.5 py-1 rounded-full ${
                  referrerHint === "checking"
                    ? "bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-gray-300"
                    : referrerHint === "valid" || referrerHint === "locked"
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                      : "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300"
                }`}>
                  {referrerHint === "checking" ? "Checking…" : referrerHint === "locked" ? "Locked" : referrerHint === "valid" ? "Valid" : "Invalid"}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {lockedReferrerLoaded && lockedReferrer
                ? "You’ve already set a referrer for this wallet; it cannot be changed."
                : "Referrer must be whitelisted or have staked before, and cannot be you."}
            </p>
          </div>

          {/* Earnings */}
          <div className="rounded-xl p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-white/10">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">Projected Annual Earnings</h3>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {prettyUSD(projectedEarnings)}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">Based on {pkg.apy}% APY</p>
          </div>

          {chainIssue && <div className="text-xs text-amber-600 dark:text-amber-400">{chainIssue}</div>}
          {actionMsg && <div className="text-sm text-rose-500">{actionMsg}</div>}
        </div>

        {/* Sticky Footer (CTA buttons) */}
        <div className="sticky bottom-0 z-10 p-4 sm:p-5 bg-white/80 dark:bg-gray-900/80 backdrop-blur border-t border-gray-200/60 dark:border-white/10">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleApproveAll}
              disabled={approveDisabled}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all ${
                approveDisabled
                  ? "bg-amber-800/30 text-amber-200 cursor-not-allowed"
                  : "bg-amber-600 hover:bg-amber-700 text-white shadow-sm"
              }`}
            >
              {isApproving
                ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <Lock className="w-4 h-4" />
              }
              <span>{approveBtnText}</span>
            </button>

            <button
              onClick={handleStake}
              disabled={stakeDisabled}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all ${
                stakeDisabled
                  ? "bg-gradient-to-r from-violet-900/30 to-indigo-900/30 text-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 text-white shadow-sm"
              }`}
            >
              {!stakeTxHash
                ? <Zap className="w-4 h-4" />
                : <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              }
              <span>{stakeConfirmed ? "Staked" : !stakeTxHash ? "Stake Now" : "Confirming…"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StakingModal;
