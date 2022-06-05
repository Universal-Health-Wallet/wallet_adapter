import React, { useEffect } from 'react';
import { Table } from 'react-bootstrap';
import DoctorRow from './DoctorRow';

const ListDoctors = ({getDoctors, doctors}) => {
  useEffect(() => {
    getDoctors();
  }, [doctors.length]);

  return(
    <div style={{ textAlign: "center"}}>
      <h1 className='u-m-t--45 u-text-white u-text-font--mb'>Doctors</h1>
      <Table className='u-text-white' style={{width: "70%", margin: "auto"}} responsive>
        <thead>
            <tr>
              <th>#</th>
              <th>Doctor Name</th>
              <th>Doctor Fee</th>
              <th>Verifed</th>
              <th>Experience</th>
              <th></th>
            </tr>
        </thead>
        <tbody>
        {
          !!doctors.length && doctors.map(({account}, index) => {
            return(
              <DoctorRow index={index} account={account} />
            )
          })
        }
        </tbody>
      </Table>
    </div>
  )
};

export default ListDoctors;
