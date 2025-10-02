import { Address, erc20Abi, formatUnits } from 'viem';
import { useAccount, useReadContracts } from 'wagmi';
import { getTokensFromEnv, TokenMeta } from '@/constants/tokens';

export type TokenBalance = TokenMeta & {
  raw?: bigint;
  formatted?: string;
  isLoading: boolean;
  isError: boolean;
};

export function useTokenBalances() {
  const { address, isConnected } = useAccount();
  const online = typeof navigator !== 'undefined' ? navigator.onLine : true;

  const tokens = getTokensFromEnv();
  const contracts =
    address && tokens.length
      ? tokens.map((t) => ({
          abi: erc20Abi,
          address: t.address as Address,
          functionName: 'balanceOf' as const,
          args: [address as Address],
        }))
      : [];

  const { data, isFetching, isError } = useReadContracts({
    allowFailure: true,
    contracts,
    query: {
      enabled: online && isConnected && contracts.length > 0,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  });

  const balances: TokenBalance[] = tokens.map((t, i) => {
    const r = data?.[i];
    const ok = r && r.status === 'success' && typeof r.result === 'bigint';
    const raw = ok ? (r!.result as bigint) : undefined;
    const formatted = raw !== undefined ? formatUnits(raw, t.decimals) : undefined;
    return {
      ...t,
      raw,
      formatted,
      isLoading: isFetching && raw === undefined,
      isError: Boolean(isError || (r && r.status === 'failure')),
    };
  });

  return { balances, isFetching, isError, online, isConnected };
}
