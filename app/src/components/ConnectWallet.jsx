import React from 'react';
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

const ConnectWallet = () => {
  return(
    <div className='h-flex u-m-t--45 u-flex--center'>
      <div className='c-home-header'>
        <h1 className='u-text-font--xmb u-text--supreme c-home-header--gradient u-lh--1'>Medical Records on Blockchain</h1>
        <WalletMultiButton className='c-connect-button u-text-font--mb u-border-radius--8 u-text--gamma u-cursor--pointer' />
      </div>
      <img alt="doctor" width="386px" src='/images/doctor.png' />
    </div>
  )
};

export default ConnectWallet;
