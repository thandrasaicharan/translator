import { useState } from "react";
import { Container, Form, Button } from "react-bootstrap";
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

function AccountSettings() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");



  const token = useSelector(state => state.token);
  const navigate = useNavigate();
  // if (!token) {
  //   navigate('/login');
  

  // }
  const handleSubmit = (event) => {
    event.preventDefault();
    // check if new password matches confirm password
    if (newPassword !== confirmNewPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    // do something with new password
  };

  return (
    <Container>
      <h1>Account Settings</h1>
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="currentPassword">
          <Form.Label>Current Password</Form.Label>
          <Form.Control
            type="password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            placeholder="Enter current password"
          />
        </Form.Group>

        <Form.Group controlId="newPassword">
          <Form.Label>New Password</Form.Label>
          <Form.Control
            type="password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            placeholder="Enter new password"
          />
        </Form.Group>

        <Form.Group controlId="confirmNewPassword">
          <Form.Label>Confirm New Password</Form.Label>
          <Form.Control
            type="password"
            value={confirmNewPassword}
            onChange={(event) => setConfirmNewPassword(event.target.value)}
            placeholder="Confirm new password"
          />
          {passwordError && (
            <Form.Text className="text-danger">{passwordError}</Form.Text>
          )}
        </Form.Group>

        <Button className="mt-3 mb-3" variant="primary" type="submit">
          Change Password
        </Button>
      </Form>
    </Container>
  );
}

export default AccountSettings;
