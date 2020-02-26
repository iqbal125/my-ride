import React, { useState, useEffect, useRef } from "react";
import "./user-grid.css";
import Log from "../../utils/Log";
import Comm from "../../utils/Comm";
import RegistryBuilderForm from "../../utils/RegistryBuilderForm";
import ResizeableModal from "../../utils/ResizeableModal";

const log = new Log("UserList");
const comm = new Comm(log);

const dataValuesExample = {
  username: "JoeUser@gmail.com",
  password: null,
  demographics: {
    firstName: "Joe",
    lastName: null,
    email: null,
    phone: null,
    country: "US",
    state: "MA",
    city: "Boston",
    zipcode: null
  },
  access: {
    privileges: null,
    role: null
  }
};
const dataHints = {
  demographics: {
    country: ["US"],
    state: ["MA", "CT", "RI", "NH", "NY"],
    city: ["Boston", "Worcester", "Concord", "Norwood"]
  },
  access: {
    role: ["Admin", "Walker"]
  }
};

const UserListContainer = props => {
  const _jsx = useRef("<div/>");
  const _userRef = useRef({
    list: [],
    activeUser: {}
  });
  const users = _userRef.current;
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    log.log("useEffect: calling fetchUsers()...");
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    log.log("fetchUsers");
    comm
      .sendGet("/user")
      .then(list => {
        log.log("fetchUsers: got:", list);
        list = list.users.Items;
        list.sort((left, right) => (left.username < right.username ? -1 : 1));
        users.list = list;
        setRefresh(refresh + 1);
      })
      .catch(err => {
        //alert("Failed to fetch users (Verify logged-in):" + err);
      });
  };

  const buildFieldLine = (dataValues, placeholder, field, parentField) => {
    let uppercaseFieldname = field.charAt(0).toUpperCase() + field.slice(1);
    let id = "$0-";
    if (parentField) id += parentField + ".";
    id += field;
    let row = `<Row>
          <Form.Label column sm="3">${uppercaseFieldname}:</Form.Label>
          <Col>`;
    if (
      parentField &&
      dataHints[parentField] &&
      dataHints[parentField][field]
    ) {
      // SELECT type
      row += `<Form.Control onChange={fieldChanged} as="select" id="${id}">`;
      dataHints[parentField][field].forEach(item => {
        row += `<option value="${item}">{"${item}"}</option>`;
      });
      row += `</Form.Control>`;
    } else
      row += `
          <Form.Control required onChange={fieldChanged} id="${id}" 
            type="text" 
            placeholder="${placeholder}" />`;
    row += `</Col>
        </Row>`;
    return row;
  };

  const buildFieldLines = (dataValues, parentField = null) => {
    let rows = "";
    Object.keys(dataValues).forEach(field => {
      let row;
      if (dataValues[field] != null && typeof dataValues[field] === "object") {
        row = buildFieldLines(dataValues[field], field);
      } else row = buildFieldLine(dataValues, "", field, parentField);
      rows += row;
    });
    return rows;
  };

  const editUser = () => {
    log.log("editUser");
    debugger;
    _jsx.current = "<Form validated={true}>";
    _jsx.current += buildFieldLines(dataValuesExample /*users.activeUser*/);
    _jsx.current += `
        <Button type="submit" onClick={onSubmit}>Save</Button> 
      `;
    _jsx.current += "</Form>";
    window.jQuery("#NewUserModal").modal("show");
    setRefresh(refresh + 1);
  };

  /*****************
   * newUser
   *    Build modal 'form' to allow a user to enter the
   *    a new user's information
   */
  const newUser = () => {
    log.log("newUser");
    users.activeUser = { ...dataValuesExample };
    users.activeUser.demographics = { ...dataValuesExample.demographics };
    editUser();
  };

  const saveUser = () => {
    log.log("saveUser: activeUser:", users.activeUser);
    comm
      .sendPut("/user", users.activeUser)
      .then(result => {
        log.log("save: result:", result);
        //       alert("Saved.");
      })
      .then(fetchUsers)
      .catch(err => {
        alert("Failed to save:" + JSON.stringify(err));
      });
  };

  const UserListHeader = props => {
    return (
      <div className="header-group row">
        <div
          className=""
          style={{
            fontSize: "20px",
            fontWeight: "bold",
            margin: 0,
            marginTop: 5,
            color: "blue",
            paddingRight: 15,
            paddingBottom: 10
          }}
        >
          Users
        </div>
        <button
          className="MyRide-button"
          data-toggle="modal"
          data-target="#NewUserModal"
          onClick={newUser}
        >
          {"New User..."}
        </button>
        <button
          className="MyRide-button"
          onClick={e => {
            fetchUsers();
          }}
        >
          {"Refresh"}
        </button>
      </div>
    );
  };

  const deleteUser = user => {
    log.log("Delete user:", user);
    comm.sendDelete("/user", user).then(data => {
      fetchUsers();
    });
  };

  const UserRow = props => {
    return (
      <>
        <div
          onClick={() => {
            users.activeUser = users.list[props.idx];
            editUser();
          }}
          className="MyRide-link"
          key={props.idx}
        >
          {props.user.username}
        </div>
        <div>{props.user.demographics.firstName}</div>
        <div>{props.user.demographics.lastName}</div>
        <div>{props.user.demographics.phone}</div>
        <div>{props.user.demographics.state}</div>
        <div>{props.user.demographics.city}</div>
        <div>{props.user.demographics.zipcode}</div>
        <div>{props.user.access.role}</div>
        <div>{props.user.access.lastAccess}</div>
        <div
          className="fa fa-trash"
          onClick={deleteUser.bind(this, props.user)}
        />
      </>
    );
  };

  const tableStyle = {
    height: "85vh",
    // width: "98vw",
    border: "1px",
    borderStyle: "solid",
    borderColor: "grey",
    borderRadius: "25px",
    left: "50%",
    right: "50%",
    marginLeft: "-18%",
    marginRight: "-18%",
    boxShadow: "2px 5px #888888"
  };

  return (
    <>
      <UserListHeader onChange={select => {}} />
      <div style={tableStyle}>
        <div className="user-grid">
          <header> Username</header>
          <header> First </header>
          <header> Last </header>
          <header> Phone </header>
          <header> State </header>
          <header> City </header>
          <header> Zip </header>
          <header> Role </header>
          <header> LastAccess </header>
          <header> </header>
          {users.list.map((user, idx) => (
            <UserRow user={user} idx={idx} key={idx} />
          ))}
        </div>
      </div>
      <ResizeableModal
        id="NewUserModal"
        title="Edit User"
        body={
          <RegistryBuilderForm
            jsx={_jsx.current}
            dataValues={users.activeUser}
            formId={"$0"}
            onSubmit={e => {
              users.activeUser = users.activeUser;
              saveUser();
              users.activeUser.username = null;
              users.activeUser.password = null;
              users.activeUser.demographics.firstName = null;
              users.activeUser.demographics.lastName = null;
              e.preventDefault();
              window.jQuery("#NewUserModal").modal("hide");
            }}
          />
        }
      />
    </>
  );
};

export default class UserList extends React.Component {
  render() {
    log.log("render: props:", this.props);
    return (
      <div className="App">
        <UserListContainer />
      </div>
    );
  }
}
