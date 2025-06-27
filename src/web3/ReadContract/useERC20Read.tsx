import { useMemo } from "react";
import { Address, formatUnits, parseUnits } from "viem";
import { useAccount, useChainId, useReadContract } from "wagmi";

import { ercConfig } from "../contract";

export interface ERC20ReadConfig {
  functionName:
    | "name"
    | "symbol"
    | "decimals"
    | "totalSupply"
    | "balanceOf"
    | "allowance";
  args?: readonly [Address] | readonly [Address, Address] | readonly [];
  address?: Address;
}

export interface ERC20TokenInfo {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: bigint;
  formattedTotalSupply: string;
}

export interface ERC20BalanceInfo {
  balance: bigint;
  formattedBalance: string;
  allowance: bigint;
  formattedAllowance: string;
}

export interface ERC20Error {
  message: string;
  code?: string;
  details?: unknown;
}

export const useERC20Read = (config: ERC20ReadConfig) => {
  const chainId = useChainId();
  const contractAddress = config.address || ercConfig(chainId).address;

  const { data, isLoading, error, refetch } = useReadContract({
    address: contractAddress,
    abi: ercConfig(chainId).abi,
    functionName: config.functionName,
    args: config.args,
  });

  const formattedError = useMemo(() => {
    if (!error) return null;

    return {
      message: error.message || "Failed to read ERC20 contract",
      code: error.name,
      details: error,
    } as ERC20Error;
  }, [error]);

  return { data, isLoading, error: formattedError, refetch };
};

// Hook for getting basic token information
export const useERC20TokenInfo = (tokenAddress?: Address) => {
  const chainId = useChainId();
  const contractAddress = tokenAddress || ercConfig(chainId).address;

  const {
    data: name,
    isLoading: nameLoading,
    error: nameError,
  } = useERC20Read({
    functionName: "name",
    address: contractAddress,
  });

  const {
    data: symbol,
    isLoading: symbolLoading,
    error: symbolError,
  } = useERC20Read({
    functionName: "symbol",
    address: contractAddress,
  });

  const {
    data: decimals,
    isLoading: decimalsLoading,
    error: decimalsError,
  } = useERC20Read({
    functionName: "decimals",
    address: contractAddress,
  });

  const {
    data: totalSupply,
    isLoading: totalSupplyLoading,
    error: totalSupplyError,
  } = useERC20Read({
    functionName: "totalSupply",
    address: contractAddress,
  });

  const tokenInfo = useMemo(() => {
    if (!name || !symbol || !decimals || !totalSupply) {
      return {
        name: "",
        symbol: "",
        decimals: 18,
        totalSupply: 0n,
        formattedTotalSupply: "0",
      };
    }

    return {
      name: name as string,
      symbol: symbol as string,
      decimals: decimals as number,
      totalSupply: totalSupply as bigint,
      formattedTotalSupply: formatUnits(
        totalSupply as bigint,
        decimals as number
      ),
    };
  }, [name, symbol, decimals, totalSupply]);

  const isLoading =
    nameLoading || symbolLoading || decimalsLoading || totalSupplyLoading;

  const error = useMemo(() => {
    if (nameError) return nameError;
    if (symbolError) return symbolError;
    if (decimalsError) return decimalsError;
    if (totalSupplyError) return totalSupplyError;
    return null;
  }, [nameError, symbolError, decimalsError, totalSupplyError]);

  return { tokenInfo, isLoading, error };
};

// Hook for getting user's balance and allowance
export const useERC20Balance = (
  tokenAddress?: Address,
  spenderAddress?: Address
) => {
  const { address: userAddress } = useAccount();
  const chainId = useChainId();
  const contractAddress = tokenAddress || ercConfig(chainId).address;
  const spender = spenderAddress || ercConfig(chainId).address;

  const {
    data: balance,
    isLoading: balanceLoading,
    error: balanceError,
  } = useERC20Read({
    functionName: "balanceOf",
    args: [userAddress as Address],
    address: contractAddress,
  });

  const {
    data: allowance,
    isLoading: allowanceLoading,
    error: allowanceError,
  } = useERC20Read({
    functionName: "allowance",
    args: [userAddress as Address, spender],
    address: contractAddress,
  });

  const { data: decimals, error: decimalsError } = useERC20Read({
    functionName: "decimals",
    address: contractAddress,
  });

  const balanceInfo = useMemo(() => {
    const decimalPlaces = (decimals as number) || 18;

    return {
      balance: (balance as bigint) || 0n,
      formattedBalance: balance
        ? formatUnits(balance as bigint, decimalPlaces)
        : "0",
      allowance: (allowance as bigint) || 0n,
      formattedAllowance: allowance
        ? formatUnits(allowance as bigint, decimalPlaces)
        : "0",
    };
  }, [balance, allowance, decimals]);

  const isLoading = balanceLoading || allowanceLoading;

  const error = useMemo(() => {
    if (balanceError) return balanceError;
    if (allowanceError) return allowanceError;
    if (decimalsError) return decimalsError;
    return null;
  }, [balanceError, allowanceError, decimalsError]);

  return { balanceInfo, isLoading, error };
};

// Hook for checking if user has sufficient balance
export const useERC20BalanceCheck = (
  tokenAddress?: Address,
  requiredAmount?: string | bigint
) => {
  const { balanceInfo, isLoading, error } = useERC20Balance(tokenAddress);

  const hasSufficientBalance = useMemo(() => {
    if (!requiredAmount || !balanceInfo.balance) return false;

    try {
      const required =
        typeof requiredAmount === "string"
          ? parseUnits(requiredAmount, 18)
          : requiredAmount;

      return balanceInfo.balance >= required;
    } catch (parseError) {
      console.error("Error parsing required amount:", parseError);
      return false;
    }
  }, [balanceInfo.balance, requiredAmount]);

  return { hasSufficientBalance, balanceInfo, isLoading, error };
};

// Hook for checking if user has sufficient allowance
export const useERC20AllowanceCheck = (
  tokenAddress?: Address,
  spenderAddress?: Address,
  requiredAmount?: string | bigint
) => {
  const { balanceInfo, isLoading, error } = useERC20Balance(
    tokenAddress,
    spenderAddress
  );

  const hasSufficientAllowance = useMemo(() => {
    if (!requiredAmount || !balanceInfo.allowance) return false;

    try {
      const required =
        typeof requiredAmount === "string"
          ? parseUnits(requiredAmount, 18)
          : requiredAmount;

      return balanceInfo.allowance >= required;
    } catch (parseError) {
      console.error("Error parsing required amount:", parseError);
      return false;
    }
  }, [balanceInfo.allowance, requiredAmount]);

  return { hasSufficientAllowance, balanceInfo, isLoading, error };
};

// Hook for comprehensive ERC20 data with error handling
export const useERC20Comprehensive = (
  tokenAddress?: Address,
  spenderAddress?: Address
) => {
  const {
    tokenInfo,
    isLoading: tokenLoading,
    error: tokenError,
  } = useERC20TokenInfo(tokenAddress);
  const {
    balanceInfo,
    isLoading: balanceLoading,
    error: balanceError,
  } = useERC20Balance(tokenAddress, spenderAddress);

  const isLoading = tokenLoading || balanceLoading;

  const error = useMemo(() => {
    if (tokenError) return tokenError;
    if (balanceError) return balanceError;
    return null;
  }, [tokenError, balanceError]);

  const data = useMemo(
    () => ({
      tokenInfo,
      balanceInfo,
    }),
    [tokenInfo, balanceInfo]
  );

  return { data, isLoading, error };
};

// Hook for validating ERC20 contract
export const useERC20Validation = (tokenAddress?: Address) => {
  const { tokenInfo, isLoading, error } = useERC20TokenInfo(tokenAddress);

  const isValidERC20 = useMemo(() => {
    if (isLoading || error) return false;
    return !!(tokenInfo.name && tokenInfo.symbol && tokenInfo.decimals >= 0);
  }, [tokenInfo, isLoading, error]);

  return { isValidERC20, tokenInfo, isLoading, error };
};
