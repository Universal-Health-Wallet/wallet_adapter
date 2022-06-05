import React, {useState} from 'react';
import {Button, Modal} from 'react-bootstrap';


const DoctorRow = ({index, account}) => {
  const [show, setShow] = useState(false);
  const handleClose = () => {
    setShow(false);
  }
  const handleShow = () => {
    setShow(true);
  }
  return(
    <tr>
            <td>{index + 1}</td>
            <td>{account.doctorName}</td>
            <td>{account.doctorGcFee.toNumber()}</td>
            <td>{account.doctorLicence ? "Verified": "Not Verified"}</td>
            <td>{account.doctorExperienceMonths}</td>
            <td>
            <Button variant="light" size="sm" onClick={handleShow}>
              Provide Access to record
            </Button>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Permit Health Record</Modal.Title>
        </Modal.Header>
        <Modal.Body>You are requesting record creation from {account.name}</Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleClose}>
            Permit Record
          </Button>
        </Modal.Footer>
      </Modal>

            </td>
          </tr>
  )
};

export default DoctorRow;
