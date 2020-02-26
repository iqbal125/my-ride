import React, { useEffect } from "react";
/********
 * WARNING/NOTE: The project MUST html-include jquery and jquery-ui!!!
 */

/****
 * ResizeableModal
 *
 * Props:
 *   - id
 *   - title
 *   - body
 *   - onClose()  Optional
 *   - onSave() Optional
 */
const ResizeableModal = props => {
  useEffect(() => {
    let $ = window.jQuery;
    $(".modal-content").resizable();
    $(".modal-dialog").draggable();
  });

  return (
    <div className="modal" id={props.id}>
      <div className="modal-dialog" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <button
              type="button"
              className="close"
              data-dismiss="modal"
              aria-label="Close"
            >
              <span aria-hidden="true">&times;</span>
            </button>
            <h4 className="modal-title">{props.title}</h4>
          </div>
          <div className="modal-body">{props.body}</div>
          <div className="modal-footer">
            {props.onClose ? (
              <button
                type="button"
                className="btn btn-default"
                data-dismiss="modal"
              >
                Close
              </button>
            ) : null}
            {props.onSave ? (
              <button
                type="button"
                className="btn btn-primary"
                data-dismiss="modal"
                onClick={props.onSave}
              >
                Save
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
export default ResizeableModal;
