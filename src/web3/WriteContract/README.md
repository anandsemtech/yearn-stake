# YearnTogether Wagmi Write Contract Hooks

Comprehensive wagmi write contract hooks for the YearnTogether smart contract, including ERC20 allowance and approve functionality with automatic token address fallback.

## Quick Start

```tsx
import {
  useStake,
  useERC20Approve,
  useCheckApprovalNeeded,
} from "./useYearnTogetherWrite";

function MyComponent() {
  const { approve, isPending: isApprovePending } = useERC20Approve();
  const { stake, isPending: isStakePending } = useStake();

  const { needsApproval } = useCheckApprovalNeeded(
    BigInt("1000000000000000000"), // amount
    undefined, // tokenAddress (uses ASSET_ADDRESS fallback)
    userAddress,
    undefined // spenderAddress (uses contract address fallback)
  );

  const handleStake = async () => {
    if (needsApproval) {
      await approve(BigInt("1000000000000000000")); // Uses fallback addresses
    }
    await stake(1); // Uses fallback token address
  };

  return (
    <button onClick={handleStake} disabled={isStakePending}>
      {isStakePending ? "Staking..." : "Stake"}
    </button>
  );
}
```

## Automatic Address Fallback

The hooks automatically use addresses from your configuration when not provided:

- **Token Address**: Falls back to `ASSET_ADDRESS` from `contract.ts`
- **Contract Address**: Falls back to contract address from `BASE_CONTRACT`
- **Spender Address**: Falls back to contract address for approvals

## Available Hooks

### ERC20 Operations

- `useERC20Allowance()` - Check token allowance (optional addresses)
- `useERC20Approve()` - Approve tokens for spending (optional addresses)
- `useCheckApprovalNeeded()` - Check if approval is needed (optional addresses)

### User Operations

- `useStake()` - Stake tokens in a package (optional token addresses)
- `useUnstake()` - Unstake tokens
- `useClaimAPR()` - Claim APR rewards
- `useClaimStarReward()` - Claim star level rewards
- `useClaimAllStarRewards()` - Claim all star rewards
- `useClaimReferralRewards()` - Claim referral rewards
- `useActivateGoldenStar()` - Activate golden star
- `useDowngradeGoldenStar()` - Downgrade golden star
- `useEmergencyWithdraw()` - Emergency withdraw

### Admin Functions (Owner Only)

- `useCreatePackage()` - Create new package
- `useUpdatePackage()` - Update package
- `useSetStarLevelTiers()` - Set star level tiers
- `useSetReferralRewardTiers()` - Set referral tiers
- `useSetGoldenStarConfig()` - Set golden star config
- `useSetUserStarLevel()` - Set user star level
- `useSetStarTierExecutor()` - Set star tier executor
- `useSetClaimableInterval()` - Set claimable interval
- `usePause()` / `useUnpause()` - Pause/unpause contract
- `useTransferOwnership()` / `useRenounceOwnership()` - Ownership management
- `useUpgradeToAndCall()` - Upgrade contract

### Combined Operations

- `useStakeWithApproval()` - Stake with automatic approval

### Transaction Management

- `useTransactionReceipt()` - Track transaction confirmation

### Utility Hooks

- `useTokenAddress()` - Get token address with fallback
- `useContractAddress()` - Get contract address

## Example Usage

See `useYearnTogetherWriteExample.tsx` for a comprehensive example.

## Features

- Full TypeScript support
- Automatic chain ID detection
- Error handling and loading states
- Transaction receipt tracking
- Combined operations for complex workflows
- ERC20 allowance management
- **Automatic address fallback** from configuration
- **Optional parameters** for easier usage
