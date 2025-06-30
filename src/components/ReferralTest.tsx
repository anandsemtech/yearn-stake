import React from "react";

import { useReferralContext } from "../contexts/ReferralContext";
import { getStoredReferralData, clearReferralData } from "../utils/referral";

const ReferralTest: React.FC = () => {
  const { referralData, hasValidReferral, setReferral, clearReferral } =
    useReferralContext();

  const handleSetTestReferral = () => {
    setReferral("0x1234567890123456789012345678901234567890", "test");
  };

  const handleClearStored = () => {
    clearReferralData();
    window.location.reload();
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Referral System Test</h2>

      <div className="space-y-4">
        <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <h3 className="font-semibold mb-2">Current Referral Status</h3>
          <p>Has Valid Referral: {hasValidReferral() ? "Yes" : "No"}</p>
          {referralData && (
            <div className="mt-2">
              <p>Referrer: {referralData.referrerAddress}</p>
              <p>Source: {referralData.source}</p>
              <p>
                Timestamp: {new Date(referralData.timestamp).toLocaleString()}
              </p>
            </div>
          )}
        </div>

        <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <h3 className="font-semibold mb-2">Raw LocalStorage Data</h3>
          <pre className="text-xs bg-gray-200 dark:bg-gray-600 p-2 rounded overflow-auto">
            {JSON.stringify(getStoredReferralData(), null, 2)}
          </pre>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={handleSetTestReferral}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Set Test Referral
          </button>
          <button
            onClick={clearReferral}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Clear Referral
          </button>
          <button
            onClick={handleClearStored}
            className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
          >
            Clear Stored & Reload
          </button>
        </div>

        <div className="p-4 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
          <h3 className="font-semibold mb-2">Test Instructions</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>
              Visit:{" "}
              <code className="bg-gray-200 dark:bg-gray-600 px-1 rounded">
                /ref/0x1234567890123456789012345678901234567890
              </code>
            </li>
            <li>Check if referral is stored in localStorage</li>
            <li>Verify the referral status appears in the header</li>
            <li>Test clearing the referral</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default ReferralTest;
