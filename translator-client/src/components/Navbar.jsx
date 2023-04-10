import React, { useState } from 'react';
import { Navbar, Nav, NavDropdown, Container } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUserCircle } from '@fortawesome/free-solid-svg-icons'
import { useSelector, useDispatch } from 'react-redux';

function AppNavbar() {
  const [showDropdown, setShowDropdown] = useState(false);
  const username = useSelector(state => state.username);
  const handleDropdown = () => {
    setShowDropdown(!showDropdown);
  };
  const dispatch = useDispatch();
  const onLogout = () => {
    if (window.confirm(("Are you sure you want to logout?"))) {
      dispatch((d) => d({
        type: 'SET_TOKEN',
        payload: null,
      }))
      window.location.hash = "/login";
    }

  }
  return (
    <Navbar bg="light" expand="lg" sticky="top">
      <Container>
        <Navbar.Brand href="#/text-translate">Translator</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ml-auto">
            <Nav.Link href="#/text-translate">Translate</Nav.Link>
            <Nav.Link href="#/about">About</Nav.Link>
          </Nav>
          <Nav>
            <NavDropdown
              title={
                <FontAwesomeIcon icon={faUserCircle} size="lg" />
              }
              id="basic-nav-dropdown"
              show={showDropdown}
              onClick={handleDropdown}
            >
              <NavDropdown.Item href="#/user-preference">
                {username ? username : 'Guest'}
              </NavDropdown.Item>
              <NavDropdown.Item href="#/user-preference">
                User Preferences
              </NavDropdown.Item>
              <NavDropdown.Item href="#/account-settings">
                Account Settings
              </NavDropdown.Item>
              <NavDropdown.Item onClick={onLogout}>
                Logout
              </NavDropdown.Item>
            </NavDropdown>

          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default AppNavbar;
