import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Modal } from 'react-bootstrap';
import axios from 'axios';
import logo from '../logo.svg';
import {API_SERVER_BASE_URL} from '../Constants'
// import { useHistory } from 'react-router-dom';

function RegistrationPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errMsg, setErrMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showFailedModal, setShowFailedModal] = useState(false);
  const handleSuccessModalClose = () => setShowSuccessModal(false);
  const handleSuccessModalShow = () => setShowSuccessModal(true);
  const handleFailedModalClose = () => setShowFailedModal(false);
  const handleFailedModalShow = () => setShowFailedModal(true);
  // const history = useHistory();

  const handleFirstNameChange = (event) => {
    setFirstName(event.target.value);
  };

  const handleLastNameChange = (event) => {
    setLastName(event.target.value);
  };

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleSuccessDialogClose = () => {
    handleSuccessModalClose()
    window.location.hash =   ''
    // history.push('/login'); // Redirect to login page
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    // window.location.hash =   '/text-translate';
  

    try {
      const response = await axios.post(`${API_SERVER_BASE_URL}/register`, {
        "username": email,
        password,
        "firstname": firstName,
        "lastname": lastName
      });
      if (response.status === 200) {
        // Successful login
        setSuccessMsg("Registration is successfull.")
        handleSuccessModalShow();
      } else {
        setErrMsg(response.data.message)
        handleFailedModalShow()
        console.error('Failed to register');
      }
    } catch (error) {
      setErrMsg(error?.response?.data?.message )
      handleFailedModalShow()
      console.error('Failed to register:', error);
    }
  };

  return (
    <>
    <Modal show={showSuccessModal} onHide={handleSuccessModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>Success</Modal.Title>
        </Modal.Header>
        <Modal.Body>{successMsg}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleSuccessModalClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSuccessDialogClose}>
            OK
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal show={showFailedModal} onHide={handleFailedModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>Failed</Modal.Title>
        </Modal.Header>
        <Modal.Body>{errMsg}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleFailedModalClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleFailedModalClose}>
            OK
          </Button>
        </Modal.Footer>
      </Modal>
    <Container>
      <Row className="justify-content-center">
        <Col md={6} lg={5}>
          <div className="text-center">
            <img src={logo} alt="Logo" className="mb-4" width="150" />
            <h1 className="h3 mb-3">Create your account</h1>
          </div>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col>
                <Form.Group controlId="formFirstName">
                  <Form.Label>First Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter first name"
                    value={firstName}
                    onChange={handleFirstNameChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group controlId="formLastName">
                  <Form.Label>Last Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter last name"
                    value={lastName}
                    onChange={handleLastNameChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group controlId="formEmail">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={handleEmailChange}
                required
              />
            </Form.Group>

            <Form.Group controlId="formPassword">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Password"
                value={password}
                onChange={handlePasswordChange}
                required
              />
            </Form.Group>

            <Button className="mt-3" variant="primary" type="submit" block>
              Create Account
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
    </>
  );
}

export default RegistrationPage;
