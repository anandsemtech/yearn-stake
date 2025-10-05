// src/hooks/sg/referralAvailable.ts
import { GraphQLClient, gql } from "graphql-request";

const Q_LAST = gql`
  query LastReferralClaim($userBytes: Bytes!) {
    last: referralRewardsClaims(
      where: { user: $userBytes }
      first: 1
      orderBy: timestamp
      orderDirection: desc
    ) {
      timestamp
    }
  }
`;

const Q_EARNINGS_SINCE = gql`
  query EarningsSinceLast($user: String!, $since: BigInt!) {
    earningsSince: referralEarnings(
      where: { user: $user, timestamp_gt: $since }
      first: 1000
      orderBy: timestamp
      orderDirection: asc
    ) {
      token
      amount
      timestamp
      blockNumber
    }
  }
`;

export type ReferralAvailable = {
  yyWei: bigint;
  syWei: bigint;
  pyWei: bigint;
  totalWei: bigint;
  yy: number;
  sy: number;
  py: number;
  total: number;
  sinceTs: string;
};

export async function fetchReferralAvailableOnly(params: {
  client: GraphQLClient;
  user: `0x${string}`;
  userBytes: `0x${string}`;
  tokens: { yy: `0x${string}`; sy: `0x${string}`; py: `0x${string}` };
  decimals?: number; // default 18
  logTag?: string;
}): Promise<ReferralAvailable> {
  const { client, user, userBytes, tokens, decimals = 18, logTag = "refAvail" } = params;

  const last = await client.request<{ last: Array<{ timestamp: string }> }>(Q_LAST, { userBytes });
  const since = last.last?.[0]?.timestamp ?? "0";

  const earn = await client.request<{ earningsSince: Array<{ token: string; amount: string }> }>(
    Q_EARNINGS_SINCE,
    { user: user.toLowerCase(), since }
  );

  let yyWei = 0n,
    syWei = 0n,
    pyWei = 0n;
  for (const e of earn.earningsSince) {
    const amt = BigInt(e.amount || "0");
    const tok = e.token.toLowerCase();
    if (tok === tokens.yy.toLowerCase()) yyWei += amt;
    else if (tok === tokens.sy.toLowerCase()) syWei += amt;
    else if (tok === tokens.py.toLowerCase()) pyWei += amt;
  }

  const totalWei = yyWei + syWei + pyWei;
  const D = BigInt(10) ** BigInt(decimals);
  const toNum = (w: bigint) => Number(w) / Number(D);

  // Debug
  console.log(`[${logTag}] last ts`, since);
  console.log(`[${logTag}] avail(wei)`, { yyWei: yyWei.toString(), syWei: syWei.toString(), pyWei: pyWei.toString(), totalWei: totalWei.toString() });

  return {
    yyWei,
    syWei,
    pyWei,
    totalWei,
    yy: toNum(yyWei),
    sy: toNum(syWei),
    py: toNum(pyWei),
    total: toNum(totalWei),
    sinceTs: since,
  };
}
