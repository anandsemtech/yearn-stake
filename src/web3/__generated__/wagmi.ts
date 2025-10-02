import {
  createUseReadContract,
  createUseWriteContract,
  createUseSimulateContract,
  createUseWatchContractEvent,
} from 'wagmi/codegen'

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ERC20
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const erc20Abi = [
  {
    type: 'event',
    inputs: [
      { name: 'owner', type: 'address', indexed: true },
      { name: 'spender', type: 'address', indexed: true },
      { name: 'value', type: 'uint256', indexed: false },
    ],
    name: 'Approval',
  },
  {
    type: 'event',
    inputs: [
      { name: 'from', type: 'address', indexed: true },
      { name: 'to', type: 'address', indexed: true },
      { name: 'value', type: 'uint256', indexed: false },
    ],
    name: 'Transfer',
  },
  {
    type: 'function',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'decimals',
    outputs: [{ type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'name',
    outputs: [{ type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'symbol',
    outputs: [{ type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalSupply',
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'recipient', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'sender', type: 'address' },
      { name: 'recipient', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [{ type: 'bool' }],
    stateMutability: 'nonpayable',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// YearnTogether
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const yearnTogetherAbi = [
  { type: 'error', inputs: [], name: 'APRAlreadyClaimed' },
  { type: 'error', inputs: [], name: 'APRClaimNotAllowed' },
  { type: 'error', inputs: [], name: 'APRNotYetClaimable' },
  { type: 'error', inputs: [], name: 'APRZeroAmount' },
  {
    type: 'error',
    inputs: [{ name: 'target', internalType: 'address', type: 'address' }],
    name: 'AddressEmptyCode',
  },
  { type: 'error', inputs: [], name: 'BelowMinimumStakeAmount' },
  { type: 'error', inputs: [], name: 'DuplicateComposition' },
  {
    type: 'error',
    inputs: [
      { name: 'implementation', internalType: 'address', type: 'address' },
    ],
    name: 'ERC1967InvalidImplementation',
  },
  { type: 'error', inputs: [], name: 'ERC1967NonPayable' },
  { type: 'error', inputs: [], name: 'EnforcedPause' },
  { type: 'error', inputs: [], name: 'ExpectedPause' },
  { type: 'error', inputs: [], name: 'FailedCall' },
  { type: 'error', inputs: [], name: 'InactivePackage' },
  {
    type: 'error',
    inputs: [
      { name: 'context', internalType: 'enum TransferContext', type: 'uint8' },
      { name: 'required', internalType: 'uint256', type: 'uint256' },
      { name: 'available', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'InsufficientYYearn',
  },
  { type: 'error', inputs: [], name: 'InvalidClaimableInterval' },
  { type: 'error', inputs: [], name: 'InvalidCompositionSum' },
  { type: 'error', inputs: [], name: 'InvalidDuration' },
  { type: 'error', inputs: [], name: 'InvalidGoldenStarCapMultiplier' },
  { type: 'error', inputs: [], name: 'InvalidGoldenStarMinReferrals' },
  { type: 'error', inputs: [], name: 'InvalidGoldenStarRewardDuration' },
  { type: 'error', inputs: [], name: 'InvalidGoldenStarRewardPercent' },
  { type: 'error', inputs: [], name: 'InvalidGoldenStarTimeWindow' },
  { type: 'error', inputs: [], name: 'InvalidInitialization' },
  { type: 'error', inputs: [], name: 'InvalidMaxReferralLevel' },
  { type: 'error', inputs: [], name: 'InvalidMaxStarLevel' },
  { type: 'error', inputs: [], name: 'InvalidMinStakeAmount' },
  { type: 'error', inputs: [], name: 'InvalidPackage' },
  { type: 'error', inputs: [], name: 'InvalidPackageId' },
  { type: 'error', inputs: [], name: 'InvalidPrincipalLockForUnstake' },
  { type: 'error', inputs: [], name: 'InvalidReferralEndLevel' },
  { type: 'error', inputs: [], name: 'InvalidReferralRewardPercent' },
  { type: 'error', inputs: [], name: 'InvalidReferralRewardToken' },
  { type: 'error', inputs: [], name: 'InvalidReferralStartLevel' },
  { type: 'error', inputs: [], name: 'InvalidReferrer' },
  { type: 'error', inputs: [], name: 'InvalidStake' },
  { type: 'error', inputs: [], name: 'InvalidStakeMultiple' },
  { type: 'error', inputs: [], name: 'InvalidStarLevelCount' },
  { type: 'error', inputs: [], name: 'InvalidStarRewardPercent' },
  { type: 'error', inputs: [], name: 'InvalidTokenComposition' },
  { type: 'error', inputs: [], name: 'InvalidUnstakeComputation' },
  { type: 'error', inputs: [], name: 'MismatchedStakeInputs' },
  { type: 'error', inputs: [], name: 'MonthlyUnstakePercentMissing' },
  { type: 'error', inputs: [], name: 'NetRewardZero' },
  { type: 'error', inputs: [], name: 'NoGoldenStarRewardsToClaim' },
  { type: 'error', inputs: [], name: 'NoReferralRewardsToClaim' },
  { type: 'error', inputs: [], name: 'NoReferrerFound' },
  { type: 'error', inputs: [], name: 'NoStarLevelRewardsToClaim' },
  { type: 'error', inputs: [], name: 'NonSequentialStarLevels' },
  { type: 'error', inputs: [], name: 'NotGoldenStar' },
  { type: 'error', inputs: [], name: 'NotInitializing' },
  { type: 'error', inputs: [], name: 'NothingToUnstake' },
  {
    type: 'error',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'OwnableInvalidOwner',
  },
  {
    type: 'error',
    inputs: [{ name: 'account', internalType: 'address', type: 'address' }],
    name: 'OwnableUnauthorizedAccount',
  },
  { type: 'error', inputs: [], name: 'ReentrancyGuardReentrantCall' },
  { type: 'error', inputs: [], name: 'ReferrerAlreadySet' },
  {
    type: 'error',
    inputs: [{ name: 'token', internalType: 'address', type: 'address' }],
    name: 'SafeERC20FailedOperation',
  },
  { type: 'error', inputs: [], name: 'UUPSUnauthorizedCallContext' },
  {
    type: 'error',
    inputs: [{ name: 'slot', internalType: 'bytes32', type: 'bytes32' }],
    name: 'UUPSUnsupportedProxiableUUID',
  },
  { type: 'error', inputs: [], name: 'UnstakeNotAllowedYet' },
  {
    type: 'error',
    inputs: [{ name: 'token', internalType: 'address', type: 'address' }],
    name: 'UnsupportedToken',
  },
  { type: 'error', inputs: [], name: 'ZeroRewardAmount' },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'user', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'stakeIndex',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'packageId',
        internalType: 'uint16',
        type: 'uint16',
        indexed: false,
      },
      {
        name: 'baseAPR',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'netReward',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'APRClaimed',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'user', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'stakeIndex',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'reward',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Claimed',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'user', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'GoldenRewardDistributed',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'user', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'activatedAt',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'GoldenStarActivated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'minReferrals',
        internalType: 'uint16',
        type: 'uint16',
        indexed: false,
      },
      {
        name: 'timeWindow',
        internalType: 'uint32',
        type: 'uint32',
        indexed: false,
      },
      {
        name: 'rewardPercent',
        internalType: 'uint16',
        type: 'uint16',
        indexed: false,
      },
      {
        name: 'rewardDuration',
        internalType: 'uint32',
        type: 'uint32',
        indexed: false,
      },
      {
        name: 'rewardCapMultiplier',
        internalType: 'uint8',
        type: 'uint8',
        indexed: false,
      },
    ],
    name: 'GoldenStarConfigUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'user', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'GoldenStarRewardClaimed',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'user', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'cumulative',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      { name: 'cap', internalType: 'uint256', type: 'uint256', indexed: false },
    ],
    name: 'GoldenStarRewardDistributed',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'version',
        internalType: 'uint64',
        type: 'uint64',
        indexed: false,
      },
    ],
    name: 'Initialized',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'maxStarLevel',
        internalType: 'uint8',
        type: 'uint8',
        indexed: false,
      },
    ],
    name: 'MaxStarLevelUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OwnershipTransferred',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'id', internalType: 'uint256', type: 'uint256', indexed: true },
      {
        name: 'durationInDays',
        internalType: 'uint16',
        type: 'uint16',
        indexed: false,
      },
      { name: 'apr', internalType: 'uint16', type: 'uint16', indexed: false },
      {
        name: 'monthlyUnstake',
        internalType: 'bool',
        type: 'bool',
        indexed: false,
      },
      { name: 'isActive', internalType: 'bool', type: 'bool', indexed: false },
      {
        name: 'minStakeAmount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'monthlyPrincipalReturnPercent',
        internalType: 'uint16',
        type: 'uint16',
        indexed: false,
      },
      {
        name: 'monthlyAPRClaimable',
        internalType: 'bool',
        type: 'bool',
        indexed: false,
      },
      {
        name: 'claimableInterval',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'stakeMultiple',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'principalLocked',
        internalType: 'bool',
        type: 'bool',
        indexed: false,
      },
    ],
    name: 'PackageCreated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'packageId',
        internalType: 'uint16',
        type: 'uint16',
        indexed: true,
      },
      { name: 'isActive', internalType: 'bool', type: 'bool', indexed: false },
    ],
    name: 'PackageStatusUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'Paused',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'user', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'referrer',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'ReferralAssigned',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'referrer',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      { name: 'level', internalType: 'uint8', type: 'uint8', indexed: false },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'rewardToken',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'ReferralRewardDistributed',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'startLevel',
        internalType: 'uint8',
        type: 'uint8',
        indexed: false,
      },
      {
        name: 'endLevel',
        internalType: 'uint8',
        type: 'uint8',
        indexed: false,
      },
      {
        name: 'rewardPercent',
        internalType: 'uint16',
        type: 'uint16',
        indexed: false,
      },
      {
        name: 'rewardToken',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'ReferralRewardTiersUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'user', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'yAmount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'sAmount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'pAmount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'ReferralRewardsClaimed',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'user', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'packageId',
        internalType: 'uint16',
        type: 'uint16',
        indexed: false,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'stakeIndex',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Staked',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'levelOneRequirement',
        internalType: 'uint8',
        type: 'uint8',
        indexed: false,
      },
      {
        name: 'subLevelRequirement',
        internalType: 'uint8',
        type: 'uint8',
        indexed: false,
      },
    ],
    name: 'StarLevelRequirementsUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'newMaxStarLevel',
        internalType: 'uint8',
        type: 'uint8',
        indexed: false,
      },
    ],
    name: 'StarLevelTiersUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'user', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'newLevel',
        internalType: 'uint8',
        type: 'uint8',
        indexed: false,
      },
    ],
    name: 'StarLevelUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'user', internalType: 'address', type: 'address', indexed: true },
      { name: 'level', internalType: 'uint8', type: 'uint8', indexed: false },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'StarRewardClaimed',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'user', internalType: 'address', type: 'address', indexed: true },
      { name: 'level', internalType: 'uint8', type: 'uint8', indexed: false },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'StarRewardDistributed',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'newExecutor',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'StarTierExecutorUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'Unpaused',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'user', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'stakeIndex',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Unstaked',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'implementation',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'Upgraded',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'id', internalType: 'uint256', type: 'uint256', indexed: true },
      {
        name: 'composition',
        internalType: 'uint8[]',
        type: 'uint8[]',
        indexed: false,
      },
    ],
    name: 'ValidCompositionAdded',
  },
  {
    type: 'function',
    inputs: [],
    name: 'UPGRADE_INTERFACE_VERSION',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'user', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'addPendingGoldenReward',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'user', internalType: 'address', type: 'address' },
      { name: 'level', internalType: 'uint8', type: 'uint8' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'addPendingStarReward',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'composition', internalType: 'uint8[3]', type: 'uint8[3]' },
    ],
    name: 'addValidComposition',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'stakeIndex', internalType: 'uint256', type: 'uint256' }],
    name: 'claimAPR',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'claimFeePercent',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'claimGoldenStarRewards',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'claimReferralRewards',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'claimStarLevelRewards',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'durationInDays', internalType: 'uint16', type: 'uint16' },
      { name: 'apr', internalType: 'uint16', type: 'uint16' },
      { name: 'monthlyUnstake', internalType: 'bool', type: 'bool' },
      { name: 'isActive', internalType: 'bool', type: 'bool' },
      { name: 'minStakeAmount', internalType: 'uint256', type: 'uint256' },
      {
        name: 'monthlyPrincipalReturnPercent',
        internalType: 'uint16',
        type: 'uint16',
      },
      { name: 'monthlyAPRClaimable', internalType: 'bool', type: 'bool' },
      { name: 'claimableInterval', internalType: 'uint256', type: 'uint256' },
      { name: 'stakeMultiple', internalType: 'uint256', type: 'uint256' },
      { name: 'principalLocked', internalType: 'bool', type: 'bool' },
    ],
    name: 'createPackage',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'uint16', type: 'uint16' },
    ],
    name: 'cumulativeBaseAPR',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'feeCollector',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'packageId', internalType: 'uint16', type: 'uint16' }],
    name: 'getClaimableInterval',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'user', internalType: 'address', type: 'address' }],
    name: 'getGoldenStarCap',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'user', internalType: 'address', type: 'address' }],
    name: 'getGoldenStarEarned',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'user', internalType: 'address', type: 'address' }],
    name: 'getGoldenStarPending',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'user', internalType: 'address', type: 'address' },
      { name: 'stakeIndex', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'getNextClaimTime',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'packageId', internalType: 'uint16', type: 'uint16' }],
    name: 'getPackageDetails',
    outputs: [
      { name: 'id', internalType: 'uint16', type: 'uint16' },
      { name: 'durationInDays', internalType: 'uint16', type: 'uint16' },
      { name: 'apr', internalType: 'uint16', type: 'uint16' },
      { name: 'monthlyUnstake', internalType: 'bool', type: 'bool' },
      { name: 'isActive', internalType: 'bool', type: 'bool' },
      { name: 'minStakeAmount', internalType: 'uint256', type: 'uint256' },
      {
        name: 'monthlyPrincipalReturnPercent',
        internalType: 'uint16',
        type: 'uint16',
      },
      { name: 'monthlyAPRClaimable', internalType: 'bool', type: 'bool' },
      { name: 'claimableInterval', internalType: 'uint256', type: 'uint256' },
      { name: 'stakeMultiple', internalType: 'uint256', type: 'uint256' },
      { name: 'principalLocked', internalType: 'bool', type: 'bool' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'user', internalType: 'address', type: 'address' }],
    name: 'getReferredUsers',
    outputs: [{ name: '', internalType: 'address[]', type: 'address[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'user', internalType: 'address', type: 'address' },
      { name: 'index', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'getStake',
    outputs: [
      {
        name: '',
        internalType: 'struct YearnTogetherStaking.StakeData',
        type: 'tuple',
        components: [
          { name: 'totalStaked', internalType: 'uint256', type: 'uint256' },
          { name: 'claimedAPR', internalType: 'uint256', type: 'uint256' },
          {
            name: 'withdrawnPrincipal',
            internalType: 'uint256',
            type: 'uint256',
          },
          { name: 'startTime', internalType: 'uint40', type: 'uint40' },
          { name: 'lastClaimedAt', internalType: 'uint40', type: 'uint40' },
          { name: 'lastUnstakedAt', internalType: 'uint40', type: 'uint40' },
          { name: 'packageId', internalType: 'uint16', type: 'uint16' },
          { name: 'isFullyUnstaked', internalType: 'bool', type: 'bool' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'level', internalType: 'uint8', type: 'uint8' }],
    name: 'getStarLevelRewardPercent',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getValidCompositions',
    outputs: [{ name: '', internalType: 'uint8[][]', type: 'uint8[][]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'goldenStarActivatedAt',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'goldenStarConfig',
    outputs: [
      { name: 'minReferrals', internalType: 'uint16', type: 'uint16' },
      { name: 'timeWindow', internalType: 'uint32', type: 'uint32' },
      { name: 'rewardPercent', internalType: 'uint16', type: 'uint16' },
      { name: 'rewardDuration', internalType: 'uint32', type: 'uint32' },
      { name: 'rewardCapMultiplier', internalType: 'uint8', type: 'uint8' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'goldenStarEarned',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_yYearn', internalType: 'address', type: 'address' },
      { name: '_sYearn', internalType: 'address', type: 'address' },
      { name: '_pYearn', internalType: 'address', type: 'address' },
    ],
    name: 'initialize',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'isGoldenStar',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'user', internalType: 'address', type: 'address' },
      { name: 'root', internalType: 'address', type: 'address' },
      { name: 'depth', internalType: 'uint8', type: 'uint8' },
    ],
    name: 'isInReferralTree',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'isWhitelisted',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'levelOneReferralRequirement',
    outputs: [{ name: '', internalType: 'uint8', type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'user', internalType: 'address', type: 'address' },
      { name: 'timestamp', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'markGoldenStarActivated',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'maxReferralLevel',
    outputs: [{ name: '', internalType: 'uint8', type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'maxStarLevel',
    outputs: [{ name: '', internalType: 'uint8', type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'nextPackageId',
    outputs: [{ name: '', internalType: 'uint16', type: 'uint16' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'pYearn',
    outputs: [{ name: '', internalType: 'contract IERC20', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'packages',
    outputs: [
      { name: 'id', internalType: 'uint16', type: 'uint16' },
      { name: 'durationInDays', internalType: 'uint16', type: 'uint16' },
      { name: 'apr', internalType: 'uint16', type: 'uint16' },
      { name: 'monthlyUnstake', internalType: 'bool', type: 'bool' },
      { name: 'isActive', internalType: 'bool', type: 'bool' },
      { name: 'minStakeAmount', internalType: 'uint256', type: 'uint256' },
      {
        name: 'monthlyPrincipalReturnPercent',
        internalType: 'uint16',
        type: 'uint16',
      },
      { name: 'monthlyAPRClaimable', internalType: 'bool', type: 'bool' },
      { name: 'claimableInterval', internalType: 'uint256', type: 'uint256' },
      { name: 'stakeMultiple', internalType: 'uint256', type: 'uint256' },
      { name: 'principalLocked', internalType: 'bool', type: 'bool' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'pause',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'paused',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'pendingStarRewards',
    outputs: [
      { name: 'goldenStarAmount', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'proxiableUUID',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'address', type: 'address' },
    ],
    name: 'referralEarnings',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'referralHistory',
    outputs: [
      { name: 'referee', internalType: 'address', type: 'address' },
      { name: 'timestamp', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'referralRewardTiers',
    outputs: [
      { name: 'startLevel', internalType: 'uint8', type: 'uint8' },
      { name: 'endLevel', internalType: 'uint8', type: 'uint8' },
      { name: 'rewardPercent', internalType: 'uint16', type: 'uint16' },
      { name: 'rewardToken', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'user', internalType: 'address', type: 'address' }],
    name: 'referralTimestamps',
    outputs: [{ name: '', internalType: 'uint256[]', type: 'uint256[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'referrals',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'referrerOf',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'renounceOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'sYearn',
    outputs: [{ name: '', internalType: 'contract IERC20', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_minReferrals', internalType: 'uint16', type: 'uint16' },
      { name: '_timeWindow', internalType: 'uint32', type: 'uint32' },
      { name: '_rewardPercent', internalType: 'uint16', type: 'uint16' },
      { name: '_rewardDuration', internalType: 'uint32', type: 'uint32' },
      { name: '_rewardCapMultiplier', internalType: 'uint8', type: 'uint8' },
    ],
    name: 'setGoldenStarConfig',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_level', internalType: 'uint8', type: 'uint8' }],
    name: 'setMaxReferralLevel',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_maxStarLevel', internalType: 'uint8', type: 'uint8' }],
    name: 'setMaxStarLevel',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'packageId', internalType: 'uint16', type: 'uint16' },
      { name: 'active', internalType: 'bool', type: 'bool' },
    ],
    name: 'setPackageActive',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'tiers',
        internalType: 'struct YearnTogetherStaking.ReferralRewardTier[]',
        type: 'tuple[]',
        components: [
          { name: 'startLevel', internalType: 'uint8', type: 'uint8' },
          { name: 'endLevel', internalType: 'uint8', type: 'uint8' },
          { name: 'rewardPercent', internalType: 'uint16', type: 'uint16' },
          { name: 'rewardToken', internalType: 'address', type: 'address' },
        ],
      },
    ],
    name: 'setReferralRewardTiers',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'user', internalType: 'address', type: 'address' },
      { name: 'level', internalType: 'uint8', type: 'uint8' },
      { name: 'timestamp', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'setStarLevelActivation',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'tiers',
        internalType: 'struct YearnTogetherStaking.StarLevel[]',
        type: 'tuple[]',
        components: [
          { name: 'level', internalType: 'uint8', type: 'uint8' },
          { name: 'rewardPercent', internalType: 'uint16', type: 'uint16' },
        ],
      },
    ],
    name: 'setStarLevelTiers',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_engine', internalType: 'address', type: 'address' }],
    name: 'setStarRewardEngine',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'user', internalType: 'address', type: 'address' },
      { name: 'level', internalType: 'uint8', type: 'uint8' },
    ],
    name: 'setUserStarLevel',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'packageId', internalType: 'uint16', type: 'uint16' },
      { name: 'tokens', internalType: 'address[]', type: 'address[]' },
      { name: 'amounts', internalType: 'uint256[]', type: 'uint256[]' },
      { name: 'referrer', internalType: 'address', type: 'address' },
    ],
    name: 'stake',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'uint8', type: 'uint8' },
    ],
    name: 'starLevelActivation',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'uint8', type: 'uint8' },
    ],
    name: 'starLevelClaimed',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'uint8', type: 'uint8' },
    ],
    name: 'starLevelEarnings',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'starLevelTiers',
    outputs: [
      { name: 'level', internalType: 'uint8', type: 'uint8' },
      { name: 'rewardPercent', internalType: 'uint16', type: 'uint16' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'starRewardEngine',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'starTierExecutor',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'subLevelReferralRequirement',
    outputs: [{ name: '', internalType: 'uint8', type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'unpause',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'stakeIndex', internalType: 'uint256', type: 'uint256' }],
    name: 'unstake',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'newImplementation', internalType: 'address', type: 'address' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'upgradeToAndCall',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'userRewardTiers',
    outputs: [
      { name: 'startLevel', internalType: 'uint8', type: 'uint8' },
      { name: 'endLevel', internalType: 'uint8', type: 'uint8' },
      { name: 'rewardPercent', internalType: 'uint16', type: 'uint16' },
      { name: 'rewardToken', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'userStakeCounts',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'userStakeTokenAmounts',
    outputs: [
      { name: 'token', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'userStakes',
    outputs: [
      { name: 'totalStaked', internalType: 'uint256', type: 'uint256' },
      { name: 'claimedAPR', internalType: 'uint256', type: 'uint256' },
      { name: 'withdrawnPrincipal', internalType: 'uint256', type: 'uint256' },
      { name: 'startTime', internalType: 'uint40', type: 'uint40' },
      { name: 'lastClaimedAt', internalType: 'uint40', type: 'uint40' },
      { name: 'lastUnstakedAt', internalType: 'uint40', type: 'uint40' },
      { name: 'packageId', internalType: 'uint16', type: 'uint16' },
      { name: 'isFullyUnstaked', internalType: 'bool', type: 'bool' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'userStarLevel',
    outputs: [{ name: '', internalType: 'uint8', type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'userTotalStaked',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'uint256', type: 'uint256' },
      { name: '', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'validCompositions',
    outputs: [{ name: '', internalType: 'uint8', type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'validCompositionsLength',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'user', internalType: 'address', type: 'address' },
      { name: 'allowed', internalType: 'bool', type: 'bool' },
    ],
    name: 'whitelist',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'withdrawnPerStake',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'yYearn',
    outputs: [{ name: '', internalType: 'contract IERC20', type: 'address' }],
    stateMutability: 'view',
  },
] as const

/**
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const yearnTogetherAddress = {
  84532: '0x72072efD335cf34a108aEcEdF27F0c3d036A86D1',
} as const

/**
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const yearnTogetherConfig = {
  address: yearnTogetherAddress,
  abi: yearnTogetherAbi,
} as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// React
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20Abi}__
 */
export const useReadErc20 = /*#__PURE__*/ createUseReadContract({
  abi: erc20Abi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"allowance"`
 */
export const useReadErc20Allowance = /*#__PURE__*/ createUseReadContract({
  abi: erc20Abi,
  functionName: 'allowance',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"balanceOf"`
 */
export const useReadErc20BalanceOf = /*#__PURE__*/ createUseReadContract({
  abi: erc20Abi,
  functionName: 'balanceOf',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"decimals"`
 */
export const useReadErc20Decimals = /*#__PURE__*/ createUseReadContract({
  abi: erc20Abi,
  functionName: 'decimals',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"name"`
 */
export const useReadErc20Name = /*#__PURE__*/ createUseReadContract({
  abi: erc20Abi,
  functionName: 'name',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"symbol"`
 */
export const useReadErc20Symbol = /*#__PURE__*/ createUseReadContract({
  abi: erc20Abi,
  functionName: 'symbol',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"totalSupply"`
 */
export const useReadErc20TotalSupply = /*#__PURE__*/ createUseReadContract({
  abi: erc20Abi,
  functionName: 'totalSupply',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link erc20Abi}__
 */
export const useWriteErc20 = /*#__PURE__*/ createUseWriteContract({
  abi: erc20Abi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"approve"`
 */
export const useWriteErc20Approve = /*#__PURE__*/ createUseWriteContract({
  abi: erc20Abi,
  functionName: 'approve',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"transfer"`
 */
export const useWriteErc20Transfer = /*#__PURE__*/ createUseWriteContract({
  abi: erc20Abi,
  functionName: 'transfer',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"transferFrom"`
 */
export const useWriteErc20TransferFrom = /*#__PURE__*/ createUseWriteContract({
  abi: erc20Abi,
  functionName: 'transferFrom',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link erc20Abi}__
 */
export const useSimulateErc20 = /*#__PURE__*/ createUseSimulateContract({
  abi: erc20Abi,
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"approve"`
 */
export const useSimulateErc20Approve = /*#__PURE__*/ createUseSimulateContract({
  abi: erc20Abi,
  functionName: 'approve',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"transfer"`
 */
export const useSimulateErc20Transfer = /*#__PURE__*/ createUseSimulateContract(
  { abi: erc20Abi, functionName: 'transfer' },
)

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"transferFrom"`
 */
export const useSimulateErc20TransferFrom =
  /*#__PURE__*/ createUseSimulateContract({
    abi: erc20Abi,
    functionName: 'transferFrom',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link erc20Abi}__
 */
export const useWatchErc20Event = /*#__PURE__*/ createUseWatchContractEvent({
  abi: erc20Abi,
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link erc20Abi}__ and `eventName` set to `"Approval"`
 */
export const useWatchErc20ApprovalEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: erc20Abi,
    eventName: 'Approval',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link erc20Abi}__ and `eventName` set to `"Transfer"`
 */
export const useWatchErc20TransferEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: erc20Abi,
    eventName: 'Transfer',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link yearnTogetherAbi}__
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useReadYearnTogether = /*#__PURE__*/ createUseReadContract({
  abi: yearnTogetherAbi,
  address: yearnTogetherAddress,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link yearnTogetherAbi}__ and `functionName` set to `"UPGRADE_INTERFACE_VERSION"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useReadYearnTogetherUpgradeInterfaceVersion =
  /*#__PURE__*/ createUseReadContract({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    functionName: 'UPGRADE_INTERFACE_VERSION',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link yearnTogetherAbi}__ and `functionName` set to `"claimFeePercent"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useReadYearnTogetherClaimFeePercent =
  /*#__PURE__*/ createUseReadContract({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    functionName: 'claimFeePercent',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link yearnTogetherAbi}__ and `functionName` set to `"cumulativeBaseAPR"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useReadYearnTogetherCumulativeBaseApr =
  /*#__PURE__*/ createUseReadContract({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    functionName: 'cumulativeBaseAPR',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link yearnTogetherAbi}__ and `functionName` set to `"feeCollector"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useReadYearnTogetherFeeCollector =
  /*#__PURE__*/ createUseReadContract({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    functionName: 'feeCollector',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link yearnTogetherAbi}__ and `functionName` set to `"getClaimableInterval"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useReadYearnTogetherGetClaimableInterval =
  /*#__PURE__*/ createUseReadContract({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    functionName: 'getClaimableInterval',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link yearnTogetherAbi}__ and `functionName` set to `"getGoldenStarCap"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useReadYearnTogetherGetGoldenStarCap =
  /*#__PURE__*/ createUseReadContract({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    functionName: 'getGoldenStarCap',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link yearnTogetherAbi}__ and `functionName` set to `"getGoldenStarEarned"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useReadYearnTogetherGetGoldenStarEarned =
  /*#__PURE__*/ createUseReadContract({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    functionName: 'getGoldenStarEarned',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link yearnTogetherAbi}__ and `functionName` set to `"getGoldenStarPending"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useReadYearnTogetherGetGoldenStarPending =
  /*#__PURE__*/ createUseReadContract({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    functionName: 'getGoldenStarPending',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link yearnTogetherAbi}__ and `functionName` set to `"getNextClaimTime"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useReadYearnTogetherGetNextClaimTime =
  /*#__PURE__*/ createUseReadContract({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    functionName: 'getNextClaimTime',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link yearnTogetherAbi}__ and `functionName` set to `"getPackageDetails"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useReadYearnTogetherGetPackageDetails =
  /*#__PURE__*/ createUseReadContract({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    functionName: 'getPackageDetails',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link yearnTogetherAbi}__ and `functionName` set to `"getReferredUsers"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useReadYearnTogetherGetReferredUsers =
  /*#__PURE__*/ createUseReadContract({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    functionName: 'getReferredUsers',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link yearnTogetherAbi}__ and `functionName` set to `"getStake"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useReadYearnTogetherGetStake = /*#__PURE__*/ createUseReadContract(
  {
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    functionName: 'getStake',
  },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link yearnTogetherAbi}__ and `functionName` set to `"getStarLevelRewardPercent"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useReadYearnTogetherGetStarLevelRewardPercent =
  /*#__PURE__*/ createUseReadContract({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    functionName: 'getStarLevelRewardPercent',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link yearnTogetherAbi}__ and `functionName` set to `"getValidCompositions"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useReadYearnTogetherGetValidCompositions =
  /*#__PURE__*/ createUseReadContract({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    functionName: 'getValidCompositions',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link yearnTogetherAbi}__ and `functionName` set to `"goldenStarActivatedAt"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useReadYearnTogetherGoldenStarActivatedAt =
  /*#__PURE__*/ createUseReadContract({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    functionName: 'goldenStarActivatedAt',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link yearnTogetherAbi}__ and `functionName` set to `"goldenStarConfig"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useReadYearnTogetherGoldenStarConfig =
  /*#__PURE__*/ createUseReadContract({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    functionName: 'goldenStarConfig',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link yearnTogetherAbi}__ and `functionName` set to `"goldenStarEarned"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useReadYearnTogetherGoldenStarEarned =
  /*#__PURE__*/ createUseReadContract({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    functionName: 'goldenStarEarned',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link yearnTogetherAbi}__ and `functionName` set to `"isGoldenStar"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useReadYearnTogetherIsGoldenStar =
  /*#__PURE__*/ createUseReadContract({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    functionName: 'isGoldenStar',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link yearnTogetherAbi}__ and `functionName` set to `"isInReferralTree"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useReadYearnTogetherIsInReferralTree =
  /*#__PURE__*/ createUseReadContract({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    functionName: 'isInReferralTree',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link yearnTogetherAbi}__ and `functionName` set to `"isWhitelisted"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useReadYearnTogetherIsWhitelisted =
  /*#__PURE__*/ createUseReadContract({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    functionName: 'isWhitelisted',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link yearnTogetherAbi}__ and `functionName` set to `"levelOneReferralRequirement"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useReadYearnTogetherLevelOneReferralRequirement =
  /*#__PURE__*/ createUseReadContract({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    functionName: 'levelOneReferralRequirement',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link yearnTogetherAbi}__ and `functionName` set to `"maxReferralLevel"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useReadYearnTogetherMaxReferralLevel =
  /*#__PURE__*/ createUseReadContract({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    functionName: 'maxReferralLevel',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link yearnTogetherAbi}__ and `functionName` set to `"maxStarLevel"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useReadYearnTogetherMaxStarLevel =
  /*#__PURE__*/ createUseReadContract({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    functionName: 'maxStarLevel',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link yearnTogetherAbi}__ and `functionName` set to `"nextPackageId"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useReadYearnTogetherNextPackageId =
  /*#__PURE__*/ createUseReadContract({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    functionName: 'nextPackageId',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link yearnTogetherAbi}__ and `functionName` set to `"owner"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useReadYearnTogetherOwner = /*#__PURE__*/ createUseReadContract({
  abi: yearnTogetherAbi,
  address: yearnTogetherAddress,
  functionName: 'owner',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link yearnTogetherAbi}__ and `functionName` set to `"pYearn"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useReadYearnTogetherPYearn = /*#__PURE__*/ createUseReadContract({
  abi: yearnTogetherAbi,
  address: yearnTogetherAddress,
  functionName: 'pYearn',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link yearnTogetherAbi}__ and `functionName` set to `"packages"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useReadYearnTogetherPackages = /*#__PURE__*/ createUseReadContract(
  {
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    functionName: 'packages',
  },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link yearnTogetherAbi}__ and `functionName` set to `"paused"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useReadYearnTogetherPaused = /*#__PURE__*/ createUseReadContract({
  abi: yearnTogetherAbi,
  address: yearnTogetherAddress,
  functionName: 'paused',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link yearnTogetherAbi}__ and `functionName` set to `"pendingStarRewards"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useReadYearnTogetherPendingStarRewards =
  /*#__PURE__*/ createUseReadContract({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    functionName: 'pendingStarRewards',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link yearnTogetherAbi}__ and `functionName` set to `"proxiableUUID"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useReadYearnTogetherProxiableUuid =
  /*#__PURE__*/ createUseReadContract({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    functionName: 'proxiableUUID',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link yearnTogetherAbi}__ and `functionName` set to `"referralEarnings"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useReadYearnTogetherReferralEarnings =
  /*#__PURE__*/ createUseReadContract({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    functionName: 'referralEarnings',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link yearnTogetherAbi}__ and `functionName` set to `"referralHistory"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useReadYearnTogetherReferralHistory =
  /*#__PURE__*/ createUseReadContract({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    functionName: 'referralHistory',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link yearnTogetherAbi}__ and `functionName` set to `"referralRewardTiers"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useReadYearnTogetherReferralRewardTiers =
  /*#__PURE__*/ createUseReadContract({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    functionName: 'referralRewardTiers',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link yearnTogetherAbi}__ and `functionName` set to `"referralTimestamps"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useReadYearnTogetherReferralTimestamps =
  /*#__PURE__*/ createUseReadContract({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    functionName: 'referralTimestamps',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link yearnTogetherAbi}__ and `functionName` set to `"referrals"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useReadYearnTogetherReferrals =
  /*#__PURE__*/ createUseReadContract({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    functionName: 'referrals',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link yearnTogetherAbi}__ and `functionName` set to `"referrerOf"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useReadYearnTogetherReferrerOf =
  /*#__PURE__*/ createUseReadContract({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    functionName: 'referrerOf',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link yearnTogetherAbi}__ and `functionName` set to `"sYearn"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useReadYearnTogetherSYearn = /*#__PURE__*/ createUseReadContract({
  abi: yearnTogetherAbi,
  address: yearnTogetherAddress,
  functionName: 'sYearn',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link yearnTogetherAbi}__ and `functionName` set to `"starLevelActivation"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useReadYearnTogetherStarLevelActivation =
  /*#__PURE__*/ createUseReadContract({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    functionName: 'starLevelActivation',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link yearnTogetherAbi}__ and `functionName` set to `"starLevelClaimed"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useReadYearnTogetherStarLevelClaimed =
  /*#__PURE__*/ createUseReadContract({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    functionName: 'starLevelClaimed',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link yearnTogetherAbi}__ and `functionName` set to `"starLevelEarnings"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useReadYearnTogetherStarLevelEarnings =
  /*#__PURE__*/ createUseReadContract({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    functionName: 'starLevelEarnings',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link yearnTogetherAbi}__ and `functionName` set to `"starLevelTiers"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useReadYearnTogetherStarLevelTiers =
  /*#__PURE__*/ createUseReadContract({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    functionName: 'starLevelTiers',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link yearnTogetherAbi}__ and `functionName` set to `"starRewardEngine"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useReadYearnTogetherStarRewardEngine =
  /*#__PURE__*/ createUseReadContract({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    functionName: 'starRewardEngine',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link yearnTogetherAbi}__ and `functionName` set to `"starTierExecutor"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useReadYearnTogetherStarTierExecutor =
  /*#__PURE__*/ createUseReadContract({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    functionName: 'starTierExecutor',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link yearnTogetherAbi}__ and `functionName` set to `"subLevelReferralRequirement"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useReadYearnTogetherSubLevelReferralRequirement =
  /*#__PURE__*/ createUseReadContract({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    functionName: 'subLevelReferralRequirement',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link yearnTogetherAbi}__ and `functionName` set to `"userRewardTiers"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useReadYearnTogetherUserRewardTiers =
  /*#__PURE__*/ createUseReadContract({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    functionName: 'userRewardTiers',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link yearnTogetherAbi}__ and `functionName` set to `"userStakeCounts"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useReadYearnTogetherUserStakeCounts =
  /*#__PURE__*/ createUseReadContract({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    functionName: 'userStakeCounts',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link yearnTogetherAbi}__ and `functionName` set to `"userStakeTokenAmounts"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useReadYearnTogetherUserStakeTokenAmounts =
  /*#__PURE__*/ createUseReadContract({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    functionName: 'userStakeTokenAmounts',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link yearnTogetherAbi}__ and `functionName` set to `"userStakes"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useReadYearnTogetherUserStakes =
  /*#__PURE__*/ createUseReadContract({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    functionName: 'userStakes',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link yearnTogetherAbi}__ and `functionName` set to `"userStarLevel"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useReadYearnTogetherUserStarLevel =
  /*#__PURE__*/ createUseReadContract({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    functionName: 'userStarLevel',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link yearnTogetherAbi}__ and `functionName` set to `"userTotalStaked"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useReadYearnTogetherUserTotalStaked =
  /*#__PURE__*/ createUseReadContract({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    functionName: 'userTotalStaked',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link yearnTogetherAbi}__ and `functionName` set to `"validCompositions"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useReadYearnTogetherValidCompositions =
  /*#__PURE__*/ createUseReadContract({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    functionName: 'validCompositions',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link yearnTogetherAbi}__ and `functionName` set to `"validCompositionsLength"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useReadYearnTogetherValidCompositionsLength =
  /*#__PURE__*/ createUseReadContract({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    functionName: 'validCompositionsLength',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link yearnTogetherAbi}__ and `functionName` set to `"withdrawnPerStake"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useReadYearnTogetherWithdrawnPerStake =
  /*#__PURE__*/ createUseReadContract({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    functionName: 'withdrawnPerStake',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link yearnTogetherAbi}__ and `functionName` set to `"yYearn"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useReadYearnTogetherYYearn = /*#__PURE__*/ createUseReadContract({
  abi: yearnTogetherAbi,
  address: yearnTogetherAddress,
  functionName: 'yYearn',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link yearnTogetherAbi}__
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useWriteYearnTogether = /*#__PURE__*/ createUseWriteContract({
  abi: yearnTogetherAbi,
  address: yearnTogetherAddress,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link yearnTogetherAbi}__ and `functionName` set to `"addPendingGoldenReward"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useWriteYearnTogetherAddPendingGoldenReward =
  /*#__PURE__*/ createUseWriteContract({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    functionName: 'addPendingGoldenReward',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link yearnTogetherAbi}__ and `functionName` set to `"addPendingStarReward"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useWriteYearnTogetherAddPendingStarReward =
  /*#__PURE__*/ createUseWriteContract({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    functionName: 'addPendingStarReward',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link yearnTogetherAbi}__ and `functionName` set to `"addValidComposition"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useWriteYearnTogetherAddValidComposition =
  /*#__PURE__*/ createUseWriteContract({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    functionName: 'addValidComposition',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link yearnTogetherAbi}__ and `functionName` set to `"claimAPR"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useWriteYearnTogetherClaimApr =
  /*#__PURE__*/ createUseWriteContract({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    functionName: 'claimAPR',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link yearnTogetherAbi}__ and `functionName` set to `"claimGoldenStarRewards"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useWriteYearnTogetherClaimGoldenStarRewards =
  /*#__PURE__*/ createUseWriteContract({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    functionName: 'claimGoldenStarRewards',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link yearnTogetherAbi}__ and `functionName` set to `"claimReferralRewards"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useWriteYearnTogetherClaimReferralRewards =
  /*#__PURE__*/ createUseWriteContract({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    functionName: 'claimReferralRewards',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link yearnTogetherAbi}__ and `functionName` set to `"claimStarLevelRewards"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useWriteYearnTogetherClaimStarLevelRewards =
  /*#__PURE__*/ createUseWriteContract({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    functionName: 'claimStarLevelRewards',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link yearnTogetherAbi}__ and `functionName` set to `"createPackage"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useWriteYearnTogetherCreatePackage =
  /*#__PURE__*/ createUseWriteContract({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    functionName: 'createPackage',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link yearnTogetherAbi}__ and `functionName` set to `"initialize"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useWriteYearnTogetherInitialize =
  /*#__PURE__*/ createUseWriteContract({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    functionName: 'initialize',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link yearnTogetherAbi}__ and `functionName` set to `"markGoldenStarActivated"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useWriteYearnTogetherMarkGoldenStarActivated =
  /*#__PURE__*/ createUseWriteContract({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    functionName: 'markGoldenStarActivated',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link yearnTogetherAbi}__ and `functionName` set to `"pause"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useWriteYearnTogetherPause = /*#__PURE__*/ createUseWriteContract({
  abi: yearnTogetherAbi,
  address: yearnTogetherAddress,
  functionName: 'pause',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link yearnTogetherAbi}__ and `functionName` set to `"renounceOwnership"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useWriteYearnTogetherRenounceOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link yearnTogetherAbi}__ and `functionName` set to `"setGoldenStarConfig"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useWriteYearnTogetherSetGoldenStarConfig =
  /*#__PURE__*/ createUseWriteContract({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    functionName: 'setGoldenStarConfig',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link yearnTogetherAbi}__ and `functionName` set to `"setMaxReferralLevel"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useWriteYearnTogetherSetMaxReferralLevel =
  /*#__PURE__*/ createUseWriteContract({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    functionName: 'setMaxReferralLevel',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link yearnTogetherAbi}__ and `functionName` set to `"setMaxStarLevel"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useWriteYearnTogetherSetMaxStarLevel =
  /*#__PURE__*/ createUseWriteContract({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    functionName: 'setMaxStarLevel',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link yearnTogetherAbi}__ and `functionName` set to `"setPackageActive"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useWriteYearnTogetherSetPackageActive =
  /*#__PURE__*/ createUseWriteContract({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    functionName: 'setPackageActive',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link yearnTogetherAbi}__ and `functionName` set to `"setReferralRewardTiers"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useWriteYearnTogetherSetReferralRewardTiers =
  /*#__PURE__*/ createUseWriteContract({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    functionName: 'setReferralRewardTiers',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link yearnTogetherAbi}__ and `functionName` set to `"setStarLevelActivation"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useWriteYearnTogetherSetStarLevelActivation =
  /*#__PURE__*/ createUseWriteContract({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    functionName: 'setStarLevelActivation',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link yearnTogetherAbi}__ and `functionName` set to `"setStarLevelTiers"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useWriteYearnTogetherSetStarLevelTiers =
  /*#__PURE__*/ createUseWriteContract({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    functionName: 'setStarLevelTiers',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link yearnTogetherAbi}__ and `functionName` set to `"setStarRewardEngine"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useWriteYearnTogetherSetStarRewardEngine =
  /*#__PURE__*/ createUseWriteContract({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    functionName: 'setStarRewardEngine',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link yearnTogetherAbi}__ and `functionName` set to `"setUserStarLevel"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useWriteYearnTogetherSetUserStarLevel =
  /*#__PURE__*/ createUseWriteContract({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    functionName: 'setUserStarLevel',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link yearnTogetherAbi}__ and `functionName` set to `"stake"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useWriteYearnTogetherStake = /*#__PURE__*/ createUseWriteContract({
  abi: yearnTogetherAbi,
  address: yearnTogetherAddress,
  functionName: 'stake',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link yearnTogetherAbi}__ and `functionName` set to `"transferOwnership"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useWriteYearnTogetherTransferOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link yearnTogetherAbi}__ and `functionName` set to `"unpause"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useWriteYearnTogetherUnpause =
  /*#__PURE__*/ createUseWriteContract({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    functionName: 'unpause',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link yearnTogetherAbi}__ and `functionName` set to `"unstake"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useWriteYearnTogetherUnstake =
  /*#__PURE__*/ createUseWriteContract({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    functionName: 'unstake',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link yearnTogetherAbi}__ and `functionName` set to `"upgradeToAndCall"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useWriteYearnTogetherUpgradeToAndCall =
  /*#__PURE__*/ createUseWriteContract({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    functionName: 'upgradeToAndCall',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link yearnTogetherAbi}__ and `functionName` set to `"whitelist"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useWriteYearnTogetherWhitelist =
  /*#__PURE__*/ createUseWriteContract({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    functionName: 'whitelist',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link yearnTogetherAbi}__
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useSimulateYearnTogether = /*#__PURE__*/ createUseSimulateContract(
  { abi: yearnTogetherAbi, address: yearnTogetherAddress },
)

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link yearnTogetherAbi}__ and `functionName` set to `"addPendingGoldenReward"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useSimulateYearnTogetherAddPendingGoldenReward =
  /*#__PURE__*/ createUseSimulateContract({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    functionName: 'addPendingGoldenReward',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link yearnTogetherAbi}__ and `functionName` set to `"addPendingStarReward"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useSimulateYearnTogetherAddPendingStarReward =
  /*#__PURE__*/ createUseSimulateContract({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    functionName: 'addPendingStarReward',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link yearnTogetherAbi}__ and `functionName` set to `"addValidComposition"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useSimulateYearnTogetherAddValidComposition =
  /*#__PURE__*/ createUseSimulateContract({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    functionName: 'addValidComposition',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link yearnTogetherAbi}__ and `functionName` set to `"claimAPR"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useSimulateYearnTogetherClaimApr =
  /*#__PURE__*/ createUseSimulateContract({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    functionName: 'claimAPR',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link yearnTogetherAbi}__ and `functionName` set to `"claimGoldenStarRewards"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useSimulateYearnTogetherClaimGoldenStarRewards =
  /*#__PURE__*/ createUseSimulateContract({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    functionName: 'claimGoldenStarRewards',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link yearnTogetherAbi}__ and `functionName` set to `"claimReferralRewards"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useSimulateYearnTogetherClaimReferralRewards =
  /*#__PURE__*/ createUseSimulateContract({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    functionName: 'claimReferralRewards',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link yearnTogetherAbi}__ and `functionName` set to `"claimStarLevelRewards"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useSimulateYearnTogetherClaimStarLevelRewards =
  /*#__PURE__*/ createUseSimulateContract({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    functionName: 'claimStarLevelRewards',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link yearnTogetherAbi}__ and `functionName` set to `"createPackage"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useSimulateYearnTogetherCreatePackage =
  /*#__PURE__*/ createUseSimulateContract({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    functionName: 'createPackage',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link yearnTogetherAbi}__ and `functionName` set to `"initialize"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useSimulateYearnTogetherInitialize =
  /*#__PURE__*/ createUseSimulateContract({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    functionName: 'initialize',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link yearnTogetherAbi}__ and `functionName` set to `"markGoldenStarActivated"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useSimulateYearnTogetherMarkGoldenStarActivated =
  /*#__PURE__*/ createUseSimulateContract({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    functionName: 'markGoldenStarActivated',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link yearnTogetherAbi}__ and `functionName` set to `"pause"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useSimulateYearnTogetherPause =
  /*#__PURE__*/ createUseSimulateContract({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    functionName: 'pause',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link yearnTogetherAbi}__ and `functionName` set to `"renounceOwnership"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useSimulateYearnTogetherRenounceOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    functionName: 'renounceOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link yearnTogetherAbi}__ and `functionName` set to `"setGoldenStarConfig"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useSimulateYearnTogetherSetGoldenStarConfig =
  /*#__PURE__*/ createUseSimulateContract({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    functionName: 'setGoldenStarConfig',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link yearnTogetherAbi}__ and `functionName` set to `"setMaxReferralLevel"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useSimulateYearnTogetherSetMaxReferralLevel =
  /*#__PURE__*/ createUseSimulateContract({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    functionName: 'setMaxReferralLevel',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link yearnTogetherAbi}__ and `functionName` set to `"setMaxStarLevel"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useSimulateYearnTogetherSetMaxStarLevel =
  /*#__PURE__*/ createUseSimulateContract({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    functionName: 'setMaxStarLevel',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link yearnTogetherAbi}__ and `functionName` set to `"setPackageActive"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useSimulateYearnTogetherSetPackageActive =
  /*#__PURE__*/ createUseSimulateContract({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    functionName: 'setPackageActive',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link yearnTogetherAbi}__ and `functionName` set to `"setReferralRewardTiers"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useSimulateYearnTogetherSetReferralRewardTiers =
  /*#__PURE__*/ createUseSimulateContract({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    functionName: 'setReferralRewardTiers',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link yearnTogetherAbi}__ and `functionName` set to `"setStarLevelActivation"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useSimulateYearnTogetherSetStarLevelActivation =
  /*#__PURE__*/ createUseSimulateContract({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    functionName: 'setStarLevelActivation',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link yearnTogetherAbi}__ and `functionName` set to `"setStarLevelTiers"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useSimulateYearnTogetherSetStarLevelTiers =
  /*#__PURE__*/ createUseSimulateContract({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    functionName: 'setStarLevelTiers',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link yearnTogetherAbi}__ and `functionName` set to `"setStarRewardEngine"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useSimulateYearnTogetherSetStarRewardEngine =
  /*#__PURE__*/ createUseSimulateContract({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    functionName: 'setStarRewardEngine',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link yearnTogetherAbi}__ and `functionName` set to `"setUserStarLevel"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useSimulateYearnTogetherSetUserStarLevel =
  /*#__PURE__*/ createUseSimulateContract({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    functionName: 'setUserStarLevel',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link yearnTogetherAbi}__ and `functionName` set to `"stake"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useSimulateYearnTogetherStake =
  /*#__PURE__*/ createUseSimulateContract({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    functionName: 'stake',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link yearnTogetherAbi}__ and `functionName` set to `"transferOwnership"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useSimulateYearnTogetherTransferOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link yearnTogetherAbi}__ and `functionName` set to `"unpause"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useSimulateYearnTogetherUnpause =
  /*#__PURE__*/ createUseSimulateContract({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    functionName: 'unpause',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link yearnTogetherAbi}__ and `functionName` set to `"unstake"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useSimulateYearnTogetherUnstake =
  /*#__PURE__*/ createUseSimulateContract({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    functionName: 'unstake',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link yearnTogetherAbi}__ and `functionName` set to `"upgradeToAndCall"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useSimulateYearnTogetherUpgradeToAndCall =
  /*#__PURE__*/ createUseSimulateContract({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    functionName: 'upgradeToAndCall',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link yearnTogetherAbi}__ and `functionName` set to `"whitelist"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useSimulateYearnTogetherWhitelist =
  /*#__PURE__*/ createUseSimulateContract({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    functionName: 'whitelist',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link yearnTogetherAbi}__
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useWatchYearnTogetherEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link yearnTogetherAbi}__ and `eventName` set to `"APRClaimed"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useWatchYearnTogetherAprClaimedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    eventName: 'APRClaimed',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link yearnTogetherAbi}__ and `eventName` set to `"Claimed"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useWatchYearnTogetherClaimedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    eventName: 'Claimed',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link yearnTogetherAbi}__ and `eventName` set to `"GoldenRewardDistributed"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useWatchYearnTogetherGoldenRewardDistributedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    eventName: 'GoldenRewardDistributed',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link yearnTogetherAbi}__ and `eventName` set to `"GoldenStarActivated"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useWatchYearnTogetherGoldenStarActivatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    eventName: 'GoldenStarActivated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link yearnTogetherAbi}__ and `eventName` set to `"GoldenStarConfigUpdated"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useWatchYearnTogetherGoldenStarConfigUpdatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    eventName: 'GoldenStarConfigUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link yearnTogetherAbi}__ and `eventName` set to `"GoldenStarRewardClaimed"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useWatchYearnTogetherGoldenStarRewardClaimedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    eventName: 'GoldenStarRewardClaimed',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link yearnTogetherAbi}__ and `eventName` set to `"GoldenStarRewardDistributed"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useWatchYearnTogetherGoldenStarRewardDistributedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    eventName: 'GoldenStarRewardDistributed',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link yearnTogetherAbi}__ and `eventName` set to `"Initialized"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useWatchYearnTogetherInitializedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    eventName: 'Initialized',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link yearnTogetherAbi}__ and `eventName` set to `"MaxStarLevelUpdated"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useWatchYearnTogetherMaxStarLevelUpdatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    eventName: 'MaxStarLevelUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link yearnTogetherAbi}__ and `eventName` set to `"OwnershipTransferred"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useWatchYearnTogetherOwnershipTransferredEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    eventName: 'OwnershipTransferred',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link yearnTogetherAbi}__ and `eventName` set to `"PackageCreated"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useWatchYearnTogetherPackageCreatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    eventName: 'PackageCreated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link yearnTogetherAbi}__ and `eventName` set to `"PackageStatusUpdated"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useWatchYearnTogetherPackageStatusUpdatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    eventName: 'PackageStatusUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link yearnTogetherAbi}__ and `eventName` set to `"Paused"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useWatchYearnTogetherPausedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    eventName: 'Paused',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link yearnTogetherAbi}__ and `eventName` set to `"ReferralAssigned"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useWatchYearnTogetherReferralAssignedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    eventName: 'ReferralAssigned',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link yearnTogetherAbi}__ and `eventName` set to `"ReferralRewardDistributed"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useWatchYearnTogetherReferralRewardDistributedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    eventName: 'ReferralRewardDistributed',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link yearnTogetherAbi}__ and `eventName` set to `"ReferralRewardTiersUpdated"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useWatchYearnTogetherReferralRewardTiersUpdatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    eventName: 'ReferralRewardTiersUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link yearnTogetherAbi}__ and `eventName` set to `"ReferralRewardsClaimed"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useWatchYearnTogetherReferralRewardsClaimedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    eventName: 'ReferralRewardsClaimed',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link yearnTogetherAbi}__ and `eventName` set to `"Staked"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useWatchYearnTogetherStakedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    eventName: 'Staked',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link yearnTogetherAbi}__ and `eventName` set to `"StarLevelRequirementsUpdated"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useWatchYearnTogetherStarLevelRequirementsUpdatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    eventName: 'StarLevelRequirementsUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link yearnTogetherAbi}__ and `eventName` set to `"StarLevelTiersUpdated"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useWatchYearnTogetherStarLevelTiersUpdatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    eventName: 'StarLevelTiersUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link yearnTogetherAbi}__ and `eventName` set to `"StarLevelUpdated"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useWatchYearnTogetherStarLevelUpdatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    eventName: 'StarLevelUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link yearnTogetherAbi}__ and `eventName` set to `"StarRewardClaimed"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useWatchYearnTogetherStarRewardClaimedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    eventName: 'StarRewardClaimed',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link yearnTogetherAbi}__ and `eventName` set to `"StarRewardDistributed"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useWatchYearnTogetherStarRewardDistributedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    eventName: 'StarRewardDistributed',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link yearnTogetherAbi}__ and `eventName` set to `"StarTierExecutorUpdated"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useWatchYearnTogetherStarTierExecutorUpdatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    eventName: 'StarTierExecutorUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link yearnTogetherAbi}__ and `eventName` set to `"Unpaused"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useWatchYearnTogetherUnpausedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    eventName: 'Unpaused',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link yearnTogetherAbi}__ and `eventName` set to `"Unstaked"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useWatchYearnTogetherUnstakedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    eventName: 'Unstaked',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link yearnTogetherAbi}__ and `eventName` set to `"Upgraded"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useWatchYearnTogetherUpgradedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    eventName: 'Upgraded',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link yearnTogetherAbi}__ and `eventName` set to `"ValidCompositionAdded"`
 *
 * [__View Contract on Base Sepolia Basescan__](https://sepolia.basescan.org/address/0x72072efD335cf34a108aEcEdF27F0c3d036A86D1)
 */
export const useWatchYearnTogetherValidCompositionAddedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: yearnTogetherAbi,
    address: yearnTogetherAddress,
    eventName: 'ValidCompositionAdded',
  })
