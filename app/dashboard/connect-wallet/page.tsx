import React from "react";
import ConnectWallet from "./ConnectWallet";

interface ConnectWalletPageProps {}

export default function ConnectWalletPage(
  props: ConnectWalletPageProps
): JSX.Element {
  return (
    <div className="w-full">
      <ConnectWallet />
    </div>
  );
}