import React, {useState} from 'react';
import {Button, Modal} from 'react-bootstrap';


const PatientRow = ({index, account}) => {
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
            <td>{account.name}</td>
            <td>{account.dob}</td>
            <td>{account.sex}</td>
            <td>
            <Button variant="light" size="sm" onClick={handleShow}>
        Request Record
      </Button>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Add Health Record</Modal.Title>
        </Modal.Header>
        <Modal.Body>Woohoo, you're reading this text in a modal!</Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleClose}>
            Create Record
          </Button>
        </Modal.Footer>
      </Modal>

            </td>
          </tr>
  )
};

export default PatientRow;
