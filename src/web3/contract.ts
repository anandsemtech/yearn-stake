import { Address, erc20Abi } from "viem";
import { polygonAmoy } from "viem/chains";

import abi from "./abi/abi.json";

export const BASE_CONTRACT = {
  [polygonAmoy.id]: {
    address: import.meta.env.VITE_AMOY_CONTRACT_ADDRESS,
    abi: abi,
  },
};

export const baseContractConfig = (chainId: number) => {
  return BASE_CONTRACT[chainId as keyof typeof BASE_CONTRACT];
};

export const ercConfig = (chainId: number) => {
  return ASSET_ADDRESS[chainId as keyof typeof ASSET_ADDRESS];
};

export const defaultGasLimit = 1000000n;

export const ASSET_ADDRESS = {
  [polygonAmoy.id]: {
    address: "0xfa74fe02f67fcc3d5797e3d7c41af027bf78dbee" as Address,
    abi: erc20Abi,
  },
};
