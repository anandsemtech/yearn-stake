// src/graphql/types.ts
export * from "./__generated__/types";

// Aliases to avoid refactors where old names linger
import type {
  Package as PackageCreated,
  Stake as UserStake,
} from "./__generated__/types";

export type { PackageCreated, UserStake };
