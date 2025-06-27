import { Address } from "viem";

import {
  useERC20Read,
  useERC20TokenInfo,
  useERC20Balance,
  useERC20BalanceCheck,
  useERC20AllowanceCheck,
  useERC20Comprehensive,
  useERC20Validation,
} from "./useERC20Read";

// Example usage of the basic ERC20 read hook with error handling
export const ExampleBasicRead = () => {
  const {
    data: tokenName,
    isLoading,
    error,
  } = useERC20Read({
    functionName: "name",
  });

  if (isLoading) return <div>Loading...</div>;

  if (error) {
    return (
      <div className="error-container">
        <h3>Error Loading Token Name</h3>
        <p>{error.message}</p>
        {error.code && <p>Error Code: {error.code}</p>}
      </div>
    );
  }

  return <div>Token Name: {tokenName as string}</div>;
};

// Example usage of the token info hook with error handling
export const ExampleTokenInfo = () => {
  const { tokenInfo, isLoading, error } = useERC20TokenInfo();

  if (isLoading) return <div>Loading token info...</div>;

  if (error) {
    return (
      <div className="error-container">
        <h3>Error Loading Token Information</h3>
        <p>{error.message}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div>
      <h3>Token Information</h3>
      <p>Name: {tokenInfo.name}</p>
      <p>Symbol: {tokenInfo.symbol}</p>
      <p>Decimals: {tokenInfo.decimals}</p>
      <p>Total Supply: {tokenInfo.formattedTotalSupply}</p>
    </div>
  );
};

// Example usage of the balance hook with error handling
export const ExampleBalance = () => {
  const { balanceInfo, isLoading, error } = useERC20Balance();

  if (isLoading) return <div>Loading balance...</div>;

  if (error) {
    return (
      <div className="error-container">
        <h3>Error Loading Balance</h3>
        <p>{error.message}</p>
        <details>
          <summary>Error Details</summary>
          <pre>{JSON.stringify(error.details, null, 2)}</pre>
        </details>
      </div>
    );
  }

  return (
    <div>
      <h3>Your Balance</h3>
      <p>Balance: {balanceInfo.formattedBalance}</p>
      <p>Allowance: {balanceInfo.formattedAllowance}</p>
    </div>
  );
};

// Example usage with custom token address and error handling
export const ExampleCustomToken = ({
  tokenAddress,
}: {
  tokenAddress: Address;
}) => {
  const {
    tokenInfo,
    isLoading: tokenLoading,
    error: tokenError,
  } = useERC20TokenInfo(tokenAddress);
  const {
    balanceInfo,
    isLoading: balanceLoading,
    error: balanceError,
  } = useERC20Balance(tokenAddress);

  const isLoading = tokenLoading || balanceLoading;
  const error = tokenError || balanceError;

  if (isLoading) return <div>Loading...</div>;

  if (error) {
    return (
      <div className="error-container">
        <h3>Error Loading Token Data</h3>
        <p>{error.message}</p>
        <p>Token Address: {tokenAddress}</p>
      </div>
    );
  }

  return (
    <div>
      <h3>{tokenInfo.symbol} Token</h3>
      <p>Name: {tokenInfo.name}</p>
      <p>Your Balance: {balanceInfo.formattedBalance}</p>
    </div>
  );
};

// Example usage of balance check with error handling
export const ExampleBalanceCheck = ({
  requiredAmount,
}: {
  requiredAmount: string;
}) => {
  const { hasSufficientBalance, balanceInfo, isLoading, error } =
    useERC20BalanceCheck(
      undefined, // uses default token
      requiredAmount
    );

  if (isLoading) return <div>Checking balance...</div>;

  if (error) {
    return (
      <div className="error-container">
        <h3>Error Checking Balance</h3>
        <p>{error.message}</p>
      </div>
    );
  }

  return (
    <div>
      <p>Your Balance: {balanceInfo.formattedBalance}</p>
      <p>Required: {requiredAmount}</p>
      <p>Sufficient Balance: {hasSufficientBalance ? "Yes" : "No"}</p>
      {!hasSufficientBalance && (
        <p className="warning">⚠️ Insufficient balance for this transaction</p>
      )}
    </div>
  );
};

// Example usage of allowance check with error handling
export const ExampleAllowanceCheck = ({
  spenderAddress,
  requiredAmount,
}: {
  spenderAddress: Address;
  requiredAmount: string;
}) => {
  const { hasSufficientAllowance, balanceInfo, isLoading, error } =
    useERC20AllowanceCheck(
      undefined, // uses default token
      spenderAddress,
      requiredAmount
    );

  if (isLoading) return <div>Checking allowance...</div>;

  if (error) {
    return (
      <div className="error-container">
        <h3>Error Checking Allowance</h3>
        <p>{error.message}</p>
      </div>
    );
  }

  return (
    <div>
      <p>Your Allowance: {balanceInfo.formattedAllowance}</p>
      <p>Required: {requiredAmount}</p>
      <p>Sufficient Allowance: {hasSufficientAllowance ? "Yes" : "No"}</p>
      {!hasSufficientAllowance && (
        <p className="warning">
          ⚠️ Insufficient allowance. You need to approve the spender.
        </p>
      )}
    </div>
  );
};

// Example usage of comprehensive hook with error handling
export const ExampleComprehensive = ({
  tokenAddress,
}: {
  tokenAddress?: Address;
}) => {
  const { data, isLoading, error } = useERC20Comprehensive(tokenAddress);

  if (isLoading) return <div>Loading comprehensive token data...</div>;

  if (error) {
    return (
      <div className="error-container">
        <h3>Error Loading Comprehensive Data</h3>
        <p>{error.message}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div>
      <h3>Comprehensive Token Data</h3>
      <div>
        <h4>Token Info</h4>
        <p>Name: {data.tokenInfo.name}</p>
        <p>Symbol: {data.tokenInfo.symbol}</p>
        <p>Decimals: {data.tokenInfo.decimals}</p>
        <p>Total Supply: {data.tokenInfo.formattedTotalSupply}</p>
      </div>
      <div>
        <h4>Balance Info</h4>
        <p>Balance: {data.balanceInfo.formattedBalance}</p>
        <p>Allowance: {data.balanceInfo.formattedAllowance}</p>
      </div>
    </div>
  );
};

// Example usage of validation hook with error handling
export const ExampleValidation = ({
  tokenAddress,
}: {
  tokenAddress: Address;
}) => {
  const { isValidERC20, tokenInfo, isLoading, error } =
    useERC20Validation(tokenAddress);

  if (isLoading) return <div>Validating token...</div>;

  if (error) {
    return (
      <div className="error-container">
        <h3>Error Validating Token</h3>
        <p>{error.message}</p>
        <p>This might not be a valid ERC20 token.</p>
      </div>
    );
  }

  return (
    <div>
      <h3>Token Validation</h3>
      <p>Is Valid ERC20: {isValidERC20 ? "✅ Yes" : "❌ No"}</p>
      {isValidERC20 && (
        <div>
          <p>Token Name: {tokenInfo.name}</p>
          <p>Token Symbol: {tokenInfo.symbol}</p>
          <p>Decimals: {tokenInfo.decimals}</p>
        </div>
      )}
    </div>
  );
};

// Example of error boundary component for ERC20 operations
export const ERC20ErrorBoundary = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return <div className="erc20-error-boundary">{children}</div>;
};

// Example of a component that handles multiple error states
export const ExampleMultiErrorHandling = () => {
  const {
    tokenInfo,
    isLoading: tokenLoading,
    error: tokenError,
  } = useERC20TokenInfo();
  const {
    balanceInfo,
    isLoading: balanceLoading,
    error: balanceError,
  } = useERC20Balance();

  const isLoading = tokenLoading || balanceLoading;
  const hasErrors = tokenError || balanceError;

  if (isLoading) return <div>Loading...</div>;

  if (hasErrors) {
    return (
      <div className="multi-error-container">
        <h3>Some data failed to load</h3>
        {tokenError && (
          <div className="error-item">
            <h4>Token Info Error:</h4>
            <p>{tokenError.message}</p>
          </div>
        )}
        {balanceError && (
          <div className="error-item">
            <h4>Balance Error:</h4>
            <p>{balanceError.message}</p>
          </div>
        )}
        <div className="partial-data">
          {!tokenError && (
            <div>
              <h4>Available Token Info:</h4>
              <p>Name: {tokenInfo.name}</p>
              <p>Symbol: {tokenInfo.symbol}</p>
            </div>
          )}
          {!balanceError && (
            <div>
              <h4>Available Balance Info:</h4>
              <p>Balance: {balanceInfo.formattedBalance}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3>All Data Loaded Successfully</h3>
      <p>
        Token: {tokenInfo.name} ({tokenInfo.symbol})
      </p>
      <p>Balance: {balanceInfo.formattedBalance}</p>
    </div>
  );
};
