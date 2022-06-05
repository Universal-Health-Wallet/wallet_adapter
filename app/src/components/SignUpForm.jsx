import React, { useState } from 'react';

const SignUpForm = ({type, accountCreator}) => {
  const [values, setValues] = useState({name: "", sex: "", dob: "", experience: "", consultFee: ""})
  const handleInputChange = (e) => {
    setValues({...values, [e.target.name]: e.target.value})
  }
  const handleSubmit = () => {
    alert(values);
    accountCreator(values);
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
        <option value="Male">Male</option>
        <option value="Female">Female</option>
        <option value="Others">Others</option>
      </select>
      <input className='c-signup-form--input' type="date" name="dob" placeholder='Date Of Birth' onChange={handleInputChange} />
      </div>
      {
        type !== "patient" && (
          <React.Fragment>
             <div className='c-signup-form--section'>
                <input type="number" className='c-signup-form--input' name="experience" value={values.experience} placeholder='Experience (In Months)' onChange={handleInputChange} />
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
