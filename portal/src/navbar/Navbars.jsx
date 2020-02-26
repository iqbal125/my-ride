import React, { Component } from "react";
import { Nav, Navbar, NavLink, NavbarBrand, NavbarToggler } from "reactstrap";
import logo from "../images/smallicon.png";

const MyRideLink = ({ path, display }) => {
  let linkStyle = {
    height: 10,
    fontWeight: "bold",
    paddingBottom: 25,
    paddingTop: 0
  };
  return (
    <NavLink
      style={linkStyle}
      href={path}
      active={window.location.pathname === path}
    >
      {display}
    </NavLink>
  );
};

export class NavbarTop extends Component {
  state = {};
  render() {
    return (
      <Navbar
        expand="lg"
        fixed="top"
        style={{ height: "10px", margin: "15px 0 10px 0" }}
      >
        <NavbarBrand
          style={{
            fontSize: "20px",
            fontWeight: "bold",
            margin: 0,
            paddingRight: 15,
            paddingBottom: 10
          }}
          href="/"
        >
          <img
            src={logo}
            width="20"
            height="20"
            className="d-inline-block align-top rounded-corners"
            style={{ marginTop: "5px" }}
            alt="MyRide logo"
          />
          {"  MyRide Administration"}
        </NavbarBrand>
        <NavbarToggler aria-controls="basic-navbar-nav" />
        <Nav className="mr-auto" pills style={{ height: 30 }}>
          <MyRideLink path="/Gigs" display="Gigs" />
          <MyRideLink path="/Users" display="Users" />
          <MyRideLink path="/Page-1" display="Page-3" />
        </Nav>
      </Navbar>
    );
  }
}

export class NavbarBottom extends Component {
  render() {
    return (
      <Navbar
        bg="dark"
        variant="dark"
        expand="lg"
        fixed="bottom"
        style={{ height: "20px", margin: "0 0 10px 0" }}
      >
        <Navbar.Brand href="#home" style={{ fontSize: "12px" }}>
          &copy; Copyright 2019
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Nav className="mr-auto">
          <Nav.Link href="/">Home</Nav.Link>
          <Nav.Link href="/dee" disabled>
            Configure
          </Nav.Link>
        </Nav>
      </Navbar>
    );
  }
}
