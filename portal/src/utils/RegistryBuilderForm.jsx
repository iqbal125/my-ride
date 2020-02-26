import React, { useEffect, useRef } from "react";
import JsxParser from "react-jsx-parser";
import $ from "jquery";
import { Form, Button, Row, Col } from "react-bootstrap";

JsxParser.defaultProps = {
  // if false, unrecognized elements like <foo> are omitted and reported via onError
  allowUnknownElements: true, // by default, allow unrecognized elements
  onError: e => {
    console.error("ERR RENDERING:", e);
  }, // if specified, any rendering errors are reported via this method
  showWarnings: true, // if true showWarnings, rendering errors are output with console.warn
  renderInWrapper: true // if false, the HTML output will have no <div> wrapper
};

let log = console;

/*
 * Component: RegistryBuilderForm (props)
 *
 * Props:
 *   .dataValue {}   : Input/output data object for the form
 *   .jsx : The full jsx returned by the server
 *   .formId : The expect value the jsx adds to the ele ID's ("$100-")
 *   .onSubmit() : Optional; function called when user hits submit
 *   .onCancel() : Optional; function called when user hits cancel
 */
export default function RegistryBuilderForm(props) {
  log.log("RegistryBuilderForm: props:", props);
  const dataRef = useRef({
    dataFilled: false
  });
  let dataValues = props.dataValues;

  const fillFields = (obj, parentField) => {
    for (let field in obj) {
      if (obj[field] !== null && typeof obj[field] === "object") {
        fillFields(obj[field], field);
      } else {
        let id = props.formId + "-";
        if (parentField) id += parentField + ".";
        id += field;
        let node = document.getElementById(id);
        if (node) node.value = obj[field];
      }
    }
  };

  useEffect(() => {
    // Called after render()
    debugger;
    if (true || !dataRef.current.dataFilled) {
      // Detect if values-content changed
      log.log("RegistryBuilderForm data values into DOM...");
      fillFields(dataValues, null);
      dataRef.current.dataFilled = true;
    }
  });

  return (
    <JsxParser
      bindings={{
        dataValues,
        onSubmit: props.onSubmit,
        onCancel: props.onCancel,
        fieldChanged: e => {
          // At run-time, the user altered a DOM element
          // Find the element; set its value, sensitive to int vs string
          let attr = e.target.id.split("-")[1];
          let val;
          if (typeof dataValues[attr] === "number")
            val = parseInt(e.target.value);
          else val = e.target.value;

          // ok, 'attr' might be like 'obj.field' so need to break it apart
          let fields = attr.split(".");
          if (fields.length === 1) dataValues[attr] = val;
          else {
            dataValues[fields[0]][fields[1]] = val;
          }
          // See if this is a pulldown(select) and then find children
          if (e.target.length !== undefined) {
            //It is a select! Clear associated subforms, then find this one subform...
            let brothers = $("div[id^='" + e.target.id + "-']");
            for (let i = 0; i < brothers.length; i++)
              brothers[i].style.display = "none";
            let node = document.getElementById(
              e.target.id + "-" + e.target.value
            );
            if (node) node.style.display = "block";
          }
        }
      }}
      components={{
        Button,
        Form,
        Row,
        Col
      }}
      jsx={props.jsx}
    />
  );
}
