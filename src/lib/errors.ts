// src/lib/errors.ts
import { BaseError, decodeErrorResult } from "viem";
import { STAKING_ABI } from "@/web3/abi/stakingAbi";

/* ------------------------------------------------------------------ */
/*                      Minimal ERC20 error ABI                        */
/* ------------------------------------------------------------------ */
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

/* ------------------------------------------------------------------ */
/*                               Types                                */
/* ------------------------------------------------------------------ */
export type TxOp = "stake" | "claim" | "unstake" | "claimReferral";

export type ErrorKind =
  | "user_rejected"
  | "wrong_network"
  | "insufficient_funds"
  | "insufficient_allowance"
  | "insufficient_balance"
  | "paused"
  | "not_allowed"
  | "not_claimable"
  | "contract_revert"
  | "tx_reverted"
  | "rate_limited"
  | "timeout"
  | "rpc_unreachable"
  | "offline"
  | "subgraph_error"
  | "unknown";

export type Severity = "info" | "warning" | "error";

export interface AppError {
  kind: ErrorKind;
  title: string;
  message: string;
  hint?: string;
  severity: Severity;
  code?: number | string;
  retryAfterMs?: number;
  op?: TxOp;
  cause?: unknown;
}

/* ------------------------------------------------------------------ */
/*                             Utilities                              */
/* ------------------------------------------------------------------ */
const isOffline = () =>
  typeof navigator !== "undefined" && navigator.onLine === false;

function getRetryAfterMs(err: any): number | undefined {
  try {
    const hdr = err?.response?.headers?.get?.("retry-after");
    if (!hdr) return;
    const v = Number(hdr);
    return Number.isFinite(v) ? v * 1000 : undefined;
  } catch { return; }
}

function includesAny(haystack: string, needles: string[]) {
  const l = haystack.toLowerCase();
  return needles.some((n) => l.includes(n.toLowerCase()));
}

/* ------------------------------------------------------------------ */
/*                 Decode known on-chain revert reasons                */
/* ------------------------------------------------------------------ */
function decodeRevertFriendly(e: BaseError): { name?: string; note?: string } {
  const walked = (e as any).walk?.() ?? e;
  const data: `0x${string}` | undefined =
    (walked as any)?.data ||
    (walked as any)?.cause?.data ||
    (walked as any)?.cause?.cause?.data;

  if (!data || data.length < 10) return {};

  // 1) Staking app errors
  try {
    const res = decodeErrorResult({ abi: STAKING_ABI as any, data });
    const name = (res as any)?.errorName as string | undefined;
    if (name) {
      const lower = name.toLowerCase();
      if (lower.includes("aprnotyetclaimable")) return { name, note: "Not yet claimable for the current interval." };
      if (lower.includes("apralreadyclaimed"))  return { name, note: "APR already fully claimed." };
      if (lower.includes("aprclaimnotallowed")) return { name, note: "Claim only allowed at package end." };
      if (lower.includes("aprzeroamount"))      return { name, note: "Computed reward is zero." };
      if (lower.includes("invalidstake"))       return { name, note: "Invalid stake index." };
      if (lower.includes("inactivepackage"))    return { name, note: "This package is not active." };
      if (lower.includes("referreralreadyset")) return { name, note: "Referral is already set for this wallet." };
      if (lower.includes("invalidreferrer"))    return { name, note: "Referrer must be whitelisted or have staked before." };
      if (lower.includes("paused"))             return { name, note: "Contract is paused." };
      return { name };
    }
  } catch {}

  // 2) ERC20 standard errors
  try {
    const res = decodeErrorResult({ abi: ERC20_ERROR_ABI as any, data });
    const name = (res as any)?.errorName as string | undefined;
    if (name === "ERC20InsufficientBalance") return { name, note: "Insufficient token balance." };
    if (name === "ERC20InsufficientAllowance") return { name, note: "Token allowance too low." };
    if (name) return { name };
  } catch {}

  return {};
}

/* ------------------------------------------------------------------ */
/*                        Classifier (main)                            */
/* ------------------------------------------------------------------ */
export function classifyError(e: unknown, op?: TxOp): AppError {
  // Network completely offline
  if (isOffline()) {
    return {
      kind: "offline",
      title: "You’re offline",
      message: "Check your connection and try again.",
      severity: "warning",
      op, cause: e,
    };
  }

  // GraphQL/subgraph errors (graphql-request)
  const status = (e as any)?.response?.status ?? (e as any)?.status;
  if (typeof status === "number") {
    if (status === 429) {
      return {
        kind: "rate_limited",
        title: "Too many requests",
        message: "You’re going a bit fast. Please wait a moment and retry.",
        retryAfterMs: getRetryAfterMs(e),
        severity: "warning",
        op, cause: e, code: status,
      };
    }
    if (status >= 500) {
      return {
        kind: "subgraph_error",
        title: "Service is busy",
        message: "Subgraph is temporarily unavailable. Please retry shortly.",
        severity: "warning",
        op, cause: e, code: status,
      };
    }
    if (status >= 400) {
      return {
        kind: "subgraph_error",
        title: "Data fetch error",
        message: "We couldn’t fetch the latest data. Please retry.",
        severity: "warning",
        op, cause: e, code: status,
      };
    }
  }

  // Viem / wallet / EIP-1193
  if (e instanceof BaseError) {
    const msg = (e as any).shortMessage || e.message || "";
    const lower = msg.toLowerCase();

    // User rejected (also cover 4001 code)
    const code = (e as any)?.code ?? (e as any)?.cause?.code;
    if (code === 4001 || includesAny(lower, ["user rejected", "user denied", "request rejected", "rejected the request"])) {
      return {
        kind: "user_rejected",
        title: "Transaction cancelled",
        message: "You dismissed the wallet prompt.",
        severity: "info",
        op, cause: e, code: 4001,
      };
    }

    // Wrong network / chain mismatch
    if (includesAny(lower, ["chain mismatch", "wrong network", "chain id", "switch the network"])) {
      return {
        kind: "wrong_network",
        title: "Wrong network",
        message: "Please switch your wallet to Base Sepolia.",
        severity: "warning",
        op, cause: e,
      };
    }

    // Insufficient funds for gas
    if (includesAny(lower, ["insufficient funds", "insufficient balance for transaction cost"])) {
      return {
        kind: "insufficient_funds",
        title: "Not enough ETH for gas",
        message: "Add a bit more ETH to cover network fees and try again.",
        severity: "warning",
        op, cause: e,
      };
    }

    // Try to decode a contract revert reason
    const decoded = decodeRevertFriendly(e);
    if (decoded.name) {
      const lname = decoded.name.toLowerCase();

      if (lname.includes("paused"))
        return { kind: "paused", title: "Paused", message: "Contract is currently paused.", severity: "warning", op, cause: e };

      if (lname.includes("notyetclaimable") || lname.includes("aprn"))
        return { kind: "not_claimable", title: "Not yet claimable", message: decoded.note || "Please try later.", severity: "info", op, cause: e };

      if (lname.includes("insufficientallowance"))
        return { kind: "insufficient_allowance", title: "Approval required", message: decoded.note || "Increase token allowance and retry.", severity: "warning", op, cause: e };

      if (lname.includes("insufficientbalance"))
        return { kind: "insufficient_balance", title: "Insufficient balance", message: decoded.note || "Top up the token balance and retry.", severity: "warning", op, cause: e };

      return {
        kind: "contract_revert",
        title: "Transaction reverted",
        message: decoded.note || decoded.name,
        severity: "error",
        op, cause: e,
      };
    }

    // Generic execution / timeout / transport
    if (includesAny(lower, ["timed out", "timeout"])) {
      return {
        kind: "timeout",
        title: "Taking longer than usual",
        message: "Network is slow. You can try again.",
        severity: "warning",
        op, cause: e,
      };
    }

    if (includesAny(lower, ["http request failed", "failed to fetch", "network changed"])) {
      return {
        kind: "rpc_unreachable",
        title: "Network error",
        message: "Couldn’t reach the blockchain node. Please retry.",
        severity: "warning",
        op, cause: e,
      };
    }

    // Fallback for BaseError
    return {
      kind: "unknown",
      title: "Something went wrong",
      message: (e as any).shortMessage || "Unexpected error. Please try again.",
      severity: "error",
      op, cause: e,
    };
  }

  // Non-viem generic fetch failures
  const msg = String((e as any)?.message || "");
  if (/failed to fetch|network changed|networkerror/i.test(msg)) {
    return {
      kind: "rpc_unreachable",
      title: "Network error",
      message: "Couldn’t reach the service. Please retry.",
      severity: "warning",
      op, cause: e,
    };
  }

  // Final fallback
  return {
    kind: "unknown",
    title: "Something went wrong",
    message: msg || "Unexpected error. Please try again.",
    severity: "error",
    op, cause: e,
  };
}

/* ------------------------------------------------------------------ */
/*                     Mobile-first user-facing copy                   */
/* ------------------------------------------------------------------ */
export function formatForUser(op: TxOp, err: AppError): { title: string; body: string } {
  const action = op === "stake" ? "Stake"
              : op === "claim" ? "Claim"
              : op === "unstake" ? "Unstake"
              : "Claim Reward";

  const titleBase =
    err.kind === "user_rejected" ? `${action} cancelled`
  : err.kind === "wrong_network" ? "Wrong network"
  : err.kind === "insufficient_funds" ? "Not enough ETH"
  : err.kind === "insufficient_allowance" ? "Approval required"
  : err.kind === "insufficient_balance" ? "Insufficient balance"
  : err.kind === "not_claimable" ? "Not ready yet"
  : err.kind === "paused" ? "Paused"
  : err.kind === "rate_limited" ? "Too many requests"
  : err.kind === "timeout" ? "Network is slow"
  : err.kind === "rpc_unreachable" ? "Network error"
  : err.kind === "offline" ? "You’re offline"
  : err.kind === "subgraph_error" ? "Data fetch error"
  : "Transaction failed";

  const body = err.message || "Please try again.";
  return { title: titleBase, body };
}

/* ------------------------------------------------------------------ */
/*                        Convenience for UI                          */
/* ------------------------------------------------------------------ */
export function explainTxError(op: TxOp, e: unknown): AppError {
  return classifyError(e, op);
}

export function showUserError(appErr: AppError) {
  const { title, body } = formatForUser(appErr.op || "stake", appErr);
  try {
    window.dispatchEvent(new CustomEvent("toast:error", {
      detail: {
        title,
        description: appErr.hint ? `${body}\n${appErr.hint}` : body,
        severity: appErr.severity,
      }
    }));
  } catch {}
}

export function showUserSuccess(title: string, description?: string) {
  try {
    window.dispatchEvent(new CustomEvent("toast:success", {
      detail: { title, description }
    }));
  } catch {}
}

export function isRetryable(err: AppError): boolean {
  return ["rate_limited", "timeout", "rpc_unreachable", "offline", "subgraph_error"].includes(err.kind);
}

/* ================================================================== */
/*                     Compatibility shim (optional)                  */
/*      Enables use of normalizeEvmError / showEvmError if desired    */
/* ================================================================== */
export type EvmErrorKind =
  | "user_rejected"
  | "reverted"
  | "insufficient_funds"
  | "insufficient_allowance"
  | "insufficient_balance"
  | "gas_too_low"
  | "nonce_too_low"
  | "underpriced"
  | "busy"
  | "timeout"
  | "chain_mismatch"
  | "network"
  | "server"
  | "unknown";

export type NormalizedEvmError = {
  kind: EvmErrorKind;
  code?: number | string;
  message: string;
  details?: string;
};

function mapKind(k: ErrorKind): EvmErrorKind {
  switch (k) {
    case "user_rejected": return "user_rejected";
    case "wrong_network": return "chain_mismatch";
    case "insufficient_funds": return "insufficient_funds";
    case "insufficient_allowance": return "insufficient_allowance";
    case "insufficient_balance": return "insufficient_balance";
    case "rate_limited": return "busy";
    case "timeout": return "timeout";
    case "rpc_unreachable":
    case "offline": return "network";
    case "subgraph_error": return "server";
    case "contract_revert":
    case "tx_reverted":
    case "paused":
    case "not_allowed":
    case "not_claimable": return "reverted";
    default: return "unknown";
  }
}

export function normalizeEvmError(e: unknown, _opts?: { networkName?: string }): NormalizedEvmError {
  const appErr = classifyError(e);
  return {
    kind: mapKind(appErr.kind),
    code: appErr.code,
    message: appErr.message,
    details: appErr.hint,
  };
}

export function showEvmError(
  e: unknown,
  opts?: { context?: "Stake" | "Claim" | "Unstake" | "Referral"; networkName?: string }
) {
  const op: TxOp | undefined =
    opts?.context === "Stake" ? "stake" :
    opts?.context === "Claim" ? "claim" :
    opts?.context === "Unstake" ? "unstake" :
    opts?.context === "Referral" ? "claimReferral" :
    undefined;

  const appErr = classifyError(e, op);
  const { title, body } = formatForUser(appErr.op ?? "stake", appErr);

  // Fire your existing event
  try {
    window.dispatchEvent(new CustomEvent("toast:error", {
      detail: { title, description: appErr.hint ? `${body}\n${appErr.hint}` : body, severity: appErr.severity }
    }));
  } catch {}

  // Fire a generic event too (some newer code may listen to this)
  try {
    window.dispatchEvent(new CustomEvent("app:toast", {
      detail: { variant: "error", title, message: body }
    }));
  } catch {}

  return {
    kind: mapKind(appErr.kind),
    code: appErr.code,
    message: appErr.message,
    details: appErr.hint,
  } as NormalizedEvmError;
}
