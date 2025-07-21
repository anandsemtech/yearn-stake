import { ArrowUpDown, Zap, TrendingUp, RefreshCw } from "lucide-react";
import React, { useState } from "react";

const TokenSwap: React.FC = () => {
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [isSwapping, setIsSwapping] = useState(false);

  const exchangeRate = 1.05; // 1 YEARN = 1.05 USDT

  const handleFromAmountChange = (value: string) => {
    setFromAmount(value);
    if (value) {
      setToAmount((parseFloat(value) * exchangeRate).toFixed(6));
    } else {
      setToAmount("");
    }
  };

  const handleSwap = async () => {
    setIsSwapping(true);
    // Mock swap process
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsSwapping(false);
    setFromAmount("");
    setToAmount("");
  };

  const swapTokens = () => {
    // This would swap the from/to tokens
    console.log("Swap tokens");
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Zap className="w-5 h-5 text-purple-500" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Token Swap
          </h3>
        </div>
        <div className="flex items-center space-x-2 text-sm text-green-600 dark:text-green-400">
          <TrendingUp className="w-4 h-4" />
          <span>1 YEARN = {exchangeRate} USDT</span>
        </div>
      </div>

      <div className="space-y-4">
        {/* From Token */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              From
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Balance: 1,250.00
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <img
                src="https://yearntogether.com/assets/logos/YearnLogo.svg"
                alt="YEARN"
                className="w-8 h-8 rounded-full"
                onError={(e) => {
                  e.currentTarget.src =
                    "https://s1.coincarp.com/logo/1/yearntogether.png?style=200";
                }}
              />
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  YEARN
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  YearnTogether
                </div>
              </div>
            </div>
            <input
              type="number"
              value={fromAmount}
              onChange={(e) => handleFromAmountChange(e.target.value)}
              placeholder="0.00"
              className="flex-1 text-right text-xl font-semibold bg-transparent border-none outline-none text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center">
          <button
            onClick={swapTokens}
            className="p-2 bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-900/50 rounded-full transition-colors"
          >
            <ArrowUpDown className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </button>
        </div>

        {/* To Token */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              To
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Balance: 2,450.75
            </span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">$</span>
              </div>
              <div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  USDT
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Tether USD
                </div>
              </div>
            </div>
            <input
              type="number"
              value={toAmount}
              readOnly
              placeholder="0.00"
              className="flex-1 text-right text-xl font-semibold bg-transparent border-none outline-none text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* Swap Details */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              Exchange Rate
            </span>
            <span className="font-medium text-gray-900 dark:text-white">
              1 YEARN = {exchangeRate} USDT
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              Network Fee
            </span>
            <span className="font-medium text-gray-900 dark:text-white">
              ~$0.50
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              Slippage Tolerance
            </span>
            <span className="font-medium text-gray-900 dark:text-white">
              0.5%
            </span>
          </div>
        </div>

        {/* Swap Button */}
        <button
          onClick={handleSwap}
          disabled={!fromAmount || parseFloat(fromAmount) <= 0 || isSwapping}
          className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed font-semibold"
        >
          {isSwapping ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              <span>Swapping...</span>
            </>
          ) : (
            <>
              <ArrowUpDown className="w-5 h-5" />
              <span>Swap Tokens</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default TokenSwap;
