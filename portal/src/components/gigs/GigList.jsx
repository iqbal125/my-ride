import React, { useState, useEffect, useRef } from "react";
import { Form, Row } from "react-bootstrap";

import MapModal from "../map/MapModal";
import "./gig-grid.css";

import Log from "../../utils/Log";
import Comm from "../../utils/Comm";
import RegistryBuilderForm from "../../utils/RegistryBuilderForm";
import ResizeableModal from "../../utils/ResizeableModal";

const log = new Log("GigList");
const comm = new Comm(log);

const GigListContainer = props => {
  let _selections = useRef({
    dataValues: {
      country: "US",
      state: "MA",
      city: "Boston",
      metro: "BackBay",
      street: null,
      description: null
    },

    jsx: null
  });
  let selections = _selections.current;
  const default_map = {
    Center: { lat: 42.36, lng: -71.0588 },
    Points: [],
    Zoom: 14
  };
  const _gigRef = useRef({
    list: [],
    activeGig: default_map
  });
  const gigs = _gigRef.current;
  const [visible, setVisible] = useState(false);
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    log.log("useEffect: calling fetchGigs()...");
    fetchGigs();
  }, []);

  const fetchGigs = () => {
    log.log("fetchGigs");
    comm
      .sendPost("/gig", selections.dataValues)
      .then(list => {
        log.log("fetchGigs: got:", list);
        list = list.gigs;
        list.sort((left, right) =>
          left.CountryStateCity + "-" + left.MetroStreetDescription <
          right.CountryStateCity + "-" + right.MetroStreetDescription
            ? -1
            : 1
        );
        gigs.list = list;
        setRefresh(refresh + 1);
      })
      .catch(err => {
        //alert("Failed to fetch gigs (Verify logged-in):" + err);
      });
  };

  /*****************
   * newGig
   *    Build modal 'form' to allow a user to enter the
   *    name pieces of a new gig's name
   */
  const newGig = () => {
    log.log("newGig");
    let jsx = "<Form validated={true}>";
    Object.keys(selections.dataValues).forEach(field => {
      let uppercaseFieldname = field.charAt(0).toUpperCase() + field.slice(1);
      let row = `<Row>
          <Form.Label column sm="3">${uppercaseFieldname}:</Form.Label>
          <Col ><Form.Control required onChange={fieldChanged} id="$0-${field}" type="text" placeholder="Enter valid street & description" /></Col>
        </Row>`;
      jsx += row;
    });
    jsx += `<Button type="submit" onClick={onSubmit}>Create</Button> 
      `;
    jsx += "</Form>";
    selections.jsx = jsx;
    setRefresh(refresh + 1);
  };

  const saveGig = () => {
    log.log("saveGig: activeGig:", gigs.activeGig);
    debugger;
    comm
      .sendPut("/gig", gigs.activeGig)
      .then(result => {
        log.log("save: result:", result);
        //       alert("Saved.");
      })
      .then(fetchGigs)
      .catch(err => {
        alert("Failed to save:" + err);
      });
    setVisible(false);
  };

  const SelectList = props => {
    let BostonMetros = {
      "<Select>": null,
      BackBay: {},
      NorthEnd: {},
      Copley: {}
    };
    let US_Mass_Cities = {
      Boston: BostonMetros,
      Concord: { WestConcord: {}, Concord: {} },
      Norwood: { SouthNorwod: {}, NothNorwood: {} }
    };
    let US_States = {
      MA: US_Mass_Cities,
      CT: { City1: { Metro1: {} } },
      NH: { City1: { Metro1: {} } },
      NY: { City1: { Metro1: {} } }
    };

    let _countries = {
      US: US_States,
      Canada: { State1: { City1: { Metro1: {} } } },
      Mexico: { State1: { City1: { Metro1: {} } } }
    };
    const [countries] = useState(_countries);
    const [states, setStates] = useState(
      countries[selections.dataValues.country]
    );
    const [cities, setCities] = useState(
      countries[selections.dataValues.country][selections.dataValues.state]
    );
    const [metros, setMetros] = useState(
      countries[selections.dataValues.country][selections.dataValues.state][
        selections.dataValues.city
      ]
    );
    const selectStyle = {
      margin: 5,
      marginTop: 2,
      height: 20
    };
    return (
      <>
        <Form inline>
          {/** Show COUNTRIES */}
          <Form.Control
            style={selectStyle}
            as="select"
            defaultValue={selections.dataValues.country}
            onChange={e => {
              console.log("change: e:", e);
              selections.dataValues.country = e.target.value;
              props.onChange(selections);
              setStates(_countries[selections.dataValues.country]);
            }}
          >
            {Object.keys(countries).map((country, idx) => {
              return <option key={country}>{country}</option>;
            })}
          </Form.Control>

          {/** Show STATES */}
          <Form.Control
            as="select"
            style={selectStyle}
            defaultValue={selections.dataValues.state}
            onChange={e => {
              console.log("change: e:", e);
              selections.dataValues.state = e.target.value;
              props.onChange(selections);
              setCities(
                countries[selections.dataValues.country][
                  selections.dataValues.state
                ]
              );
            }}
          >
            {Object.keys(states).map((state, idx) => {
              return <option key={state}>{state}</option>;
            })}
          </Form.Control>

          {/** Show CITIES */}
          <Form.Control
            as="select"
            style={selectStyle}
            defaultValue={selections.dataValues.city}
            onChange={e => {
              console.log("change: e:", e);
              selections.dataValues.city = e.target.value;
              props.onChange(selections);
              setMetros(
                countries[selections.dataValues.country][
                  selections.dataValues.state
                ][selections.dataValues.city]
              );
            }}
          >
            {Object.keys(cities).map((city, idx) => {
              return <option key={city}>{city}</option>;
            })}
          </Form.Control>

          {/** Show METROS */}
          <Form.Control
            as="select"
            style={selectStyle}
            defaultValue={selections.dataValues.metro}
            onChange={e => {
              console.log("change: e:", e);
              selections.dataValues.metro = e.target.value;
              props.onChange(selections);
            }}
          >
            {Object.keys(metros).map((metro, idx) => {
              return <option key={metro}>{metro}</option>;
            })}
          </Form.Control>
        </Form>{" "}
      </>
    );
  };

  const GigListHeader = props => {
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
          Gigs
        </div>
        <button
          className="MyRide-button"
          data-toggle="modal"
          data-target="#NewGigModal"
          onClick={newGig}
        >
          {"New Gig..."}
        </button>
        <Form.Label
          style={{
            marginLeft: 10,
            marginRight: 5,
            marginTop: 5,
            paddingTop: 2,
            fontWeight: "bold"
          }}
        >
          {" Filter: "}
        </Form.Label>
        <SelectList {...props} />
        <button
          className="MyRide-button"
          onClick={e => {
            fetchGigs();
          }}
        >
          {"Search"}
        </button>
      </div>
    );
  };

  const MapOverlay = props => {
    return visible ? (
      <MapModal
        save={saveGig}
        activeGig={gigs.activeGig}
        visible={visible}
        setVisible={setVisible}
      />
    ) : null;
  };

  const deleteGig = gig => {
    log.log("Delete gig:", gig);
    comm.sendDelete("/gig", gig).then(data => {
      fetchGigs();
    });
  };

  const showPoint = point =>
    point ? "{" + point.lat.toFixed(4) + "," + point.lng.toFixed(4) + "}" : "";

  const GigRow = props => {
    let msd = props.gig.MetroStreetDescription.split("-");
    return (
      <>
        <div>{props.gig.CountryStateCity}</div>
        <div>{msd[0] + "-" + msd[1]}</div>
        <div
          onClick={() => {
            gigs.activeGig = gigs.list[props.idx];
            setVisible(true);
          }}
          className="MyRide-link"
          key={props.idx}
        >
          {msd[2]}
        </div>
        <div>{props.gig.DateCompleted}</div>
        <div>{showPoint(props.gig.Center)}</div>
        <div>{props.gig.AssignedTo}</div>
        <div>{props.gig.Points ? props.gig.Points.length : ""}</div>
        <div
          className="fa fa-trash"
          onClick={deleteGig.bind(this, props.gig)}
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
      <GigListHeader onChange={select => {}} />
      <MapOverlay />
      <div style={tableStyle}>
        <div className="gig-grid">
          <header> Geography</header>
          <header> Metro - Street </header>
          <header> Location </header>
          <header> Completed </header>
          <header> GeoCenter </header>
          <header> AssignedTo </header>
          <header> POIs </header>
          <header> </header>
          {gigs.list.map((gig, idx) => (
            <GigRow gig={gig} idx={idx} key={idx} />
          ))}
        </div>
      </div>
      <ResizeableModal
        id="NewGigModal"
        title="Create a new Gig"
        body={
          <RegistryBuilderForm
            jsx={selections.jsx}
            dataValues={selections.dataValues}
            formId={"$0"}
            onSubmit={e => {
              // Leave the last-used Center and Zoom stay in effect
              gigs.activeGig.Points = [];
              gigs.activeGig.CountryStateCity = [
                selections.dataValues.country,
                selections.dataValues.state,
                selections.dataValues.city
              ].join("-");
              gigs.activeGig.MetroStreetDescription = [
                selections.dataValues.metro,
                selections.dataValues.street,
                selections.dataValues.description
              ].join("-");
              // Clear these so that the 'filter' doesn't sub-select on them
              selections.dataValues.street = null;
              selections.dataValues.description = null;
              setVisible(true);
              e.preventDefault();
              window.jQuery("#NewGigModal").modal("hide");
            }}
          />
        }
      />
    </>
  );
};

export default class GigList extends React.Component {
  render() {
    log.log("render: props:", this.props);
    return (
      <div className="App">
        <GigListContainer />
      </div>
    );
  }
}
