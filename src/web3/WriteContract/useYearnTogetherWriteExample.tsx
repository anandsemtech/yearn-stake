import React, { useState } from "react";
import { Address } from "viem";
import { useAccount } from "wagmi";

import {
  usePackage,
  useUserBasicInfo,
} from "../ReadContract/useYearnTogetherHooks";

import {
  useStake,
  useUnstake,
  useClaimAPR,
  useClaimAllStarRewards,
  useERC20Approve,
  useCheckApprovalNeeded,
  useTransactionReceipt,
  useStakeWithApproval,
  useTokenAddress,
  useContractAddress,
} from "./useYearnTogetherWrite";

export const YearnTogetherWriteExample: React.FC = () => {
  const { address } = useAccount();
  const [stakeIndex, setStakeIndex] = useState<number>(0);
  const [packageId, setPackageId] = useState<number>(1);
  const [amount, setAmount] = useState<string>("1000000000000000000"); // 1 token in wei
  const [referrer, setReferrer] = useState<string>(
    "0x0000000000000000000000000000000000000000"
  );
  const [customTokenAddress, setCustomTokenAddress] = useState<string>("");

  // Write hooks
  const {
    stake,
    hash: stakeHash,
    isPending: isStakePending,
    error: stakeError,
  } = useStake();
  const {
    unstake,
    hash: unstakeHash,
    isPending: isUnstakePending,
    error: unstakeError,
  } = useUnstake();
  const {
    claimAPR,
    hash: claimAPRHash,
    isPending: isClaimAPRPending,
    error: claimAPRError,
  } = useClaimAPR();
  const {
    claimAllStarRewards,
    hash: claimAllHash,
    isPending: isClaimAllPending,
    error: claimAllError,
  } = useClaimAllStarRewards();
  const {
    approve,
    hash: approveHash,
    isPending: isApprovePending,
    error: approveError,
  } = useERC20Approve();
  const {
    stakeWithApproval,
    isPending: isStakeWithApprovalPending,
    error: stakeWithApprovalError,
  } = useStakeWithApproval();

  // Read hooks for data
  const { data: package1 } = usePackage(packageId);
  const { data: userInfo } = useUserBasicInfo(address!);

  // Transaction receipts
  const { data: stakeReceipt, isLoading: isStakeReceiptLoading } =
    useTransactionReceipt(stakeHash);
  const { data: unstakeReceipt, isLoading: isUnstakeReceiptLoading } =
    useTransactionReceipt(unstakeHash);
  const { data: approveReceipt, isLoading: isApproveReceiptLoading } =
    useTransactionReceipt(approveHash);

  // Get addresses with fallback
  const tokenAddress = useTokenAddress(
    (customTokenAddress as Address) || undefined
  );
  const contractAddress = useContractAddress();

  // Check if approval is needed
  const {
    allowance,
    needsApproval,
    isLoading: isApprovalCheckLoading,
  } = useCheckApprovalNeeded(
    BigInt(amount),
    tokenAddress,
    address!,
    contractAddress
  );

  const handleStake = async () => {
    if (!address || !package1) return;

    try {
      const tokens = [tokenAddress];
      const amounts = [BigInt(amount)];
      const referrerAddress = referrer as Address;

      await stake(packageId, tokens, amounts, referrerAddress);
    } catch (error) {
      console.error("Stake error:", error);
    }
  };

  const handleStakeWithApproval = async () => {
    if (!address || !package1) return;

    try {
      const tokens = [tokenAddress];
      const amounts = [BigInt(amount)];
      const referrerAddress = referrer as Address;

      await stakeWithApproval(
        tokenAddress,
        packageId,
        tokens,
        amounts,
        referrerAddress,
        contractAddress
      );
    } catch (error) {
      console.error("Stake with approval error:", error);
    }
  };

  const handleApprove = async () => {
    if (!address) return;

    try {
      await approve(BigInt(amount), tokenAddress, contractAddress);
    } catch (error) {
      console.error("Approve error:", error);
    }
  };

  const handleUnstake = async () => {
    if (!address) return;

    try {
      await unstake(stakeIndex);
    } catch (error) {
      console.error("Unstake error:", error);
    }
  };

  const handleClaimAPR = async () => {
    if (!address) return;

    try {
      await claimAPR(stakeIndex);
    } catch (error) {
      console.error("Claim APR error:", error);
    }
  };

  const handleClaimAllStarRewards = async () => {
    if (!address) return;

    try {
      await claimAllStarRewards();
    } catch (error) {
      console.error("Claim all star rewards error:", error);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">
        YearnTogether Write Contract Example
      </h1>

      {/* User Info */}
      {userInfo && (
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">User Information</h2>
          <p>
            <strong>Star Level:</strong> {userInfo.starLevel}
          </p>
          <p>
            <strong>Total Staked:</strong> {userInfo.totalStaked?.toString()}
          </p>
          <p>
            <strong>Stake Counts:</strong> {userInfo.stakeCounts}
          </p>
        </div>
      )}

      {/* Package Info */}
      {package1 && (
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">
            Package {packageId} Information
          </h2>
          <p>
            <strong>APR:</strong> {package1.apr}%
          </p>
          <p>
            <strong>Duration:</strong> {package1.durationYears} years
          </p>
          <p>
            <strong>Min Stake:</strong> {package1.minStakeAmount?.toString()}
          </p>
        </div>
      )}

      {/* Address Information */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-2">Address Information</h2>
        <div className="space-y-2">
          <p>
            <strong>Token Address:</strong> {tokenAddress}
          </p>
          <p>
            <strong>Contract Address:</strong> {contractAddress}
          </p>
          <p>
            <strong>Using Fallback:</strong>{" "}
            {!customTokenAddress ? "Yes (ASSET_ADDRESS)" : "No (Custom)"}
          </p>
        </div>
      </div>

      {/* Token Address Input */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-2">
          Token Address Configuration
        </h2>
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Custom Token Address (leave empty to use ASSET_ADDRESS)"
            value={customTokenAddress}
            onChange={(e) => setCustomTokenAddress(e.target.value)}
            className="w-full border p-2 rounded"
          />
          <p className="text-sm text-gray-600">
            Leave empty to automatically use the token address from
            ASSET_ADDRESS configuration
          </p>
        </div>
      </div>

      {/* Approval Status */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-2">Approval Status</h2>
        {isApprovalCheckLoading ? (
          <p>Checking approval...</p>
        ) : (
          <div className="space-y-2">
            <p>
              <strong>Allowance:</strong> {allowance?.toString()}
            </p>
            <p>
              <strong>Needs Approval:</strong> {needsApproval ? "Yes" : "No"}
            </p>
            <p>
              <strong>Required Amount:</strong> {amount}
            </p>
          </div>
        )}
      </div>

      {/* Input Forms */}
      <div className="bg-white p-4 rounded-lg shadow space-y-4">
        <h2 className="text-lg font-semibold">Contract Interactions</h2>

        {/* Stake Form */}
        <div className="space-y-2">
          <h3 className="font-medium">Stake Tokens</h3>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder="Package ID"
              value={packageId}
              onChange={(e) => setPackageId(Number(e.target.value))}
              className="border p-2 rounded"
            />
            <input
              type="text"
              placeholder="Amount (wei)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="border p-2 rounded"
            />
            <input
              type="text"
              placeholder="Referrer Address"
              value={referrer}
              onChange={(e) => setReferrer(e.target.value)}
              className="border p-2 rounded"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleStake}
              disabled={isStakePending}
              className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {isStakePending ? "Staking..." : "Stake"}
            </button>
            <button
              onClick={handleStakeWithApproval}
              disabled={isStakeWithApprovalPending}
              className="bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {isStakeWithApprovalPending
                ? "Staking with Approval..."
                : "Stake with Approval"}
            </button>
          </div>
        </div>

        {/* Approve Form */}
        <div className="space-y-2">
          <h3 className="font-medium">Approve Tokens</h3>
          <button
            onClick={handleApprove}
            disabled={isApprovePending}
            className="bg-yellow-500 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {isApprovePending ? "Approving..." : "Approve"}
          </button>
        </div>

        {/* Unstake Form */}
        <div className="space-y-2">
          <h3 className="font-medium">Unstake</h3>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Stake Index"
              value={stakeIndex}
              onChange={(e) => setStakeIndex(Number(e.target.value))}
              className="border p-2 rounded"
            />
            <button
              onClick={handleUnstake}
              disabled={isUnstakePending}
              className="bg-red-500 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {isUnstakePending ? "Unstaking..." : "Unstake"}
            </button>
          </div>
        </div>

        {/* Claim Forms */}
        <div className="space-y-2">
          <h3 className="font-medium">Claim Rewards</h3>
          <div className="flex gap-2">
            <button
              onClick={handleClaimAPR}
              disabled={isClaimAPRPending}
              className="bg-purple-500 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {isClaimAPRPending ? "Claiming APR..." : "Claim APR"}
            </button>
            <button
              onClick={handleClaimAllStarRewards}
              disabled={isClaimAllPending}
              className="bg-indigo-500 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              {isClaimAllPending ? "Claiming All..." : "Claim All Star Rewards"}
            </button>
          </div>
        </div>
      </div>

      {/* Transaction Status */}
      <div className="bg-white p-4 rounded-lg shadow space-y-4">
        <h2 className="text-lg font-semibold">Transaction Status</h2>

        {/* Errors */}
        {(stakeError ||
          unstakeError ||
          claimAPRError ||
          claimAllError ||
          approveError ||
          stakeWithApprovalError) && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <strong>Errors:</strong>
            {stakeError && <p>Stake: {stakeError.message}</p>}
            {unstakeError && <p>Unstake: {unstakeError.message}</p>}
            {claimAPRError && <p>Claim APR: {claimAPRError.message}</p>}
            {claimAllError && <p>Claim All: {claimAllError.message}</p>}
            {approveError && <p>Approve: {approveError.message}</p>}
            {stakeWithApprovalError && (
              <p>Stake with Approval: {stakeWithApprovalError.message}</p>
            )}
          </div>
        )}

        {/* Transaction Hashes */}
        <div className="space-y-2">
          {stakeHash && (
            <p>
              <strong>Stake Hash:</strong> {stakeHash}
            </p>
          )}
          {unstakeHash && (
            <p>
              <strong>Unstake Hash:</strong> {unstakeHash}
            </p>
          )}
          {approveHash && (
            <p>
              <strong>Approve Hash:</strong> {approveHash}
            </p>
          )}
          {claimAPRHash && (
            <p>
              <strong>Claim APR Hash:</strong> {claimAPRHash}
            </p>
          )}
          {claimAllHash && (
            <p>
              <strong>Claim All Hash:</strong> {claimAllHash}
            </p>
          )}
        </div>

        {/* Transaction Receipts */}
        <div className="space-y-2">
          {stakeReceipt && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              <strong>Stake Transaction Confirmed!</strong>
              <p>Block: {stakeReceipt.blockNumber?.toString()}</p>
              <p>Gas Used: {stakeReceipt.gasUsed?.toString()}</p>
            </div>
          )}
          {unstakeReceipt && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              <strong>Unstake Transaction Confirmed!</strong>
              <p>Block: {unstakeReceipt.blockNumber?.toString()}</p>
              <p>Gas Used: {unstakeReceipt.gasUsed?.toString()}</p>
            </div>
          )}
          {approveReceipt && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              <strong>Approve Transaction Confirmed!</strong>
              <p>Block: {approveReceipt.blockNumber?.toString()}</p>
              <p>Gas Used: {approveReceipt.gasUsed?.toString()}</p>
            </div>
          )}
        </div>

        {/* Loading States */}
        <div className="space-y-2">
          {(isStakeReceiptLoading ||
            isUnstakeReceiptLoading ||
            isApproveReceiptLoading) && (
            <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
              <strong>Waiting for transaction confirmation...</strong>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default YearnTogetherWriteExample;
