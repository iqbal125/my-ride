// This file exports the APIURL variable used to communicate
// from the front-end to the back-end REST service

// If the back-end service is running locally on this machine, set
// the ISLOCAL to TRUE below.  In either case, set TARGET to
// either PULSE or MYRIDE

//const TARGET = "PULSE";
const TARGET = "MYRIDE";
const ISLOCAL = true;
const displayErrors = false;
const baseOptions = {
  credentials: "include" // Don't forget to specify this if you need cookies
};

let APIBase, APIURL;

switch (TARGET) {
  case "PULSE":
    APIBase = ISLOCAL ? "http://localhost:5000" : "http://54.91.30.188:8080";
    APIURL = APIBase + "/pulse-config";
    break;
  case "MYRIDE":
    APIBase = ISLOCAL ? "http://localhost:5000" : "http://18.237.248.2:5000";
    APIURL = APIBase + "/api/v1";
    break;
  default:
    alert("_commAddresses: TARGET not set correctly");
}
export { displayErrors, baseOptions };
export default APIURL;
