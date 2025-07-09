# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server with Vite
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix linting issues automatically
- `npm run preview` - Preview production build

## Project Architecture

### Tech Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: React Context (Theme, Wallet, Referral)
- **Web3**: Wagmi + Viem for blockchain interactions
- **Wallet**: Reown AppKit for wallet connections
- **GraphQL**: Apollo Client for subgraph queries
- **UI Components**: Lucide React icons, React Toastify, Recharts
- **Tables**: @tanstack/react-table

### Core Architecture

This is a **DeFi staking application** called "YearnTogether" with the following key systems:

1. **Staking System**: Users can stake tokens in different packages with varying APRs and durations
2. **Star Level System**: Gamified progression system with star levels and rewards
3. **Golden Star System**: Premium tier with special benefits and referral requirements
4. **Referral System**: Multi-level referral rewards with automatic URL-based detection
5. **Token Management**: Multi-token support (Y, S, P tokens) with ERC20 operations

### Provider Hierarchy

The app uses a nested provider structure in `src/Provider.tsx`:

```text
AppKitProvider (Web3/Wallet)
  └── GraphQLProvider (Apollo Client)
    └── ThemeProvider
      └── WalletProvider
        └── ReferralProvider
          └── App
```

### Key Directories

- **`src/web3/`**: All blockchain interaction logic
  - `ReadContract/`: Wagmi read hooks for contract data
  - `WriteContract/`: Wagmi write hooks for contract transactions
  - `contract.ts`: Contract configurations and addresses
  - `abi/`: Contract ABI definitions

- **`src/graphql/`**: GraphQL/Apollo Client setup
  - `queries.ts`: Comprehensive GraphQL queries for all contract events
  - `client.ts`: Apollo Client configuration
  - `hooks.ts`: Custom GraphQL hooks

- **`src/contexts/`**: React Context providers
  - `ReferralContext.tsx`: Referral system state management
  - `ThemeContext.tsx`: Theme switching
  - `WalletContext.tsx`: Wallet connection state

- **`src/components/`**: UI components organized by feature
  - Staking components (StakingModal, PackageCards)
  - Dashboard components (ActivePackages, StatsOverview)
  - Referral components (ReferralShareModal, ReferralStatus)
  - Star system components (StarLevelProgress, LevelDetailModal)

### Important Configuration

- **Environment Variables**:
  - `VITE_SUBGRAPH_URL`: GraphQL subgraph endpoint
  - `VITE_BASE_CONTRACT_ADDRESS`: Main contract address
  - `VITE_WALLET_CONNECT_PROJECT_ID`: WalletConnect project ID

- **Network**: Currently configured for Base Sepolia testnet

- **Contract Integration**: Uses automatic address fallback system where hooks can work with or without explicit addresses

### Referral System

The referral system (documented in `REFERRAL_SYSTEM.md`) includes:

- Automatic URL detection for `/ref/{address}` patterns
- Local storage persistence with 24-hour expiration
- Context-based state management throughout the app
- Integration with staking transactions

### GraphQL Schema

The app queries a comprehensive subgraph covering:

- User staking events (stakes, unstakes, claims)
- Star level progression and rewards
- Golden star activations and rewards
- Referral rewards and distributions
- Package management and system events

### Web3 Hook Patterns

- **Read hooks**: Auto-refresh contract data with proper typing
- **Write hooks**: Handle transactions with loading states and error handling
- **Combined hooks**: Complex operations like stake-with-approval
- **Automatic fallbacks**: Token and contract addresses from configuration

### Development Patterns

- TypeScript interfaces for all data structures
- Comprehensive error handling with toast notifications
- Responsive design with Tailwind CSS
- Component-based architecture with proper separation of concerns
- Context-based state management for cross-component data

### Testing and Debugging

- Use `ReferralTest.tsx` component for referral system testing
- `GraphQLExample.tsx` for GraphQL integration testing
- Development components included in Dashboard for testing features

## Common Development Tasks

### Adding a New Staking Package

1. Update contract via `useCreatePackage` hook from `src/web3/WriteContract/`
2. Package data will automatically sync via GraphQL queries
3. UI will update through `PackageCards` component

### Token Approval Flow
- Use `useMultiTokenApprove` for batch approvals of multiple tokens
- Hooks automatically fallback to configured contract addresses
- Pattern: Check allowance → Approve if needed → Execute transaction

### Referral Integration
- Referral addresses are automatically detected from `/ref/{address}` URLs
- Access via `useReferralContext()` hook
- Integrate with staking by passing referrer to contract functions

## Common Troubleshooting

- **GraphQL errors**: Check `VITE_SUBGRAPH_URL` environment variable
- **Contract interactions**: Verify `VITE_BASE_CONTRACT_ADDRESS` is set
- **Wallet connection**: Ensure `VITE_WALLET_CONNECT_PROJECT_ID` is configured
- **Token approvals**: Use `useCheckApprovalNeeded` to debug approval issues

When working with this codebase, always consider the multi-token, multi-level nature of the staking system and the complex referral mechanics that drive user engagement.