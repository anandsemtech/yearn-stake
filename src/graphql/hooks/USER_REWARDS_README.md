# User All Rewards Query & Hook

This document describes the comprehensive user rewards query and reusable hook that fetches all reward-related events for a user.

## Query: `GET_USER_ALL_REWARDS`

The query fetches all reward-related events for a specific user address:

- **Golden Star Rewards Claimed**: Rewards claimed by the user from golden star activations
- **Golden Star Rewards Distributed**: Rewards distributed to the user from golden star system
- **Referral Rewards Distributed**: Rewards distributed to the user as a referrer
- **Referral Rewards Claimed**: Rewards claimed by the user from referral system (Y/S/P tokens)
- **Star Rewards Claimed**: Rewards claimed by the user from star level system

### GraphQL Query Structure

```graphql
query GetUserAllRewards($user: Bytes!, $first: Int = 100, $skip: Int = 0) {
  goldenStarRewardClaimeds(where: { user: $user }) { ... }
  goldenStarRewardDistributeds(where: { user: $user }) { ... }
  referralRewardDistributeds(where: { referrer: $user }) { ... }
  referralRewardsClaimeds(where: { user: $user }) { ... }
  starRewardClaimeds(where: { user: $user }) { ... }
}
```

## Hook: `useUserAllRewards`

### Basic Usage

```typescript
import { useUserAllRewards } from "../graphql";

const MyComponent = () => {
  const {
    data,
    loading,
    error,
    totalGoldenStarRewardsClaimed,
    totalReferralRewardsDistributed,
    // ... other properties
  } = useUserAllRewards();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      <p>Total Golden Star Rewards: {totalGoldenStarRewardsClaimed}</p>
      <p>Total Referral Rewards: {totalReferralRewardsDistributed}</p>
    </div>
  );
};
```

### Advanced Usage with Options

```typescript
const {
  data,
  loading,
  error,
  refetch,
  totalGoldenStarRewardsClaimed,
  totalGoldenStarRewardsDistributed,
  totalReferralRewardsDistributed,
  totalReferralRewardsClaimed,
  totalStarRewardsClaimed,
  getGoldenStarRewardsByDate,
  getReferralRewardsByDate,
  getStarRewardsByDate,
} = useUserAllRewards({
  first: 50, // Limit to 50 records per type
  skip: 0, // Skip 0 records
  skipQuery: false, // Don't skip the query
});
```

### Hook Return Properties

#### Data Properties

- `data`: Raw GraphQL response data
- `loading`: Boolean indicating if the query is loading
- `error`: Error object if the query failed
- `refetch`: Function to refetch the data

#### Computed Totals

- `totalGoldenStarRewardsClaimed`: Sum of all golden star rewards claimed
- `totalGoldenStarRewardsDistributed`: Sum of all golden star rewards distributed
- `totalReferralRewardsDistributed`: Sum of all referral rewards distributed
- `totalReferralRewardsClaimed`: Object with Y/S/P token amounts
- `totalStarRewardsClaimed`: Sum of all star rewards claimed

#### Helper Functions

- `getGoldenStarRewardsByDate(startDate, endDate)`: Filter golden star rewards by date range
- `getReferralRewardsByDate(startDate, endDate)`: Filter referral rewards by date range
- `getStarRewardsByDate(startDate, endDate)`: Filter star rewards by date range

### TypeScript Interfaces

```typescript
interface UserAllRewardsData {
  goldenStarRewardClaimeds: Array<{
    id: string;
    user: string;
    amount: string;
    blockNumber: string;
    blockTimestamp: string;
    transactionHash: string;
  }>;
  goldenStarRewardDistributeds: Array<{
    id: string;
    user: string;
    amount: string;
    cumulative: string;
    cap: string;
    blockNumber: string;
    blockTimestamp: string;
    transactionHash: string;
  }>;
  referralRewardDistributeds: Array<{
    id: string;
    referrer: string;
    level: number;
    amount: string;
    rewardToken: string;
    blockNumber: string;
    blockTimestamp: string;
    transactionHash: string;
  }>;
  referralRewardsClaimeds: Array<{
    id: string;
    user: string;
    yAmount: string;
    sAmount: string;
    pAmount: string;
    blockNumber: string;
    blockTimestamp: string;
    transactionHash: string;
  }>;
  starRewardClaimeds: Array<{
    id: string;
    user: string;
    level: number;
    amount: string;
    blockNumber: string;
    blockTimestamp: string;
    transactionHash: string;
  }>;
}
```

## Example Usage Scenarios

### 1. Dashboard Overview

```typescript
const Dashboard = () => {
  const { totalGoldenStarRewardsClaimed, totalReferralRewardsDistributed } =
    useUserAllRewards();

  return (
    <div className="grid grid-cols-3 gap-4">
      <StatCard title="Golden Star" value={totalGoldenStarRewardsClaimed} />
      <StatCard title="Referral" value={totalReferralRewardsDistributed} />
    </div>
  );
};
```

### 2. Recent Activity

```typescript
const RecentActivity = () => {
  const { getGoldenStarRewardsByDate } = useUserAllRewards();

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentRewards = getGoldenStarRewardsByDate(thirtyDaysAgo, new Date());

  return (
    <div>
      {recentRewards.map((reward) => (
        <div key={reward.id}>
          {new Date(
            parseInt(reward.blockTimestamp) * 1000
          ).toLocaleDateString()}
          {formatEther(BigInt(reward.amount))} ETH
        </div>
      ))}
    </div>
  );
};
```

### 3. Analytics with Date Filtering

```typescript
const Analytics = () => {
  const { getReferralRewardsByDate, getStarRewardsByDate } =
    useUserAllRewards();

  const thisMonth = new Date();
  thisMonth.setDate(1); // First day of current month

  const monthlyReferralRewards = getReferralRewardsByDate(
    thisMonth,
    new Date()
  );
  const monthlyStarRewards = getStarRewardsByDate(thisMonth, new Date());

  const totalMonthlyRewards = monthlyReferralRewards.reduce(
    (sum, reward) => sum + BigInt(reward.amount),
    BigInt(0)
  );

  return <div>Monthly Rewards: {formatEther(totalMonthlyRewards)} ETH</div>;
};
```

## Error Handling

The hook includes comprehensive error handling:

```typescript
const { data, loading, error } = useUserAllRewards();

if (loading) return <LoadingSpinner />;
if (error) return <ErrorMessage error={error} />;
if (!data) return <NoDataMessage />;
```

## Performance Considerations

- The hook automatically skips the query if no user address is available
- Use the `first` parameter to limit the number of records fetched
- Use the `skipQuery` parameter to conditionally disable the query
- The computed totals are memoized and only recalculated when data changes

## Dependencies

- `@apollo/client`: For GraphQL queries
- `wagmi`: For wallet connection
- `viem`: For address types and formatting
