import { toast } from "react-toastify";

export const customError = (e: Error) => {
  if (e.message?.includes("insufficient funds")) {
    toast.error("Insufficient funds to cover gas costs");
  } else if (e.message?.includes("execution reverted")) {
    toast.error("Transaction would revert. Please check your inputs");
  } else if (e.message?.includes("invalid opcode")) {
    toast.error("Invalid operation. Please check contract state");
  } else {
    if (e.message?.includes("User rejected the request")) {
      toast.error("Transaction rejected by user");
    } else {
      const revertReason = e.message?.match(/Error: (.*)/)?.[1]?.trim();
      if (revertReason) {
        toast.error("Error: \n\n " + revertReason);
      } else {
        toast.error("Error estimating: " + (e.message || "Unknown error"));
      }
    }
  }
};
