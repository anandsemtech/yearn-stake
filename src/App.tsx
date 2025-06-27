import { useAccount } from "wagmi";

import Dashboard from "./components/Dashboard";
import Header from "./components/Header";
import WelcomeScreen from "./components/WelcomeScreen";

function App() {
  const { isConnected, isConnecting } = useAccount();

  if (!isConnected || isConnecting) {
    return <WelcomeScreen />;
  }
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Header />
      <Dashboard />
    </div>
  );
}

export default App;
