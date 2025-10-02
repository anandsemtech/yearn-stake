export type Maybe<T> = T | null;
export type InputMaybe<T> = T | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  BigDecimal: { input: any; output: any; }
  BigInt: { input: any; output: any; }
  Bytes: { input: any; output: any; }
  Int8: { input: any; output: any; }
  Timestamp: { input: any; output: any; }
};

export type AprClaim = {
  __typename?: 'APRClaim';
  blockNumber: Scalars['BigInt']['output'];
  grossReward: Scalars['BigInt']['output'];
  id: Scalars['ID']['output'];
  netReward: Scalars['BigInt']['output'];
  packageId: Scalars['Int']['output'];
  stakeId: Scalars['ID']['output'];
  timestamp: Scalars['BigInt']['output'];
  txHash: Scalars['Bytes']['output'];
  user: User;
};

export type AprClaim_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<AprClaim_Filter>>>;
  blockNumber?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_gt?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_gte?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  blockNumber_lt?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_lte?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_not?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  grossReward?: InputMaybe<Scalars['BigInt']['input']>;
  grossReward_gt?: InputMaybe<Scalars['BigInt']['input']>;
  grossReward_gte?: InputMaybe<Scalars['BigInt']['input']>;
  grossReward_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  grossReward_lt?: InputMaybe<Scalars['BigInt']['input']>;
  grossReward_lte?: InputMaybe<Scalars['BigInt']['input']>;
  grossReward_not?: InputMaybe<Scalars['BigInt']['input']>;
  grossReward_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  netReward?: InputMaybe<Scalars['BigInt']['input']>;
  netReward_gt?: InputMaybe<Scalars['BigInt']['input']>;
  netReward_gte?: InputMaybe<Scalars['BigInt']['input']>;
  netReward_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  netReward_lt?: InputMaybe<Scalars['BigInt']['input']>;
  netReward_lte?: InputMaybe<Scalars['BigInt']['input']>;
  netReward_not?: InputMaybe<Scalars['BigInt']['input']>;
  netReward_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  or?: InputMaybe<Array<InputMaybe<AprClaim_Filter>>>;
  packageId?: InputMaybe<Scalars['Int']['input']>;
  packageId_gt?: InputMaybe<Scalars['Int']['input']>;
  packageId_gte?: InputMaybe<Scalars['Int']['input']>;
  packageId_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  packageId_lt?: InputMaybe<Scalars['Int']['input']>;
  packageId_lte?: InputMaybe<Scalars['Int']['input']>;
  packageId_not?: InputMaybe<Scalars['Int']['input']>;
  packageId_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  stakeId?: InputMaybe<Scalars['ID']['input']>;
  stakeId_gt?: InputMaybe<Scalars['ID']['input']>;
  stakeId_gte?: InputMaybe<Scalars['ID']['input']>;
  stakeId_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  stakeId_lt?: InputMaybe<Scalars['ID']['input']>;
  stakeId_lte?: InputMaybe<Scalars['ID']['input']>;
  stakeId_not?: InputMaybe<Scalars['ID']['input']>;
  stakeId_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  timestamp?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_gt?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_gte?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  timestamp_lt?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_lte?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_not?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  txHash?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_contains?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_gt?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_gte?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  txHash_lt?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_lte?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  user?: InputMaybe<Scalars['String']['input']>;
  user_?: InputMaybe<User_Filter>;
  user_contains?: InputMaybe<Scalars['String']['input']>;
  user_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  user_ends_with?: InputMaybe<Scalars['String']['input']>;
  user_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  user_gt?: InputMaybe<Scalars['String']['input']>;
  user_gte?: InputMaybe<Scalars['String']['input']>;
  user_in?: InputMaybe<Array<Scalars['String']['input']>>;
  user_lt?: InputMaybe<Scalars['String']['input']>;
  user_lte?: InputMaybe<Scalars['String']['input']>;
  user_not?: InputMaybe<Scalars['String']['input']>;
  user_not_contains?: InputMaybe<Scalars['String']['input']>;
  user_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  user_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  user_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  user_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  user_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  user_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  user_starts_with?: InputMaybe<Scalars['String']['input']>;
  user_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
};

export type AprClaim_OrderBy =
  | 'blockNumber'
  | 'grossReward'
  | 'id'
  | 'netReward'
  | 'packageId'
  | 'stakeId'
  | 'timestamp'
  | 'txHash'
  | 'user'
  | 'user__goldenEarningsTotal'
  | 'user__goldenStarActivatedAt'
  | 'user__id'
  | 'user__isGoldenStar'
  | 'user__level'
  | 'user__starEarningsTotal'
  | 'user__totalStaked';

export type Aggregation_Interval =
  | 'day'
  | 'hour';

export type BlockChangedFilter = {
  number_gte: Scalars['Int']['input'];
};

export type Block_Height = {
  hash?: InputMaybe<Scalars['Bytes']['input']>;
  number?: InputMaybe<Scalars['Int']['input']>;
  number_gte?: InputMaybe<Scalars['Int']['input']>;
};

export type Composition = {
  __typename?: 'Composition';
  blockNumber: Scalars['BigInt']['output'];
  id: Scalars['ID']['output'];
  index: Scalars['Int']['output'];
  pYearnPct: Scalars['Int']['output'];
  sYearnPct: Scalars['Int']['output'];
  timestamp: Scalars['BigInt']['output'];
  txHash: Scalars['Bytes']['output'];
  yYearnPct: Scalars['Int']['output'];
};

export type Composition_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<Composition_Filter>>>;
  blockNumber?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_gt?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_gte?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  blockNumber_lt?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_lte?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_not?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  index?: InputMaybe<Scalars['Int']['input']>;
  index_gt?: InputMaybe<Scalars['Int']['input']>;
  index_gte?: InputMaybe<Scalars['Int']['input']>;
  index_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  index_lt?: InputMaybe<Scalars['Int']['input']>;
  index_lte?: InputMaybe<Scalars['Int']['input']>;
  index_not?: InputMaybe<Scalars['Int']['input']>;
  index_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  or?: InputMaybe<Array<InputMaybe<Composition_Filter>>>;
  pYearnPct?: InputMaybe<Scalars['Int']['input']>;
  pYearnPct_gt?: InputMaybe<Scalars['Int']['input']>;
  pYearnPct_gte?: InputMaybe<Scalars['Int']['input']>;
  pYearnPct_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  pYearnPct_lt?: InputMaybe<Scalars['Int']['input']>;
  pYearnPct_lte?: InputMaybe<Scalars['Int']['input']>;
  pYearnPct_not?: InputMaybe<Scalars['Int']['input']>;
  pYearnPct_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  sYearnPct?: InputMaybe<Scalars['Int']['input']>;
  sYearnPct_gt?: InputMaybe<Scalars['Int']['input']>;
  sYearnPct_gte?: InputMaybe<Scalars['Int']['input']>;
  sYearnPct_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  sYearnPct_lt?: InputMaybe<Scalars['Int']['input']>;
  sYearnPct_lte?: InputMaybe<Scalars['Int']['input']>;
  sYearnPct_not?: InputMaybe<Scalars['Int']['input']>;
  sYearnPct_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  timestamp?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_gt?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_gte?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  timestamp_lt?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_lte?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_not?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  txHash?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_contains?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_gt?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_gte?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  txHash_lt?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_lte?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  yYearnPct?: InputMaybe<Scalars['Int']['input']>;
  yYearnPct_gt?: InputMaybe<Scalars['Int']['input']>;
  yYearnPct_gte?: InputMaybe<Scalars['Int']['input']>;
  yYearnPct_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  yYearnPct_lt?: InputMaybe<Scalars['Int']['input']>;
  yYearnPct_lte?: InputMaybe<Scalars['Int']['input']>;
  yYearnPct_not?: InputMaybe<Scalars['Int']['input']>;
  yYearnPct_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
};

export type Composition_OrderBy =
  | 'blockNumber'
  | 'id'
  | 'index'
  | 'pYearnPct'
  | 'sYearnPct'
  | 'timestamp'
  | 'txHash'
  | 'yYearnPct';

export type GoldenStarActivation = {
  __typename?: 'GoldenStarActivation';
  activatedAt: Scalars['BigInt']['output'];
  blockNumber: Scalars['BigInt']['output'];
  id: Scalars['ID']['output'];
  timestamp: Scalars['BigInt']['output'];
  txHash: Scalars['Bytes']['output'];
  user: User;
};

export type GoldenStarActivation_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  activatedAt?: InputMaybe<Scalars['BigInt']['input']>;
  activatedAt_gt?: InputMaybe<Scalars['BigInt']['input']>;
  activatedAt_gte?: InputMaybe<Scalars['BigInt']['input']>;
  activatedAt_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  activatedAt_lt?: InputMaybe<Scalars['BigInt']['input']>;
  activatedAt_lte?: InputMaybe<Scalars['BigInt']['input']>;
  activatedAt_not?: InputMaybe<Scalars['BigInt']['input']>;
  activatedAt_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  and?: InputMaybe<Array<InputMaybe<GoldenStarActivation_Filter>>>;
  blockNumber?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_gt?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_gte?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  blockNumber_lt?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_lte?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_not?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  or?: InputMaybe<Array<InputMaybe<GoldenStarActivation_Filter>>>;
  timestamp?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_gt?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_gte?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  timestamp_lt?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_lte?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_not?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  txHash?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_contains?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_gt?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_gte?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  txHash_lt?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_lte?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  user?: InputMaybe<Scalars['String']['input']>;
  user_?: InputMaybe<User_Filter>;
  user_contains?: InputMaybe<Scalars['String']['input']>;
  user_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  user_ends_with?: InputMaybe<Scalars['String']['input']>;
  user_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  user_gt?: InputMaybe<Scalars['String']['input']>;
  user_gte?: InputMaybe<Scalars['String']['input']>;
  user_in?: InputMaybe<Array<Scalars['String']['input']>>;
  user_lt?: InputMaybe<Scalars['String']['input']>;
  user_lte?: InputMaybe<Scalars['String']['input']>;
  user_not?: InputMaybe<Scalars['String']['input']>;
  user_not_contains?: InputMaybe<Scalars['String']['input']>;
  user_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  user_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  user_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  user_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  user_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  user_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  user_starts_with?: InputMaybe<Scalars['String']['input']>;
  user_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
};

export type GoldenStarActivation_OrderBy =
  | 'activatedAt'
  | 'blockNumber'
  | 'id'
  | 'timestamp'
  | 'txHash'
  | 'user'
  | 'user__goldenEarningsTotal'
  | 'user__goldenStarActivatedAt'
  | 'user__id'
  | 'user__isGoldenStar'
  | 'user__level'
  | 'user__starEarningsTotal'
  | 'user__totalStaked';

export type GoldenStarPayout = {
  __typename?: 'GoldenStarPayout';
  amount: Scalars['BigInt']['output'];
  blockNumber: Scalars['BigInt']['output'];
  id: Scalars['ID']['output'];
  kind: Scalars['String']['output'];
  timestamp: Scalars['BigInt']['output'];
  txHash: Scalars['Bytes']['output'];
  user: User;
};

export type GoldenStarPayout_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  amount?: InputMaybe<Scalars['BigInt']['input']>;
  amount_gt?: InputMaybe<Scalars['BigInt']['input']>;
  amount_gte?: InputMaybe<Scalars['BigInt']['input']>;
  amount_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  amount_lt?: InputMaybe<Scalars['BigInt']['input']>;
  amount_lte?: InputMaybe<Scalars['BigInt']['input']>;
  amount_not?: InputMaybe<Scalars['BigInt']['input']>;
  amount_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  and?: InputMaybe<Array<InputMaybe<GoldenStarPayout_Filter>>>;
  blockNumber?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_gt?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_gte?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  blockNumber_lt?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_lte?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_not?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  kind?: InputMaybe<Scalars['String']['input']>;
  kind_contains?: InputMaybe<Scalars['String']['input']>;
  kind_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  kind_ends_with?: InputMaybe<Scalars['String']['input']>;
  kind_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  kind_gt?: InputMaybe<Scalars['String']['input']>;
  kind_gte?: InputMaybe<Scalars['String']['input']>;
  kind_in?: InputMaybe<Array<Scalars['String']['input']>>;
  kind_lt?: InputMaybe<Scalars['String']['input']>;
  kind_lte?: InputMaybe<Scalars['String']['input']>;
  kind_not?: InputMaybe<Scalars['String']['input']>;
  kind_not_contains?: InputMaybe<Scalars['String']['input']>;
  kind_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  kind_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  kind_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  kind_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  kind_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  kind_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  kind_starts_with?: InputMaybe<Scalars['String']['input']>;
  kind_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  or?: InputMaybe<Array<InputMaybe<GoldenStarPayout_Filter>>>;
  timestamp?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_gt?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_gte?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  timestamp_lt?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_lte?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_not?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  txHash?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_contains?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_gt?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_gte?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  txHash_lt?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_lte?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  user?: InputMaybe<Scalars['String']['input']>;
  user_?: InputMaybe<User_Filter>;
  user_contains?: InputMaybe<Scalars['String']['input']>;
  user_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  user_ends_with?: InputMaybe<Scalars['String']['input']>;
  user_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  user_gt?: InputMaybe<Scalars['String']['input']>;
  user_gte?: InputMaybe<Scalars['String']['input']>;
  user_in?: InputMaybe<Array<Scalars['String']['input']>>;
  user_lt?: InputMaybe<Scalars['String']['input']>;
  user_lte?: InputMaybe<Scalars['String']['input']>;
  user_not?: InputMaybe<Scalars['String']['input']>;
  user_not_contains?: InputMaybe<Scalars['String']['input']>;
  user_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  user_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  user_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  user_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  user_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  user_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  user_starts_with?: InputMaybe<Scalars['String']['input']>;
  user_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
};

export type GoldenStarPayout_OrderBy =
  | 'amount'
  | 'blockNumber'
  | 'id'
  | 'kind'
  | 'timestamp'
  | 'txHash'
  | 'user'
  | 'user__goldenEarningsTotal'
  | 'user__goldenStarActivatedAt'
  | 'user__id'
  | 'user__isGoldenStar'
  | 'user__level'
  | 'user__starEarningsTotal'
  | 'user__totalStaked';

/** Defines the order direction, either ascending or descending */
export type OrderDirection =
  | 'asc'
  | 'desc';

export type Package = {
  __typename?: 'Package';
  aprBps: Scalars['Int']['output'];
  claimableInterval: Scalars['BigInt']['output'];
  createdAt: Scalars['BigInt']['output'];
  durationInDays: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  minStakeAmount: Scalars['BigInt']['output'];
  monthlyAPRClaimable: Scalars['Boolean']['output'];
  monthlyPrincipalReturnPercent: Scalars['Int']['output'];
  monthlyUnstake: Scalars['Boolean']['output'];
  packageId: Scalars['Int']['output'];
  principalLocked: Scalars['Boolean']['output'];
  stakeMultiple: Scalars['BigInt']['output'];
  txHash: Scalars['Bytes']['output'];
};

export type Package_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<Package_Filter>>>;
  aprBps?: InputMaybe<Scalars['Int']['input']>;
  aprBps_gt?: InputMaybe<Scalars['Int']['input']>;
  aprBps_gte?: InputMaybe<Scalars['Int']['input']>;
  aprBps_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  aprBps_lt?: InputMaybe<Scalars['Int']['input']>;
  aprBps_lte?: InputMaybe<Scalars['Int']['input']>;
  aprBps_not?: InputMaybe<Scalars['Int']['input']>;
  aprBps_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  claimableInterval?: InputMaybe<Scalars['BigInt']['input']>;
  claimableInterval_gt?: InputMaybe<Scalars['BigInt']['input']>;
  claimableInterval_gte?: InputMaybe<Scalars['BigInt']['input']>;
  claimableInterval_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  claimableInterval_lt?: InputMaybe<Scalars['BigInt']['input']>;
  claimableInterval_lte?: InputMaybe<Scalars['BigInt']['input']>;
  claimableInterval_not?: InputMaybe<Scalars['BigInt']['input']>;
  claimableInterval_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  createdAt?: InputMaybe<Scalars['BigInt']['input']>;
  createdAt_gt?: InputMaybe<Scalars['BigInt']['input']>;
  createdAt_gte?: InputMaybe<Scalars['BigInt']['input']>;
  createdAt_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  createdAt_lt?: InputMaybe<Scalars['BigInt']['input']>;
  createdAt_lte?: InputMaybe<Scalars['BigInt']['input']>;
  createdAt_not?: InputMaybe<Scalars['BigInt']['input']>;
  createdAt_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  durationInDays?: InputMaybe<Scalars['Int']['input']>;
  durationInDays_gt?: InputMaybe<Scalars['Int']['input']>;
  durationInDays_gte?: InputMaybe<Scalars['Int']['input']>;
  durationInDays_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  durationInDays_lt?: InputMaybe<Scalars['Int']['input']>;
  durationInDays_lte?: InputMaybe<Scalars['Int']['input']>;
  durationInDays_not?: InputMaybe<Scalars['Int']['input']>;
  durationInDays_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  isActive_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  isActive_not?: InputMaybe<Scalars['Boolean']['input']>;
  isActive_not_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  minStakeAmount?: InputMaybe<Scalars['BigInt']['input']>;
  minStakeAmount_gt?: InputMaybe<Scalars['BigInt']['input']>;
  minStakeAmount_gte?: InputMaybe<Scalars['BigInt']['input']>;
  minStakeAmount_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  minStakeAmount_lt?: InputMaybe<Scalars['BigInt']['input']>;
  minStakeAmount_lte?: InputMaybe<Scalars['BigInt']['input']>;
  minStakeAmount_not?: InputMaybe<Scalars['BigInt']['input']>;
  minStakeAmount_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  monthlyAPRClaimable?: InputMaybe<Scalars['Boolean']['input']>;
  monthlyAPRClaimable_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  monthlyAPRClaimable_not?: InputMaybe<Scalars['Boolean']['input']>;
  monthlyAPRClaimable_not_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  monthlyPrincipalReturnPercent?: InputMaybe<Scalars['Int']['input']>;
  monthlyPrincipalReturnPercent_gt?: InputMaybe<Scalars['Int']['input']>;
  monthlyPrincipalReturnPercent_gte?: InputMaybe<Scalars['Int']['input']>;
  monthlyPrincipalReturnPercent_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  monthlyPrincipalReturnPercent_lt?: InputMaybe<Scalars['Int']['input']>;
  monthlyPrincipalReturnPercent_lte?: InputMaybe<Scalars['Int']['input']>;
  monthlyPrincipalReturnPercent_not?: InputMaybe<Scalars['Int']['input']>;
  monthlyPrincipalReturnPercent_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  monthlyUnstake?: InputMaybe<Scalars['Boolean']['input']>;
  monthlyUnstake_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  monthlyUnstake_not?: InputMaybe<Scalars['Boolean']['input']>;
  monthlyUnstake_not_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  or?: InputMaybe<Array<InputMaybe<Package_Filter>>>;
  packageId?: InputMaybe<Scalars['Int']['input']>;
  packageId_gt?: InputMaybe<Scalars['Int']['input']>;
  packageId_gte?: InputMaybe<Scalars['Int']['input']>;
  packageId_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  packageId_lt?: InputMaybe<Scalars['Int']['input']>;
  packageId_lte?: InputMaybe<Scalars['Int']['input']>;
  packageId_not?: InputMaybe<Scalars['Int']['input']>;
  packageId_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  principalLocked?: InputMaybe<Scalars['Boolean']['input']>;
  principalLocked_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  principalLocked_not?: InputMaybe<Scalars['Boolean']['input']>;
  principalLocked_not_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  stakeMultiple?: InputMaybe<Scalars['BigInt']['input']>;
  stakeMultiple_gt?: InputMaybe<Scalars['BigInt']['input']>;
  stakeMultiple_gte?: InputMaybe<Scalars['BigInt']['input']>;
  stakeMultiple_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  stakeMultiple_lt?: InputMaybe<Scalars['BigInt']['input']>;
  stakeMultiple_lte?: InputMaybe<Scalars['BigInt']['input']>;
  stakeMultiple_not?: InputMaybe<Scalars['BigInt']['input']>;
  stakeMultiple_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  txHash?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_contains?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_gt?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_gte?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  txHash_lt?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_lte?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
};

export type Package_OrderBy =
  | 'aprBps'
  | 'claimableInterval'
  | 'createdAt'
  | 'durationInDays'
  | 'id'
  | 'isActive'
  | 'minStakeAmount'
  | 'monthlyAPRClaimable'
  | 'monthlyPrincipalReturnPercent'
  | 'monthlyUnstake'
  | 'packageId'
  | 'principalLocked'
  | 'stakeMultiple'
  | 'txHash';

export type Query = {
  __typename?: 'Query';
  /** Access to subgraph metadata */
  _meta?: Maybe<_Meta_>;
  aprclaim?: Maybe<AprClaim>;
  aprclaims: Array<AprClaim>;
  composition?: Maybe<Composition>;
  compositions: Array<Composition>;
  goldenStarActivation?: Maybe<GoldenStarActivation>;
  goldenStarActivations: Array<GoldenStarActivation>;
  goldenStarPayout?: Maybe<GoldenStarPayout>;
  goldenStarPayouts: Array<GoldenStarPayout>;
  package?: Maybe<Package>;
  packages: Array<Package>;
  referral?: Maybe<Referral>;
  referralEarning?: Maybe<ReferralEarning>;
  referralEarnings: Array<ReferralEarning>;
  referrals: Array<Referral>;
  stake?: Maybe<Stake>;
  stakes: Array<Stake>;
  starLevelChange?: Maybe<StarLevelChange>;
  starLevelChanges: Array<StarLevelChange>;
  starRewardPayout?: Maybe<StarRewardPayout>;
  starRewardPayouts: Array<StarRewardPayout>;
  unstake?: Maybe<Unstake>;
  unstakes: Array<Unstake>;
  user?: Maybe<User>;
  users: Array<User>;
};


export type Query_MetaArgs = {
  block?: InputMaybe<Block_Height>;
};


export type QueryAprclaimArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryAprclaimsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<AprClaim_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<AprClaim_Filter>;
};


export type QueryCompositionArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryCompositionsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Composition_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Composition_Filter>;
};


export type QueryGoldenStarActivationArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryGoldenStarActivationsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<GoldenStarActivation_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<GoldenStarActivation_Filter>;
};


export type QueryGoldenStarPayoutArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryGoldenStarPayoutsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<GoldenStarPayout_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<GoldenStarPayout_Filter>;
};


export type QueryPackageArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryPackagesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Package_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Package_Filter>;
};


export type QueryReferralArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryReferralEarningArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryReferralEarningsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<ReferralEarning_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<ReferralEarning_Filter>;
};


export type QueryReferralsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Referral_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Referral_Filter>;
};


export type QueryStakeArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryStakesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Stake_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Stake_Filter>;
};


export type QueryStarLevelChangeArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryStarLevelChangesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<StarLevelChange_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<StarLevelChange_Filter>;
};


export type QueryStarRewardPayoutArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryStarRewardPayoutsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<StarRewardPayout_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<StarRewardPayout_Filter>;
};


export type QueryUnstakeArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryUnstakesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Unstake_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Unstake_Filter>;
};


export type QueryUserArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryUsersArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<User_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<User_Filter>;
};

export type Referral = {
  __typename?: 'Referral';
  assignedAt: Scalars['BigInt']['output'];
  id: Scalars['ID']['output'];
  referee: User;
  referrer: User;
  txHash: Scalars['Bytes']['output'];
};

export type ReferralEarning = {
  __typename?: 'ReferralEarning';
  amount: Scalars['BigInt']['output'];
  blockNumber: Scalars['BigInt']['output'];
  id: Scalars['ID']['output'];
  level: Scalars['Int']['output'];
  timestamp: Scalars['BigInt']['output'];
  token: Scalars['Bytes']['output'];
  txHash: Scalars['Bytes']['output'];
  user: User;
};

export type ReferralEarning_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  amount?: InputMaybe<Scalars['BigInt']['input']>;
  amount_gt?: InputMaybe<Scalars['BigInt']['input']>;
  amount_gte?: InputMaybe<Scalars['BigInt']['input']>;
  amount_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  amount_lt?: InputMaybe<Scalars['BigInt']['input']>;
  amount_lte?: InputMaybe<Scalars['BigInt']['input']>;
  amount_not?: InputMaybe<Scalars['BigInt']['input']>;
  amount_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  and?: InputMaybe<Array<InputMaybe<ReferralEarning_Filter>>>;
  blockNumber?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_gt?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_gte?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  blockNumber_lt?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_lte?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_not?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  level?: InputMaybe<Scalars['Int']['input']>;
  level_gt?: InputMaybe<Scalars['Int']['input']>;
  level_gte?: InputMaybe<Scalars['Int']['input']>;
  level_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  level_lt?: InputMaybe<Scalars['Int']['input']>;
  level_lte?: InputMaybe<Scalars['Int']['input']>;
  level_not?: InputMaybe<Scalars['Int']['input']>;
  level_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  or?: InputMaybe<Array<InputMaybe<ReferralEarning_Filter>>>;
  timestamp?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_gt?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_gte?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  timestamp_lt?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_lte?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_not?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  token?: InputMaybe<Scalars['Bytes']['input']>;
  token_contains?: InputMaybe<Scalars['Bytes']['input']>;
  token_gt?: InputMaybe<Scalars['Bytes']['input']>;
  token_gte?: InputMaybe<Scalars['Bytes']['input']>;
  token_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  token_lt?: InputMaybe<Scalars['Bytes']['input']>;
  token_lte?: InputMaybe<Scalars['Bytes']['input']>;
  token_not?: InputMaybe<Scalars['Bytes']['input']>;
  token_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  token_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  txHash?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_contains?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_gt?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_gte?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  txHash_lt?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_lte?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  user?: InputMaybe<Scalars['String']['input']>;
  user_?: InputMaybe<User_Filter>;
  user_contains?: InputMaybe<Scalars['String']['input']>;
  user_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  user_ends_with?: InputMaybe<Scalars['String']['input']>;
  user_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  user_gt?: InputMaybe<Scalars['String']['input']>;
  user_gte?: InputMaybe<Scalars['String']['input']>;
  user_in?: InputMaybe<Array<Scalars['String']['input']>>;
  user_lt?: InputMaybe<Scalars['String']['input']>;
  user_lte?: InputMaybe<Scalars['String']['input']>;
  user_not?: InputMaybe<Scalars['String']['input']>;
  user_not_contains?: InputMaybe<Scalars['String']['input']>;
  user_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  user_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  user_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  user_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  user_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  user_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  user_starts_with?: InputMaybe<Scalars['String']['input']>;
  user_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
};

export type ReferralEarning_OrderBy =
  | 'amount'
  | 'blockNumber'
  | 'id'
  | 'level'
  | 'timestamp'
  | 'token'
  | 'txHash'
  | 'user'
  | 'user__goldenEarningsTotal'
  | 'user__goldenStarActivatedAt'
  | 'user__id'
  | 'user__isGoldenStar'
  | 'user__level'
  | 'user__starEarningsTotal'
  | 'user__totalStaked';

export type Referral_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<Referral_Filter>>>;
  assignedAt?: InputMaybe<Scalars['BigInt']['input']>;
  assignedAt_gt?: InputMaybe<Scalars['BigInt']['input']>;
  assignedAt_gte?: InputMaybe<Scalars['BigInt']['input']>;
  assignedAt_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  assignedAt_lt?: InputMaybe<Scalars['BigInt']['input']>;
  assignedAt_lte?: InputMaybe<Scalars['BigInt']['input']>;
  assignedAt_not?: InputMaybe<Scalars['BigInt']['input']>;
  assignedAt_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  or?: InputMaybe<Array<InputMaybe<Referral_Filter>>>;
  referee?: InputMaybe<Scalars['String']['input']>;
  referee_?: InputMaybe<User_Filter>;
  referee_contains?: InputMaybe<Scalars['String']['input']>;
  referee_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  referee_ends_with?: InputMaybe<Scalars['String']['input']>;
  referee_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  referee_gt?: InputMaybe<Scalars['String']['input']>;
  referee_gte?: InputMaybe<Scalars['String']['input']>;
  referee_in?: InputMaybe<Array<Scalars['String']['input']>>;
  referee_lt?: InputMaybe<Scalars['String']['input']>;
  referee_lte?: InputMaybe<Scalars['String']['input']>;
  referee_not?: InputMaybe<Scalars['String']['input']>;
  referee_not_contains?: InputMaybe<Scalars['String']['input']>;
  referee_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  referee_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  referee_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  referee_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  referee_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  referee_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  referee_starts_with?: InputMaybe<Scalars['String']['input']>;
  referee_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  referrer?: InputMaybe<Scalars['String']['input']>;
  referrer_?: InputMaybe<User_Filter>;
  referrer_contains?: InputMaybe<Scalars['String']['input']>;
  referrer_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  referrer_ends_with?: InputMaybe<Scalars['String']['input']>;
  referrer_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  referrer_gt?: InputMaybe<Scalars['String']['input']>;
  referrer_gte?: InputMaybe<Scalars['String']['input']>;
  referrer_in?: InputMaybe<Array<Scalars['String']['input']>>;
  referrer_lt?: InputMaybe<Scalars['String']['input']>;
  referrer_lte?: InputMaybe<Scalars['String']['input']>;
  referrer_not?: InputMaybe<Scalars['String']['input']>;
  referrer_not_contains?: InputMaybe<Scalars['String']['input']>;
  referrer_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  referrer_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  referrer_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  referrer_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  referrer_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  referrer_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  referrer_starts_with?: InputMaybe<Scalars['String']['input']>;
  referrer_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  txHash?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_contains?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_gt?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_gte?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  txHash_lt?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_lte?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
};

export type Referral_OrderBy =
  | 'assignedAt'
  | 'id'
  | 'referee'
  | 'referee__goldenEarningsTotal'
  | 'referee__goldenStarActivatedAt'
  | 'referee__id'
  | 'referee__isGoldenStar'
  | 'referee__level'
  | 'referee__starEarningsTotal'
  | 'referee__totalStaked'
  | 'referrer'
  | 'referrer__goldenEarningsTotal'
  | 'referrer__goldenStarActivatedAt'
  | 'referrer__id'
  | 'referrer__isGoldenStar'
  | 'referrer__level'
  | 'referrer__starEarningsTotal'
  | 'referrer__totalStaked'
  | 'txHash';

export type Stake = {
  __typename?: 'Stake';
  blockNumber: Scalars['BigInt']['output'];
  claimedAPR: Scalars['BigInt']['output'];
  id: Scalars['ID']['output'];
  isFullyUnstaked: Scalars['Boolean']['output'];
  lastClaimedAt: Scalars['BigInt']['output'];
  lastUnstakedAt: Scalars['BigInt']['output'];
  packageId: Scalars['Int']['output'];
  startTime: Scalars['BigInt']['output'];
  timestamp: Scalars['BigInt']['output'];
  totalStaked: Scalars['BigInt']['output'];
  txHash: Scalars['Bytes']['output'];
  user: User;
  withdrawnPrincipal: Scalars['BigInt']['output'];
};

export type Stake_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<Stake_Filter>>>;
  blockNumber?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_gt?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_gte?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  blockNumber_lt?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_lte?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_not?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  claimedAPR?: InputMaybe<Scalars['BigInt']['input']>;
  claimedAPR_gt?: InputMaybe<Scalars['BigInt']['input']>;
  claimedAPR_gte?: InputMaybe<Scalars['BigInt']['input']>;
  claimedAPR_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  claimedAPR_lt?: InputMaybe<Scalars['BigInt']['input']>;
  claimedAPR_lte?: InputMaybe<Scalars['BigInt']['input']>;
  claimedAPR_not?: InputMaybe<Scalars['BigInt']['input']>;
  claimedAPR_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  isFullyUnstaked?: InputMaybe<Scalars['Boolean']['input']>;
  isFullyUnstaked_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  isFullyUnstaked_not?: InputMaybe<Scalars['Boolean']['input']>;
  isFullyUnstaked_not_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  lastClaimedAt?: InputMaybe<Scalars['BigInt']['input']>;
  lastClaimedAt_gt?: InputMaybe<Scalars['BigInt']['input']>;
  lastClaimedAt_gte?: InputMaybe<Scalars['BigInt']['input']>;
  lastClaimedAt_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  lastClaimedAt_lt?: InputMaybe<Scalars['BigInt']['input']>;
  lastClaimedAt_lte?: InputMaybe<Scalars['BigInt']['input']>;
  lastClaimedAt_not?: InputMaybe<Scalars['BigInt']['input']>;
  lastClaimedAt_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  lastUnstakedAt?: InputMaybe<Scalars['BigInt']['input']>;
  lastUnstakedAt_gt?: InputMaybe<Scalars['BigInt']['input']>;
  lastUnstakedAt_gte?: InputMaybe<Scalars['BigInt']['input']>;
  lastUnstakedAt_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  lastUnstakedAt_lt?: InputMaybe<Scalars['BigInt']['input']>;
  lastUnstakedAt_lte?: InputMaybe<Scalars['BigInt']['input']>;
  lastUnstakedAt_not?: InputMaybe<Scalars['BigInt']['input']>;
  lastUnstakedAt_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  or?: InputMaybe<Array<InputMaybe<Stake_Filter>>>;
  packageId?: InputMaybe<Scalars['Int']['input']>;
  packageId_gt?: InputMaybe<Scalars['Int']['input']>;
  packageId_gte?: InputMaybe<Scalars['Int']['input']>;
  packageId_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  packageId_lt?: InputMaybe<Scalars['Int']['input']>;
  packageId_lte?: InputMaybe<Scalars['Int']['input']>;
  packageId_not?: InputMaybe<Scalars['Int']['input']>;
  packageId_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  startTime?: InputMaybe<Scalars['BigInt']['input']>;
  startTime_gt?: InputMaybe<Scalars['BigInt']['input']>;
  startTime_gte?: InputMaybe<Scalars['BigInt']['input']>;
  startTime_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  startTime_lt?: InputMaybe<Scalars['BigInt']['input']>;
  startTime_lte?: InputMaybe<Scalars['BigInt']['input']>;
  startTime_not?: InputMaybe<Scalars['BigInt']['input']>;
  startTime_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  timestamp?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_gt?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_gte?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  timestamp_lt?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_lte?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_not?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  totalStaked?: InputMaybe<Scalars['BigInt']['input']>;
  totalStaked_gt?: InputMaybe<Scalars['BigInt']['input']>;
  totalStaked_gte?: InputMaybe<Scalars['BigInt']['input']>;
  totalStaked_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  totalStaked_lt?: InputMaybe<Scalars['BigInt']['input']>;
  totalStaked_lte?: InputMaybe<Scalars['BigInt']['input']>;
  totalStaked_not?: InputMaybe<Scalars['BigInt']['input']>;
  totalStaked_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  txHash?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_contains?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_gt?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_gte?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  txHash_lt?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_lte?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  user?: InputMaybe<Scalars['String']['input']>;
  user_?: InputMaybe<User_Filter>;
  user_contains?: InputMaybe<Scalars['String']['input']>;
  user_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  user_ends_with?: InputMaybe<Scalars['String']['input']>;
  user_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  user_gt?: InputMaybe<Scalars['String']['input']>;
  user_gte?: InputMaybe<Scalars['String']['input']>;
  user_in?: InputMaybe<Array<Scalars['String']['input']>>;
  user_lt?: InputMaybe<Scalars['String']['input']>;
  user_lte?: InputMaybe<Scalars['String']['input']>;
  user_not?: InputMaybe<Scalars['String']['input']>;
  user_not_contains?: InputMaybe<Scalars['String']['input']>;
  user_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  user_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  user_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  user_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  user_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  user_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  user_starts_with?: InputMaybe<Scalars['String']['input']>;
  user_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  withdrawnPrincipal?: InputMaybe<Scalars['BigInt']['input']>;
  withdrawnPrincipal_gt?: InputMaybe<Scalars['BigInt']['input']>;
  withdrawnPrincipal_gte?: InputMaybe<Scalars['BigInt']['input']>;
  withdrawnPrincipal_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  withdrawnPrincipal_lt?: InputMaybe<Scalars['BigInt']['input']>;
  withdrawnPrincipal_lte?: InputMaybe<Scalars['BigInt']['input']>;
  withdrawnPrincipal_not?: InputMaybe<Scalars['BigInt']['input']>;
  withdrawnPrincipal_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
};

export type Stake_OrderBy =
  | 'blockNumber'
  | 'claimedAPR'
  | 'id'
  | 'isFullyUnstaked'
  | 'lastClaimedAt'
  | 'lastUnstakedAt'
  | 'packageId'
  | 'startTime'
  | 'timestamp'
  | 'totalStaked'
  | 'txHash'
  | 'user'
  | 'user__goldenEarningsTotal'
  | 'user__goldenStarActivatedAt'
  | 'user__id'
  | 'user__isGoldenStar'
  | 'user__level'
  | 'user__starEarningsTotal'
  | 'user__totalStaked'
  | 'withdrawnPrincipal';

export type StarLevelChange = {
  __typename?: 'StarLevelChange';
  blockNumber: Scalars['BigInt']['output'];
  id: Scalars['ID']['output'];
  newLevel: Scalars['Int']['output'];
  timestamp: Scalars['BigInt']['output'];
  txHash: Scalars['Bytes']['output'];
  user: User;
};

export type StarLevelChange_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<StarLevelChange_Filter>>>;
  blockNumber?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_gt?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_gte?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  blockNumber_lt?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_lte?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_not?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  newLevel?: InputMaybe<Scalars['Int']['input']>;
  newLevel_gt?: InputMaybe<Scalars['Int']['input']>;
  newLevel_gte?: InputMaybe<Scalars['Int']['input']>;
  newLevel_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  newLevel_lt?: InputMaybe<Scalars['Int']['input']>;
  newLevel_lte?: InputMaybe<Scalars['Int']['input']>;
  newLevel_not?: InputMaybe<Scalars['Int']['input']>;
  newLevel_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  or?: InputMaybe<Array<InputMaybe<StarLevelChange_Filter>>>;
  timestamp?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_gt?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_gte?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  timestamp_lt?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_lte?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_not?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  txHash?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_contains?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_gt?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_gte?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  txHash_lt?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_lte?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  user?: InputMaybe<Scalars['String']['input']>;
  user_?: InputMaybe<User_Filter>;
  user_contains?: InputMaybe<Scalars['String']['input']>;
  user_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  user_ends_with?: InputMaybe<Scalars['String']['input']>;
  user_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  user_gt?: InputMaybe<Scalars['String']['input']>;
  user_gte?: InputMaybe<Scalars['String']['input']>;
  user_in?: InputMaybe<Array<Scalars['String']['input']>>;
  user_lt?: InputMaybe<Scalars['String']['input']>;
  user_lte?: InputMaybe<Scalars['String']['input']>;
  user_not?: InputMaybe<Scalars['String']['input']>;
  user_not_contains?: InputMaybe<Scalars['String']['input']>;
  user_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  user_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  user_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  user_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  user_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  user_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  user_starts_with?: InputMaybe<Scalars['String']['input']>;
  user_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
};

export type StarLevelChange_OrderBy =
  | 'blockNumber'
  | 'id'
  | 'newLevel'
  | 'timestamp'
  | 'txHash'
  | 'user'
  | 'user__goldenEarningsTotal'
  | 'user__goldenStarActivatedAt'
  | 'user__id'
  | 'user__isGoldenStar'
  | 'user__level'
  | 'user__starEarningsTotal'
  | 'user__totalStaked';

export type StarRewardPayout = {
  __typename?: 'StarRewardPayout';
  amount: Scalars['BigInt']['output'];
  blockNumber: Scalars['BigInt']['output'];
  id: Scalars['ID']['output'];
  kind: Scalars['String']['output'];
  level: Scalars['Int']['output'];
  timestamp: Scalars['BigInt']['output'];
  txHash: Scalars['Bytes']['output'];
  user: User;
};

export type StarRewardPayout_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  amount?: InputMaybe<Scalars['BigInt']['input']>;
  amount_gt?: InputMaybe<Scalars['BigInt']['input']>;
  amount_gte?: InputMaybe<Scalars['BigInt']['input']>;
  amount_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  amount_lt?: InputMaybe<Scalars['BigInt']['input']>;
  amount_lte?: InputMaybe<Scalars['BigInt']['input']>;
  amount_not?: InputMaybe<Scalars['BigInt']['input']>;
  amount_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  and?: InputMaybe<Array<InputMaybe<StarRewardPayout_Filter>>>;
  blockNumber?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_gt?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_gte?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  blockNumber_lt?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_lte?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_not?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  kind?: InputMaybe<Scalars['String']['input']>;
  kind_contains?: InputMaybe<Scalars['String']['input']>;
  kind_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  kind_ends_with?: InputMaybe<Scalars['String']['input']>;
  kind_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  kind_gt?: InputMaybe<Scalars['String']['input']>;
  kind_gte?: InputMaybe<Scalars['String']['input']>;
  kind_in?: InputMaybe<Array<Scalars['String']['input']>>;
  kind_lt?: InputMaybe<Scalars['String']['input']>;
  kind_lte?: InputMaybe<Scalars['String']['input']>;
  kind_not?: InputMaybe<Scalars['String']['input']>;
  kind_not_contains?: InputMaybe<Scalars['String']['input']>;
  kind_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  kind_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  kind_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  kind_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  kind_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  kind_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  kind_starts_with?: InputMaybe<Scalars['String']['input']>;
  kind_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  level?: InputMaybe<Scalars['Int']['input']>;
  level_gt?: InputMaybe<Scalars['Int']['input']>;
  level_gte?: InputMaybe<Scalars['Int']['input']>;
  level_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  level_lt?: InputMaybe<Scalars['Int']['input']>;
  level_lte?: InputMaybe<Scalars['Int']['input']>;
  level_not?: InputMaybe<Scalars['Int']['input']>;
  level_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  or?: InputMaybe<Array<InputMaybe<StarRewardPayout_Filter>>>;
  timestamp?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_gt?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_gte?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  timestamp_lt?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_lte?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_not?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  txHash?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_contains?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_gt?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_gte?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  txHash_lt?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_lte?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  user?: InputMaybe<Scalars['String']['input']>;
  user_?: InputMaybe<User_Filter>;
  user_contains?: InputMaybe<Scalars['String']['input']>;
  user_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  user_ends_with?: InputMaybe<Scalars['String']['input']>;
  user_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  user_gt?: InputMaybe<Scalars['String']['input']>;
  user_gte?: InputMaybe<Scalars['String']['input']>;
  user_in?: InputMaybe<Array<Scalars['String']['input']>>;
  user_lt?: InputMaybe<Scalars['String']['input']>;
  user_lte?: InputMaybe<Scalars['String']['input']>;
  user_not?: InputMaybe<Scalars['String']['input']>;
  user_not_contains?: InputMaybe<Scalars['String']['input']>;
  user_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  user_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  user_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  user_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  user_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  user_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  user_starts_with?: InputMaybe<Scalars['String']['input']>;
  user_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
};

export type StarRewardPayout_OrderBy =
  | 'amount'
  | 'blockNumber'
  | 'id'
  | 'kind'
  | 'level'
  | 'timestamp'
  | 'txHash'
  | 'user'
  | 'user__goldenEarningsTotal'
  | 'user__goldenStarActivatedAt'
  | 'user__id'
  | 'user__isGoldenStar'
  | 'user__level'
  | 'user__starEarningsTotal'
  | 'user__totalStaked';

export type Unstake = {
  __typename?: 'Unstake';
  amount: Scalars['BigInt']['output'];
  blockNumber: Scalars['BigInt']['output'];
  id: Scalars['ID']['output'];
  stakeId: Scalars['ID']['output'];
  timestamp: Scalars['BigInt']['output'];
  txHash: Scalars['Bytes']['output'];
  user: User;
};

export type Unstake_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  amount?: InputMaybe<Scalars['BigInt']['input']>;
  amount_gt?: InputMaybe<Scalars['BigInt']['input']>;
  amount_gte?: InputMaybe<Scalars['BigInt']['input']>;
  amount_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  amount_lt?: InputMaybe<Scalars['BigInt']['input']>;
  amount_lte?: InputMaybe<Scalars['BigInt']['input']>;
  amount_not?: InputMaybe<Scalars['BigInt']['input']>;
  amount_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  and?: InputMaybe<Array<InputMaybe<Unstake_Filter>>>;
  blockNumber?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_gt?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_gte?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  blockNumber_lt?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_lte?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_not?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  or?: InputMaybe<Array<InputMaybe<Unstake_Filter>>>;
  stakeId?: InputMaybe<Scalars['ID']['input']>;
  stakeId_gt?: InputMaybe<Scalars['ID']['input']>;
  stakeId_gte?: InputMaybe<Scalars['ID']['input']>;
  stakeId_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  stakeId_lt?: InputMaybe<Scalars['ID']['input']>;
  stakeId_lte?: InputMaybe<Scalars['ID']['input']>;
  stakeId_not?: InputMaybe<Scalars['ID']['input']>;
  stakeId_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  timestamp?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_gt?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_gte?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  timestamp_lt?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_lte?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_not?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  txHash?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_contains?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_gt?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_gte?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  txHash_lt?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_lte?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  txHash_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  user?: InputMaybe<Scalars['String']['input']>;
  user_?: InputMaybe<User_Filter>;
  user_contains?: InputMaybe<Scalars['String']['input']>;
  user_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  user_ends_with?: InputMaybe<Scalars['String']['input']>;
  user_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  user_gt?: InputMaybe<Scalars['String']['input']>;
  user_gte?: InputMaybe<Scalars['String']['input']>;
  user_in?: InputMaybe<Array<Scalars['String']['input']>>;
  user_lt?: InputMaybe<Scalars['String']['input']>;
  user_lte?: InputMaybe<Scalars['String']['input']>;
  user_not?: InputMaybe<Scalars['String']['input']>;
  user_not_contains?: InputMaybe<Scalars['String']['input']>;
  user_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  user_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  user_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  user_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  user_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  user_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  user_starts_with?: InputMaybe<Scalars['String']['input']>;
  user_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
};

export type Unstake_OrderBy =
  | 'amount'
  | 'blockNumber'
  | 'id'
  | 'stakeId'
  | 'timestamp'
  | 'txHash'
  | 'user'
  | 'user__goldenEarningsTotal'
  | 'user__goldenStarActivatedAt'
  | 'user__id'
  | 'user__isGoldenStar'
  | 'user__level'
  | 'user__starEarningsTotal'
  | 'user__totalStaked';

export type User = {
  __typename?: 'User';
  goldenEarningsTotal: Scalars['BigInt']['output'];
  goldenStarActivatedAt?: Maybe<Scalars['BigInt']['output']>;
  id: Scalars['ID']['output'];
  isGoldenStar: Scalars['Boolean']['output'];
  level: Scalars['Int']['output'];
  referrer?: Maybe<User>;
  starEarningsTotal: Scalars['BigInt']['output'];
  totalStaked: Scalars['BigInt']['output'];
};

export type User_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<User_Filter>>>;
  goldenEarningsTotal?: InputMaybe<Scalars['BigInt']['input']>;
  goldenEarningsTotal_gt?: InputMaybe<Scalars['BigInt']['input']>;
  goldenEarningsTotal_gte?: InputMaybe<Scalars['BigInt']['input']>;
  goldenEarningsTotal_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  goldenEarningsTotal_lt?: InputMaybe<Scalars['BigInt']['input']>;
  goldenEarningsTotal_lte?: InputMaybe<Scalars['BigInt']['input']>;
  goldenEarningsTotal_not?: InputMaybe<Scalars['BigInt']['input']>;
  goldenEarningsTotal_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  goldenStarActivatedAt?: InputMaybe<Scalars['BigInt']['input']>;
  goldenStarActivatedAt_gt?: InputMaybe<Scalars['BigInt']['input']>;
  goldenStarActivatedAt_gte?: InputMaybe<Scalars['BigInt']['input']>;
  goldenStarActivatedAt_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  goldenStarActivatedAt_lt?: InputMaybe<Scalars['BigInt']['input']>;
  goldenStarActivatedAt_lte?: InputMaybe<Scalars['BigInt']['input']>;
  goldenStarActivatedAt_not?: InputMaybe<Scalars['BigInt']['input']>;
  goldenStarActivatedAt_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  isGoldenStar?: InputMaybe<Scalars['Boolean']['input']>;
  isGoldenStar_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  isGoldenStar_not?: InputMaybe<Scalars['Boolean']['input']>;
  isGoldenStar_not_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  level?: InputMaybe<Scalars['Int']['input']>;
  level_gt?: InputMaybe<Scalars['Int']['input']>;
  level_gte?: InputMaybe<Scalars['Int']['input']>;
  level_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  level_lt?: InputMaybe<Scalars['Int']['input']>;
  level_lte?: InputMaybe<Scalars['Int']['input']>;
  level_not?: InputMaybe<Scalars['Int']['input']>;
  level_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  or?: InputMaybe<Array<InputMaybe<User_Filter>>>;
  referrer?: InputMaybe<Scalars['String']['input']>;
  referrer_?: InputMaybe<User_Filter>;
  referrer_contains?: InputMaybe<Scalars['String']['input']>;
  referrer_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  referrer_ends_with?: InputMaybe<Scalars['String']['input']>;
  referrer_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  referrer_gt?: InputMaybe<Scalars['String']['input']>;
  referrer_gte?: InputMaybe<Scalars['String']['input']>;
  referrer_in?: InputMaybe<Array<Scalars['String']['input']>>;
  referrer_lt?: InputMaybe<Scalars['String']['input']>;
  referrer_lte?: InputMaybe<Scalars['String']['input']>;
  referrer_not?: InputMaybe<Scalars['String']['input']>;
  referrer_not_contains?: InputMaybe<Scalars['String']['input']>;
  referrer_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  referrer_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  referrer_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  referrer_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  referrer_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  referrer_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  referrer_starts_with?: InputMaybe<Scalars['String']['input']>;
  referrer_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  starEarningsTotal?: InputMaybe<Scalars['BigInt']['input']>;
  starEarningsTotal_gt?: InputMaybe<Scalars['BigInt']['input']>;
  starEarningsTotal_gte?: InputMaybe<Scalars['BigInt']['input']>;
  starEarningsTotal_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  starEarningsTotal_lt?: InputMaybe<Scalars['BigInt']['input']>;
  starEarningsTotal_lte?: InputMaybe<Scalars['BigInt']['input']>;
  starEarningsTotal_not?: InputMaybe<Scalars['BigInt']['input']>;
  starEarningsTotal_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  totalStaked?: InputMaybe<Scalars['BigInt']['input']>;
  totalStaked_gt?: InputMaybe<Scalars['BigInt']['input']>;
  totalStaked_gte?: InputMaybe<Scalars['BigInt']['input']>;
  totalStaked_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  totalStaked_lt?: InputMaybe<Scalars['BigInt']['input']>;
  totalStaked_lte?: InputMaybe<Scalars['BigInt']['input']>;
  totalStaked_not?: InputMaybe<Scalars['BigInt']['input']>;
  totalStaked_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
};

export type User_OrderBy =
  | 'goldenEarningsTotal'
  | 'goldenStarActivatedAt'
  | 'id'
  | 'isGoldenStar'
  | 'level'
  | 'referrer'
  | 'referrer__goldenEarningsTotal'
  | 'referrer__goldenStarActivatedAt'
  | 'referrer__id'
  | 'referrer__isGoldenStar'
  | 'referrer__level'
  | 'referrer__starEarningsTotal'
  | 'referrer__totalStaked'
  | 'starEarningsTotal'
  | 'totalStaked';

export type _Block_ = {
  __typename?: '_Block_';
  /** The hash of the block */
  hash?: Maybe<Scalars['Bytes']['output']>;
  /** The block number */
  number: Scalars['Int']['output'];
  /** The hash of the parent block */
  parentHash?: Maybe<Scalars['Bytes']['output']>;
  /** Integer representation of the timestamp stored in blocks for the chain */
  timestamp?: Maybe<Scalars['Int']['output']>;
};

/** The type for the top-level _meta field */
export type _Meta_ = {
  __typename?: '_Meta_';
  /**
   * Information about a specific subgraph block. The hash of the block
   * will be null if the _meta field has a block constraint that asks for
   * a block number. It will be filled if the _meta field has no block constraint
   * and therefore asks for the latest  block
   *
   */
  block: _Block_;
  /** The deployment ID */
  deployment: Scalars['String']['output'];
  /** If `true`, the subgraph encountered indexing errors at some past block */
  hasIndexingErrors: Scalars['Boolean']['output'];
};

export type _SubgraphErrorPolicy_ =
  /** Data will be returned even if the subgraph has indexing errors */
  | 'allow'
  /** If the subgraph has indexing errors, data will be omitted. The default. */
  | 'deny';

export type ActivePackagesQueryVariables = Exact<{
  first?: InputMaybe<Scalars['Int']['input']>;
}>;


export type ActivePackagesQuery = { __typename?: 'Query', packages: Array<{ __typename?: 'Package', id: string, packageId: number, durationInDays: number, aprBps: number, isActive: boolean, minStakeAmount: any, claimableInterval: any, createdAt: any }> };

export type ActivePackagesLegacyQueryVariables = Exact<{
  first?: InputMaybe<Scalars['Int']['input']>;
}>;


export type ActivePackagesLegacyQuery = { __typename?: 'Query', packages: Array<{ __typename?: 'Package', id: string, packageId: number, durationInDays: number, aprBps: number, isActive: boolean, minStakeAmount: any, claimableInterval: any, createdAt: any }> };

export type GetUserStakesQueryVariables = Exact<{
  user: Scalars['String']['input'];
  first?: InputMaybe<Scalars['Int']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetUserStakesQuery = { __typename?: 'Query', stakes: Array<{ __typename?: 'Stake', id: string, packageId: number, timestamp: any, user: { __typename?: 'User', id: string } }>, unstakes: Array<{ __typename?: 'Unstake', id: string, stakeId: string, timestamp: any, user: { __typename?: 'User', id: string } }> };

export type GetMultipleUserStakesQueryVariables = Exact<{
  users: Array<Scalars['String']['input']> | Scalars['String']['input'];
  first?: InputMaybe<Scalars['Int']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetMultipleUserStakesQuery = { __typename?: 'Query', stakes: Array<{ __typename?: 'Stake', id: string, packageId: number, timestamp: any, user: { __typename?: 'User', id: string } }> };

export type GetUserUnstakesQueryVariables = Exact<{
  user: Scalars['String']['input'];
  first?: InputMaybe<Scalars['Int']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetUserUnstakesQuery = { __typename?: 'Query', unstakes: Array<{ __typename?: 'Unstake', id: string, stakeId: string, timestamp: any, user: { __typename?: 'User', id: string } }> };

export type GetUserAprClaimsQueryVariables = Exact<{
  user: Scalars['String']['input'];
  first?: InputMaybe<Scalars['Int']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetUserAprClaimsQuery = { __typename?: 'Query', aprclaims: Array<{ __typename?: 'APRClaim', id: string, stakeId: string, packageId: number, timestamp: any, user: { __typename?: 'User', id: string } }> };

export type GetAprClaimsByPackageQueryVariables = Exact<{
  packageId: Scalars['Int']['input'];
  first?: InputMaybe<Scalars['Int']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetAprClaimsByPackageQuery = { __typename?: 'Query', aprclaims: Array<{ __typename?: 'APRClaim', id: string, stakeId: string, packageId: number, timestamp: any, user: { __typename?: 'User', id: string } }> };

export type GetPackagesQueryVariables = Exact<{
  where?: InputMaybe<Package_Filter>;
  first?: InputMaybe<Scalars['Int']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetPackagesQuery = { __typename?: 'Query', packages: Array<{ __typename?: 'Package', id: string, packageId: number, durationInDays: number, isActive: boolean, monthlyUnstake: boolean, monthlyAPRClaimable: boolean, monthlyPrincipalReturnPercent: number, minStakeAmount: any, claimableInterval: any, stakeMultiple: any, principalLocked: boolean }> };

export type GetPackageByIdQueryVariables = Exact<{
  packageId: Scalars['Int']['input'];
}>;


export type GetPackageByIdQuery = { __typename?: 'Query', packages: Array<{ __typename?: 'Package', id: string, packageId: number, durationInDays: number, isActive: boolean, monthlyUnstake: boolean, monthlyAPRClaimable: boolean, monthlyPrincipalReturnPercent: number, minStakeAmount: any, claimableInterval: any, stakeMultiple: any, principalLocked: boolean }> };

export type GetUserStarLevelChangesQueryVariables = Exact<{
  user: Scalars['String']['input'];
  first?: InputMaybe<Scalars['Int']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetUserStarLevelChangesQuery = { __typename?: 'Query', starLevelChanges: Array<{ __typename?: 'StarLevelChange', id: string, newLevel: number, timestamp: any, user: { __typename?: 'User', id: string } }> };

export type GetUserStarRewardPayoutsQueryVariables = Exact<{
  user: Scalars['String']['input'];
  first?: InputMaybe<Scalars['Int']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetUserStarRewardPayoutsQuery = { __typename?: 'Query', starRewardPayouts: Array<{ __typename?: 'StarRewardPayout', id: string, level: number, amount: any, timestamp: any, user: { __typename?: 'User', id: string } }> };

export type GetUserGoldenStarActivationsQueryVariables = Exact<{
  user: Scalars['String']['input'];
  first?: InputMaybe<Scalars['Int']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetUserGoldenStarActivationsQuery = { __typename?: 'Query', goldenStarActivations: Array<{ __typename?: 'GoldenStarActivation', id: string, activatedAt: any, timestamp: any, user: { __typename?: 'User', id: string } }> };

export type GetUserGoldenStarPayoutsQueryVariables = Exact<{
  user: Scalars['String']['input'];
  first?: InputMaybe<Scalars['Int']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetUserGoldenStarPayoutsQuery = { __typename?: 'Query', goldenStarPayouts: Array<{ __typename?: 'GoldenStarPayout', id: string, amount: any, timestamp: any, user: { __typename?: 'User', id: string } }> };

export type GetReferralEarningsQueryVariables = Exact<{
  user: Scalars['String']['input'];
  first?: InputMaybe<Scalars['Int']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetReferralEarningsQuery = { __typename?: 'Query', referralEarnings: Array<{ __typename?: 'ReferralEarning', id: string, level: number, amount: any, timestamp: any, user: { __typename?: 'User', id: string } }> };

export type GetUserDashboardDataQueryVariables = Exact<{
  user: Scalars['String']['input'];
}>;


export type GetUserDashboardDataQuery = { __typename?: 'Query', stakes: Array<{ __typename?: 'Stake', id: string, packageId: number, timestamp: any }>, unstakes: Array<{ __typename?: 'Unstake', id: string, stakeId: string, timestamp: any }>, aprclaims: Array<{ __typename?: 'APRClaim', id: string, stakeId: string, packageId: number, timestamp: any }>, starLevelChanges: Array<{ __typename?: 'StarLevelChange', id: string, newLevel: number, timestamp: any }>, starRewardPayouts: Array<{ __typename?: 'StarRewardPayout', id: string, level: number, amount: any, timestamp: any }>, goldenStarActivations: Array<{ __typename?: 'GoldenStarActivation', id: string, activatedAt: any, timestamp: any }> };

export type GetSystemAnalyticsQueryVariables = Exact<{
  first?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetSystemAnalyticsQuery = { __typename?: 'Query', totalStakes: Array<{ __typename?: 'Stake', id: string, timestamp: any }>, totalUnstakes: Array<{ __typename?: 'Unstake', id: string, timestamp: any }>, totalAprClaims: Array<{ __typename?: 'APRClaim', id: string, timestamp: any }>, starLevelUpgrades: Array<{ __typename?: 'StarLevelChange', id: string, newLevel: number, timestamp: any }>, starRewardPayouts: Array<{ __typename?: 'StarRewardPayout', id: string, amount: any, level: number, timestamp: any }>, goldenStarActivations: Array<{ __typename?: 'GoldenStarActivation', id: string, activatedAt: any, timestamp: any }> };

export type GetEventsByDateRangeQueryVariables = Exact<{
  start: Scalars['BigInt']['input'];
  end: Scalars['BigInt']['input'];
  user?: InputMaybe<Scalars['String']['input']>;
}>;


export type GetEventsByDateRangeQuery = { __typename?: 'Query', stakes: Array<{ __typename?: 'Stake', id: string, packageId: number, timestamp: any, user: { __typename?: 'User', id: string } }>, unstakes: Array<{ __typename?: 'Unstake', id: string, stakeId: string, timestamp: any, user: { __typename?: 'User', id: string } }>, aprclaims: Array<{ __typename?: 'APRClaim', id: string, stakeId: string, packageId: number, timestamp: any, user: { __typename?: 'User', id: string } }> };

export type GetPackageStakesQueryVariables = Exact<{
  packageId: Scalars['Int']['input'];
  first?: InputMaybe<Scalars['Int']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetPackageStakesQuery = { __typename?: 'Query', stakes: Array<{ __typename?: 'Stake', id: string, packageId: number, timestamp: any, user: { __typename?: 'User', id: string } }> };

export type GetLevelRewardPayoutsQueryVariables = Exact<{
  level: Scalars['Int']['input'];
  first?: InputMaybe<Scalars['Int']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetLevelRewardPayoutsQuery = { __typename?: 'Query', starRewardPayouts: Array<{ __typename?: 'StarRewardPayout', id: string, level: number, amount: any, timestamp: any, user: { __typename?: 'User', id: string } }> };

export type GetReferrerAssignmentsQueryVariables = Exact<{
  referrer: Scalars['String']['input'];
  first?: InputMaybe<Scalars['Int']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetReferrerAssignmentsQuery = { __typename?: 'Query', referralAssigneds: Array<{ __typename?: 'ReferralEarning', id: string, level: number, amount: any, timestamp: any, referrer: { __typename?: 'User', id: string } }> };

export type GetUserAllRewardsQueryVariables = Exact<{
  user: Scalars['String']['input'];
  first?: InputMaybe<Scalars['Int']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GetUserAllRewardsQuery = { __typename?: 'Query', goldenStarRewardClaimeds: Array<{ __typename?: 'GoldenStarPayout', id: string, amount: any, timestamp: any, user: { __typename?: 'User', id: string } }>, referralRewardsClaimeds: Array<{ __typename?: 'ReferralEarning', id: string, level: number, amount: any, timestamp: any, user: { __typename?: 'User', id: string } }>, starRewardClaimeds: Array<{ __typename?: 'StarRewardPayout', id: string, level: number, amount: any, timestamp: any, user: { __typename?: 'User', id: string } }> };
