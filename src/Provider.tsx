import App from "./App";
import { ReferralProvider } from "./contexts/ReferralContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { WalletProvider } from "./contexts/WalletContext";
import { GraphQLProvider } from "./graphql";
import { AppKitProvider } from "./web3/web3.config";

export const Provider = () => {
  return (
    <AppKitProvider>
      <ThemeProvider>
        <WalletProvider>
          <ReferralProvider>
            <GraphQLProvider>
              <App />
            </GraphQLProvider>
          </ReferralProvider>
        </WalletProvider>
      </ThemeProvider>
    </AppKitProvider>
  );
};
