import React from "react";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { Link, NavLink } from "react-router-dom";
import banner from "../../src/banner.png";

function Header() {
  return (
    <div>
      <header>
        <Navbar bg="light" data-bs-theme="light">
          <Container>
            <Navbar.Brand as={Link} to="/">
              Indigo64
            </Navbar.Brand>
            <Nav className="mr-auto">
              <Nav.Link as={NavLink} to="/features">
                Features
              </Nav.Link>
              <Nav.Link as={NavLink} to="/tutorial">
                Tutorial
              </Nav.Link>
              <Nav.Link as={NavLink} to="/donate">
                Donate
              </Nav.Link>
            </Nav>
          </Container>
        </Navbar>
        <Container>
          <img src={banner} alt="logo" />
          <h3 className="px-3">Clean Image Sequences with Indigo64</h3>
        </Container>
      </header>
    </div>
  );
}

export default Header;
