import { ToastContainer } from "react-toastify";

import App from "./App";
import { AppProvider } from "./contexts/AppContext";
import { ReferralProvider } from "./contexts/ReferralContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { WalletProvider } from "./contexts/WalletContext";
import { GraphQLProvider } from "./graphql";
import { AppKitProvider } from "./web3/web3.config";

import "react-toastify/dist/ReactToastify.css";

export const Provider = () => {
  return (
    <AppKitProvider>
      <GraphQLProvider>
        <AppProvider>
          <ThemeProvider>
            <WalletProvider>
              <ReferralProvider>
                <App />
                <ToastContainer
                  position="top-right"
                  autoClose={5000}
                  hideProgressBar={false}
                  newestOnTop={false}
                  closeOnClick
                  rtl={false}
                  pauseOnFocusLoss
                  draggable
                  pauseOnHover
                  theme="dark"
                />
              </ReferralProvider>
            </WalletProvider>
          </ThemeProvider>
        </AppProvider>
      </GraphQLProvider>
    </AppKitProvider>
  );
};
