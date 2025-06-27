# YearnTogether Wagmi Read Contract Hooks

This directory contains comprehensive wagmi read contract hooks for the YearnTogether smart contract. These hooks provide easy access to all read functions from the contract ABI.

## Overview

The hooks are organized into several categories:

- **Basic Contract Info**: Contract constants and basic information
- **Token Addresses**: Y, S, and P Yearn token addresses
- **Package Management**: Staking package information
- **User Data**: User-specific information like stakes, star levels, etc.
- **Star Level System**: Star level tiers and user star level data
- **Golden Star System**: Golden star configuration and user status
- **Referral System**: Referral data and rewards
- **Utility Functions**: Helper functions for claim times, etc.

## Quick Start

```tsx
import { useAccount } from "wagmi";
import {
  useUserBasicInfo,
  usePackage,
  useGoldenStarConfig,
} from "./useYearnTogetherHooks";

function MyComponent() {
  const { address } = useAccount();

  // Get user basic information
  const { data: userInfo, isLoading } = useUserBasicInfo(address!);

  // Get package information
  const { data: package1 } = usePackage(1);

  // Get golden star configuration
  const { data: goldenStarConfig } = useGoldenStarConfig();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <p>Star Level: {userInfo?.starLevel}</p>
      <p>Total Staked: {userInfo?.totalStaked?.toString()}</p>
      <p>Package APR: {package1?.apr}%</p>
    </div>
  );
}
```

## Available Hooks

### Basic Contract Info

- `useMaxReferralLevel()` - Get maximum referral level
- `useUpgradeInterfaceVersion()` - Get upgrade interface version
- `useClaimableInterval()` - Get claimable interval
- `useNextPackageId()` - Get next package ID
- `useContractOwner()` - Get contract owner
- `useContractPaused()` - Check if contract is paused
- `useProxiableUUID()` - Get proxiable UUID
- `useStarTierExecutor()` - Get star tier executor

### Token Addresses

- `useYYearnAddress()` - Get Y Yearn token address
- `useSYearnAddress()` - Get S Yearn token address
- `usePYearnAddress()` - Get P Yearn token address

### Package Management

- `usePackage(packageId: number)` - Get package information by ID

### User Data

- `useUserStarLevel(userAddress: Address)` - Get user's star level
- `useUserTotalStaked(userAddress: Address)` - Get user's total staked amount
- `useUserStakeCounts(userAddress: Address)` - Get user's stake count
- `useIsGoldenStar(userAddress: Address)` - Check if user is golden star
- `useGoldenStarActivation(userAddress: Address)` - Get golden star activation time
- `useGoldenStarCap(userAddress: Address)` - Get user's golden star cap

### User Stakes

- `useUserStake(userAddress: Address, stakeIndex: number)` - Get specific user stake
- `useUserStakeTokenAmounts(userAddress: Address, stakeIndex: number, tokenIndex: number)` - Get token amounts for a stake
- `useWithdrawnPerStake(userAddress: Address, stakeIndex: number)` - Get withdrawn amount per stake
- `useLastUnstakedAt(userAddress: Address, stakeIndex: number)` - Get last unstake time

### Star Level System

- `useStarLevelTier(tierIndex: number)` - Get star level tier information
- `useStarLevelActivation(userAddress: Address, level: number)` - Get star level activation time
- `useStarLevelClaimed(userAddress: Address, level: number)` - Get claimed amount for star level
- `useStarLevelEarnings(userAddress: Address, level: number)` - Get earnings for star level
- `useStarLevelPercent(userAddress: Address, level: number)` - Get star level percentage
- `useClaimableStarLevelRewards(userAddress: Address)` - Get claimable star level rewards

### Golden Star System

- `useGoldenStarConfig()` - Get golden star configuration

### Referral System

- `useReferrerOf(userAddress: Address)` - Get user's referrer
- `useReferralEarnings(userAddress: Address, referrerAddress: Address)` - Get referral earnings
- `useReferrals(userAddress: Address, index: number)` - Get user's referrals
- `useReferralHistory(userAddress: Address, index: number)` - Get referral history
- `useReferralRewardTier(tierIndex: number)` - Get referral reward tier
- `useUserRewardTiers(userAddress: Address, tierIndex: number)` - Get user reward tiers

### Utility Functions

- `useNextClaimTime(userAddress: Address, stakeIndex: number)` - Get next claim time

### Combined Hooks

- `useUserBasicInfo(userAddress: Address)` - Get combined user basic information
- `useUserStarLevelInfo(userAddress: Address, level: number)` - Get combined star level information

## Types

The following TypeScript interfaces are exported:

```tsx
interface Package {
  id: number;
  durationYears: number;
  apr: number;
  monthlyPrincipalReturnPercent: number;
  monthlyUnstake: boolean;
  isActive: boolean;
  monthlyAPRClaimable: boolean;
  minStakeAmount: bigint;
  compositions: number[][];
}

interface UserStake {
  totalStaked: bigint;
  claimedAPR: bigint;
  withdrawnPrincipal: bigint;
  startTime: number;
  lastClaimedAt: number;
  packageId: number;
}

interface StarLevelTier {
  level: number;
  rewardPercent: number;
}

interface ReferralRewardTier {
  startLevel: number;
  endLevel: number;
  rewardPercent: number;
  rewardToken: Address;
}

interface GoldenStarConfig {
  minReferrals: number;
  timeWindow: number;
  rewardPercent: number;
  rewardDuration: number;
  rewardCapMultiplier: number;
}

interface ReferralHistory {
  referee: Address;
  timestamp: bigint;
}

interface UserStakeTokenAmount {
  token: Address;
  amount: bigint;
}
```

## Error Handling

All hooks return standard wagmi hook results with:

- `data`: The contract data (typed appropriately)
- `isLoading`: Loading state
- `error`: Error state
- `refetch`: Function to refetch data

## Example Usage

See `useYearnTogetherExample.tsx` for a comprehensive example of how to use these hooks in a React component.

## Configuration

Make sure your contract configuration in `contract.ts` includes the correct ABI and contract address for your target network.

## Dependencies

- wagmi
- viem
- React

## Notes

- All hooks automatically handle chain ID detection
- BigInt values are returned for amounts to handle large numbers
- Address types are properly typed for better TypeScript support
- Combined hooks reduce the number of contract calls for better performance
