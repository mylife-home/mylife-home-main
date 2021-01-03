'use strict';

import React from 'react';
import * as mui from 'material-ui';
import base from '../base/index';
import icons from '../icons';

const styles = {
  icon: {
    margin: 16,
  },
  button: {
    height: '56px',
    width: '56px',
    overflow: 'inherit'
  }
};

const Toolbar = ({ vpanelProjectNames, onNewImage, onNewWindow, onImportOnline, onOpenFileVPanelProject, onOpenOnlineVPanelProject, onDeploy }) => (
  <mui.Toolbar>
    <mui.ToolbarGroup>

      <mui.IconButton tooltip="New image"
                      tooltipPosition="top-right"
                      onClick={onNewImage}
                      style={styles.button}>
        <icons.actions.NewImage />
      </mui.IconButton>

      <mui.IconButton tooltip="New window"
                      tooltipPosition="top-right"
                      onClick={onNewWindow}
                      style={styles.button}>
        <icons.actions.NewWindow />
      </mui.IconButton>

      <mui.IconButton tooltip="Import UI components from online entities"
                      tooltipPosition="top-center"
                      onClick={onImportOnline}
                      style={styles.button}>
        <icons.actions.Refresh />
      </mui.IconButton>

      <base.IconSelectButton tooltip="Import UI components from online project"
                             tooltipPosition="top-center"
                             style={styles.button}
                             selectTitle="Select VPanel Project"
                             selectItems={vpanelProjectNames}
                             onItemSelect={onOpenFileVPanelProject}>
        <icons.actions.OpenOnline />
      </base.IconSelectButton>

      <base.IconFileButton tooltip="Import UI components from file project"
                           tooltipPosition="top-center"
                           style={styles.button}
                           onFileSelected={onOpenOnlineVPanelProject}>
        <icons.actions.OpenFile />
      </base.IconFileButton>

      <mui.IconButton tooltip="Deploy project"
                      tooltipPosition="top-center"
                      onClick={onDeploy}
                      style={styles.button}>
        <icons.tabs.Online />
      </mui.IconButton>

    </mui.ToolbarGroup>
  </mui.Toolbar>
);

Toolbar.propTypes = {
  vpanelProjectNames        : React.PropTypes.arrayOf(React.PropTypes.string.isRequired).isRequired,
  onNewImage                : React.PropTypes.func.isRequired,
  onNewWindow               : React.PropTypes.func.isRequired,
  onImportOnline            : React.PropTypes.func.isRequired,
  onOpenFileVPanelProject   : React.PropTypes.func.isRequired,
  onOpenOnlineVPanelProject : React.PropTypes.func.isRequired,
  onDeploy                  : React.PropTypes.func.isRequired
};

export default Toolbar;