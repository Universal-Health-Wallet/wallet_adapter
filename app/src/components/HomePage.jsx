import React from "react";
import ConnectWallet from "./ConnectWallet";
import SignUp from "./SignUp";

const HomePage = ({wallet}) => {
  const walletConnected = wallet.connected;
  return(
    <div className='c-home-page'>
    <div className='c-home-page--wrapper u-text-font--mb'>
    <div className='u-m-t--45'><span className='u-text--alpha u-text-cyan u-text--bold u-text-font--xmb'>UHW</span></div>
    {walletConnected ? <SignUp />: <ConnectWallet />}
    <img alt="liquid" className='c-home-fluid' src="/images/liquid.png" />
    </div>
  </div>
  )
};

export default HomePage;
