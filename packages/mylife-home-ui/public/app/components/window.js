'use strict';

import React from 'react';

import WindowContent from './window-content';

function popups(view, onActionPrimary, onActionSecondary, onWindowClose) {
  const components = [];

  for(const [index, popup] of view.popups.entries()) {
    components.push(<div key={`${index}_overlay`} className="mylife-overlay" onTouchTap={onWindowClose} />);
    components.push(
      <div key={`${index}_dialog`} className="mylife-window-popup">
        <div className="modal-content" title={popup.id}>
          <div className="modal-header">
            <button onTouchTap={onWindowClose} className="close">x</button>
            <h4 className="modal-title">{popup.id}</h4>
          </div>
          <div className="modal-body">
            <WindowContent window={popup} onActionPrimary={onActionPrimary} onActionSecondary={onActionSecondary} />
          </div>
        </div>
      </div>
    );
  }

  return components;
}

const Window = ({ online, view, onActionPrimary, onActionSecondary, onWindowClose }) => (
  <div className="mylife-window-root">
    {/* preload images */}
    <img src="images/spinner.gif" style={{display: 'none'}} />
    <img src="images/connecting.jpg" style={{display: 'none'}} />

    {!online && (
      <div className="mylife-overlay-connecting">
        <img src="images/connecting.jpg" />
      </div>
    )}

    {online && !view && (
      <div className="mylife-overlay">
        <img src="images/spinner.gif" />
      </div>
    )}

    {online && view && (
      <div title={view.main.id}>
        <WindowContent window={view.main} onActionPrimary={onActionPrimary} onActionSecondary={onActionSecondary} />
      </div>
    )}

    {online && view && popups(view, onActionPrimary, onActionSecondary, onWindowClose)}
  </div>
);

Window.propTypes = {
  online            : React.PropTypes.bool.isRequired,
  view              : React.PropTypes.object,
  onActionPrimary   : React.PropTypes.func.isRequired,
  onActionSecondary : React.PropTypes.func.isRequired,
  onWindowClose     : React.PropTypes.func.isRequired,
};

export default Window;
