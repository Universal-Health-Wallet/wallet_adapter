import React, { useState } from 'react';
import './signup.css';
import SignUpForm from './SignUpForm';

const USER_TYPES = [
  "specialist",
  "patient",
  "technician",
];

const SignUp = () => {
  const [userData, setUserData] = useState({type: ''});
  const getSignUpText = () => {
    let text = ["Let's get to know", "you better"];
    switch(userData.type) {
      case "specialist": text = ["Let's make sure", "your're a doctor"]; break;
      case "patient": text = ["Last form,", "I promise!"]; break;
      case "technician": text = ["Are you sure you're", "not a vampire"]; break;
      case '': text = ["Let's get to know", "you better"]; break;
      default: text=['', ''];
    }
    return text;
  };
  const signUpText = getSignUpText();

  return(
    <div className='c-signup u-m-t--45'>
      <div className='c-signup-text u-text-font--xmb'>
        {signUpText[0]}<br/>{signUpText[1]}
      </div>
      { userData.type? <SignUpForm type={userData.type} /> : 
      (<div className='c-signup-options u-m-t--30'>
        {USER_TYPES.map(type => (
          <div className='c-signup-choice-buttons' onClick={() => setUserData({...userData, type})}>
          <img alt={type} src={`/images/${type}.png`} width="250px" />
        </div>
        ))}
      </div>)}
      <img alt="top liquid" className='c-home-fluid-top' width="300px" src="/images/top_liquid.png" />
    </div>
  )
};

export default SignUp;
