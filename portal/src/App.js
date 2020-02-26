import React from "react";
import { Form, Col, Row, Button } from "react-bootstrap";
import { BrowserRouter, Route, Switch } from "react-router-dom";

import "./components/css/App.css";
import "./components/css/index.css";
import logo from "./images/MyRideLogo.png";
import { NavbarTop } from "./navbar/Navbars";
import Log from "./utils/Log";
import Misc from "./utils/Misc";
import Comm from "./utils/Comm";

import GigList from "./components/gigs/GigList";
import UserList from "./components/users/UserList";

const log = new Log("App");
const comm = new Comm(log);

class LogoRoute extends React.Component {
  state = {
    password: "",
    username: "",
    err: ""
  };
  constructor() {
    super();
    log.log("con cookies:", document.cookie);
    this.state.username = Misc.getCookie("username", "");
    this.state.password = Misc.getCookie("password", "");
  }

  login = e => {
    document.cookie = "username=" + this.state.username;
    document.cookie = "password=" + this.state.password;
    comm

      .sendPost("/login", {
        username: this.state.username,
        password: this.state.password
      })
      .then(result => {
        log.log("Login result:", result);
        this.props.history.push("/Gigs");
      })
      .catch(err => {
        log.log("Login failure:", err);
        if (err && err.status === 401)
          this.setState({ err: "Invalid username / password" });
        else {
          this.setState({ err: "Comm Error!" });
          alert("Comm err:" + JSON.stringify(err));
        }
      });
  };

  render() {
    log.log("render cookies:", document.cookie);
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo rounded-corners" alt="logo" />
          <p style={{ marginTop: "20px" }}>Empowering transportation.</p>
          <Form>
            <Row>
              <Col>
                <Form.Group controlId="formBasicEmail">
                  <Form.Label style={{ fontSize: 15 }}>Username</Form.Label>
                  <Form.Control
                    size="sm"
                    type="text"
                    placeholder="Username"
                    value={this.state.username}
                    autoComplete="username"
                    onChange={e => {
                      console.log("e.target.value:", e.target.value);
                      this.setState({ username: e.target.value });
                    }}
                    onKeyPress={event => {
                      if (event.key === "Enter") {
                        this.login();
                      }
                    }}
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group controlId="formBasicPassword">
                  <Form.Label style={{ fontSize: 15 }}>Password</Form.Label>
                  <Form.Control
                    size="sm"
                    type="password"
                    placeholder="Password"
                    autoComplete="current-password"
                    value={this.state.password}
                    onChange={e => {
                      console.log("e.target.value:", e.target.value);
                      this.setState({ password: e.target.value });
                    }}
                    onKeyPress={event => {
                      if (event.key === "Enter") {
                        this.login();
                      }
                    }}
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group controlId="formBasicSubmit">
                  <Form.Row>
                    <Form.Label style={{ fontSize: 15, paddingTop: 37 }} />
                  </Form.Row>
                  <Form.Row>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={e => {
                        console.log("Submit!", this.state);
                        this.login();
                      }}
                    >
                      Login
                    </Button>
                  </Form.Row>
                </Form.Group>
              </Col>
            </Row>
            <Row
              style={{
                color: "red",
                fontSize: 16,
                fontStyle: "bold",
                marginLeft: 40
              }}
            >
              {this.state.err}
            </Row>
          </Form>{" "}
        </div>
      </div>
    );
  }
}

const Error = () => {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>Sorry, unknown page; please retry.</p>
      </header>
    </div>
  );
};

function App() {
  log.log("App module invoked");
  Comm.handle401 = e => {
    alert("Not logged in OR timed-out");
    window.location = "/";
  };
  return (
    <>
      <BrowserRouter className="container-fluid">
        <NavbarTop />
        <Switch>
          <Route path="/" exact component={LogoRoute} />
          <Route path="/Gigs" component={GigList} />
          <Route path="/Users" component={UserList} />
          <Route component={Error} />
        </Switch>
      </BrowserRouter>
    </>
  );
}

export default App;
