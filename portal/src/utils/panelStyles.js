import React, { Component } from "react";
import { Spinner } from "react-bootstrap";

const panelStyles = {
  headerStyle: {
    color: "purple",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    wordWrap: "break-word"
  },

  tableRowStyle: {
    cursor: "pointer",
    paddingTop: 0,
    marginTop: 0,
    height: 25
  },

  tableCellStyle: {
    fontWeight: "bold",
    cursor: "pointer",
    textAlign: "left",
    margin: 0,
    marginLeft: 10,
    padding: 0,
    paddingTop: 3,
    paddingBottom: 3,
    color: "black"
  },

  editRowStyle: {
    margin: 0,
    padding: "2px 0px"
  },

  panelStyle: {
    backgroundColor: "f2dcba"
  },

  labelStyle: {
    fontWeight: "bold",
    fontSize: 14,
    textAlign: "right",
    paddingRight: 10,
    paddingTop: "0.75em",
    margin: 0,
    lineHeight: "0"
  },

  modalHeaderStyle: {
    background: "#e6eefa",
    padding: 0,
    paddingLeft: 10,
    margin: 0
  },

  rowStyle: {
    margin: 0,
    marginBottom: "5px"
  },

  spinner: (
    <div
      style={{
        margin: "auto",
        color: "yellow",
        width: "50%",
        padding: "10vh 0 0"
      }}
    >
      <Spinner animation="border" role="status">
        <span className="sr-only">Loading...</span>
      </Spinner>
    </div>
  ),

  htmlFieldList: [
    "number",
    "select",
    "checkbox",
    "radio",
    "textarea",
    "date",
    "text"
  ],

  selectedColor: "rgb(225, 233, 247)",

  tabPanelStyle: { height: "600px" },

  onBottom: {
    position: "absolute",
    bottom: ".5em",
    left: "10px",
    right: "10px"
  },

  submitRowStyle: {
    marginTop: "5px"
  },
  submitButtonClasses: "btn btn-primary form-control form-control-sm",
  submitInputClasses: "form-control form-control-sm",
  submitButtonStyle: { fontSize: "12px", paddingLeft: 2, paddingRight: 2 }
};

export default panelStyles;
