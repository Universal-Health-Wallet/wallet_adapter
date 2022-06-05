import React, { useEffect } from 'react';
import { Table } from 'react-bootstrap';
import PatientRow from './PatientRow';

const ListPatients = ({getPatients, patients}) => {
  useEffect(() => {
    getPatients();
  }, [patients.length]);

  return(
    <div style={{ textAlign: "center"}}>
      <h1 className='u-m-t--45 u-text-white u-text-font--mb'>Patients</h1>
      <Table className='u-text-white' style={{width: "70%", margin: "auto"}} responsive>
        <thead>
            <tr>
              <th>#</th>
              <th>Patient Name</th>
              <th>DOB</th>
              <th>Gender</th>
              <th></th>
            </tr>
        </thead>
        <tbody>
        {
          !!patients.length && patients.map(({account}, index) => {
            return(
              <PatientRow index={index} account={account} />
            )
          })
        }
        </tbody>
      </Table>
    </div>
  )
};

export default ListPatients;
