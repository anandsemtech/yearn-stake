import {
  Moon,
  Sun,
  Settings,
  Star,
  Menu,
  X,
  Zap,
  Copy,
  Share2,
} from "lucide-react";
import React, { useState } from "react";
import { useAccount, useDisconnect } from "wagmi";

import { useTheme } from "../contexts/hooks/useTheme";
import { useWallet } from "../contexts/hooks/useWallet";

import ReferralShareModal from "./ReferralShareModal";
import ReferralStatus from "./ReferralStatus";
import TokenSwapModal from "./TokenSwapModal";
import UserSettingsModal from "./UserSettingsModal";

const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useWallet();
  const { isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [showSettings, setShowSettings] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showTokenSwapModal, setShowTokenSwapModal] = useState(false);
  const [showCopiedTooltip, setShowCopiedTooltip] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);

  const getStarDisplay = (starLevel: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < starLevel
            ? "text-yellow-400 fill-yellow-400"
            : "text-gray-300 dark:text-gray-600"
        }`}
      />
    ));
  };

  const copyAddress = async () => {
    if (user?.address) {
      try {
        await navigator.clipboard.writeText(user.address);
        setShowCopiedTooltip(true);
        setTimeout(() => setShowCopiedTooltip(false), 2000); // Hide after 2 seconds
        console.log("Address copied to clipboard");
      } catch (err) {
        console.error("Failed to copy address:", err);
      }
    }
  };

  return (
    <>
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 dark:from-blue-500 dark:to-purple-600 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-white dark:text-gray-900" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 dark:from-blue-600 dark:to-purple-600 bg-clip-text text-transparent">
                AffiliateX
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              {isConnected && user && (
                <div className="flex items-center space-x-2 px-3 py-1 bg-yellow-50 dark:bg-yellow-900/20 rounded-full">
                  <div className="flex items-center space-x-1">
                    {getStarDisplay(user.starLevel)}
                  </div>
                  <span className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
                    Level {user.starLevel}
                  </span>
                </div>
              )}

              <ReferralStatus />

              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {theme === "light" ? (
                  <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                ) : (
                  <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                )}
              </button>

              {isConnected ? (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowSettings(true)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <Settings className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  </button>
                  <div className="flex items-center space-x-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-green-700 dark:text-green-300">
                      {user?.address.slice(0, 6)}...{user?.address.slice(-4)}
                    </span>
                    <div className="relative group">
                      <button
                        onClick={copyAddress}
                        className="p-1 hover:bg-green-100 dark:hover:bg-green-800 rounded transition-colors"
                        title="Copy address"
                      >
                        <Copy className="w-3 h-3 text-green-600 dark:text-green-400" />
                      </button>
                      {showCopiedTooltip && (
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded shadow-lg whitespace-nowrap z-10 opacity-100 transition-opacity duration-200">
                          Copied!
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => setShowReferralModal(true)}
                      className="p-1 hover:bg-green-100 dark:hover:bg-green-800 rounded transition-colors"
                      title="Share address"
                    >
                      <Share2 className="w-3 h-3 text-green-600 dark:text-green-400" />
                    </button>
                  </div>
                  <button
                    onClick={() => setShowTokenSwapModal(true)}
                    className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white rounded-lg transition-all duration-200 transform hover:scale-105 text-sm font-medium"
                  >
                    <Zap className="w-4 h-4" />
                    <span>Swap</span>
                  </button>
                  <button
                    onClick={() => disconnect()}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm font-medium"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <appkit-button label="Connect Wallet"></appkit-button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {showMobileMenu ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {showMobileMenu && (
            <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-col space-y-4">
                {isConnected && user && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1">
                        {getStarDisplay(user.starLevel)}
                      </div>
                      <span className="text-sm font-medium">
                        Level {user.starLevel}
                      </span>
                    </div>
                  </div>
                )}

                <ReferralStatus />

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Theme</span>
                  <button
                    onClick={toggleTheme}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    {theme === "light" ? (
                      <Moon className="w-5 h-5" />
                    ) : (
                      <Sun className="w-5 h-5" />
                    )}
                  </button>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setShowSettings(true);
                      setShowMobileMenu(false);
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    <span className="text-sm">Settings</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowTokenSwapModal(true);
                      setShowMobileMenu(false);
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-lg transition-colors"
                  >
                    <Zap className="w-4 h-4" />
                    <span className="text-sm">Swap Tokens</span>
                  </button>
                  <button
                    onClick={() => disconnect()}
                    className="w-full px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors text-sm font-medium"
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Modals placed outside header for better positioning */}
      {showTokenSwapModal && (
        <TokenSwapModal onClose={() => setShowTokenSwapModal(false)} />
      )}

      {showSettings && (
        <UserSettingsModal onClose={() => setShowSettings(false)} />
      )}

      {showReferralModal && (
        <ReferralShareModal onClose={() => setShowReferralModal(false)} />
      )}
    </>
  );
};

export default Header;
