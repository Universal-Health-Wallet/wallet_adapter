import React, { useState } from 'react';

const SignUpForm = ({type}) => {
  const [values, setValues] = useState({name: "", sex: "", dob: "", licenseNo: "", consultFee: ""})
  const handleInputChange = (e) => {
    setValues({...values, [e.target.name]: e.target.value})
  }
  const handleSubmit = () => {
    alert(values);
    // Submit to BE and move to dashboard
  };

  return (
    <div className='c-signup-form--wrapper'>
    <div className='c-signup-form'>
      <div className='c-signup-form--section'>
        <input className='c-signup-form--input' name="name" value={values.name} placeholder='Full Name' onChange={handleInputChange} />
      </div>
      <div className='c-signup-form--section'>
      <select className='c-signup-form--input' name="sex" id="sex" onChange={handleInputChange}>
        <option value="" disabled selected>Gender</option>
        <option value="male">Male</option>
        <option value="female">Female</option>
        <option value="others">Others</option>
      </select>
      <input className='c-signup-form--input' type="date" name="dob" placeholder='Date Of Birth' onChange={handleInputChange} />
      </div>
      {
        type !== "patient" && (
          <React.Fragment>
             <div className='c-signup-form--section'>
                <input className='c-signup-form--input' name="licenseNo" value={values.licenseNo} placeholder='License Number' onChange={handleInputChange} />
              </div>
             <div className='c-signup-form--section'>
                <input type="number" className='c-signup-form--input' name="consultFee" value={values.consultFee} placeholder='Fee Charged (In Solana)' onChange={handleInputChange} />
              </div>
          </React.Fragment>
        ) 
      }
      <button className='c-signup-form--submit' type="submit" onClick={handleSubmit}>Continue</button>
    </div>
    </div>
  )
};

export default SignUpForm;
