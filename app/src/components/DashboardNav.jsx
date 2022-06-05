import React from 'react';

const DashboardNav = ({userName, viewDoctors, }) => {
  return (
    <div>
      <span className='u-text--alpha u-text-cyan u-text--bold u-text-font--xmb u-text-center'>UHW</span>
      <span className=''>{userName[0] || 'A'}</span>
      <span>View Appointments</span>
      <span>View Appointments</span>
    </div>
  )
};

export default DashboardNav;
