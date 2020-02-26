import React, { useState } from "react";
import { Map, Marker, Polyline, GoogleApiWrapper } from "google-maps-react";
import ReactDOM from "react-dom";
import "./map.css";

const MapModal = props => {
  const [refresh, setRefresh] = useState(0);
  const [origPoints, setOrigPoints] = useState(props.activeGig.Points);
  const addPoint = cords => {
    let lng = cords.lng();
    let lat = cords.lat();
    // This is CRAZY, but the <map> wont re-render the poly unless
    // it feels like its a new array
    props.activeGig.Points = [...props.activeGig.Points, { lat, lng }];
    setRefresh(refresh + 1);
  };

  const markerEnd = (e, map, coord, index) => {
    const lat = map.position.lat();
    const lng = map.position.lng();
    const point = { lat, lng };
    debugger;
    props.activeGig.Points[index] = point;
    props.activeGig.Points = [...props.activeGig.Points]; // hmmm...forces re-draw of lines
    setRefresh(refresh + 1);
  };

  const removeMarker = index => {
    props.activeGig.Points = props.activeGig.Points.filter(
      (point, idx) => idx !== index
    );
    setRefresh(refresh + 1);
  };

  // The following should only trigger if the database is hand-entered
  // and thus not all the values are filled-in. But safety anyway.
  if (!props.activeGig.Points) props.activeGig.Points = [];
  if (!props.activeGig.Center)
    props.activeGig.Center = { lat: 42.36, lng: -71.0588 };
  if (!props.activeGig.Zoom) props.activeGig.Zoom = 14;

  let hack = props.activeGig.Points;
  debugger;
  return ReactDOM.createPortal(
    <div className="modal-visible">
      <div className="map-modal-card">
        <div className="FlexRow">
          <button onClick={props.save} className="primary-button">
            {"Save"}
          </button>
          <button
            onClick={() => {
              props.activeGig.Points = origPoints;
              props.setVisible(false);
            }}
            className="close-button"
          >
            Close
          </button>
        </div>
      </div>
      <Map
        google={props.google}
        zoom={props.activeGig.Zoom}
        initialCenter={props.activeGig.Center}
        center={props.activeGig.Center}
        onDragend={(mapProps, map) => {
          props.activeGig.Center = {
            lat: map.center.lat(),
            lng: map.center.lng()
          };
          props.activeGig.Zoom = map.zoom;
        }}
        onClick={(event, map, cords) => {
          addPoint(cords.latLng);
        }}
      >
        {props.activeGig.Points.map((point, idx) => (
          <Marker
            draggable={true}
            onDragend={(e, map, coord) => markerEnd(e, map, coord, idx)}
            key={idx}
            position={point}
            onClick={() => removeMarker(idx)}
          />
        ))}
        <Polyline
          path={hack}
          geodesic={true}
          options={{
            strokeColor: "#FF0000",
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: "#FF0000",
            fillOpacity: 0.35
          }}
        />
      </Map>
      <div className="backdrop" />
    </div>,
    document.body
  );
};

export default GoogleApiWrapper({
  apiKey: "AIzaSyAIMo22PxQkykd6kM4R9vJ0-hNWd74Qxt8"
})(MapModal);
