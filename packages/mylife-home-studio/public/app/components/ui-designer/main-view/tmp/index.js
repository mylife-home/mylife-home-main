'use strict';

import React from 'react';
import * as mui from 'material-ui';
import * as bs from 'react-bootstrap';

import PropertiesContainer from '../../containers/ui-project-tab/properties-container';
import ExplorerContainer from '../../containers/ui-project-tab/explorer-container';
import DialogConfirmImportComponents from '../../containers/ui-project-tab/dialog-confirm-import-components';
import Toolbox from './toolbox';
import CanvasContainer from '../../containers/ui-project-tab/canvas-container';
import TitleContainer from '../../containers/ui-project-tab/title-container';

import tabStyles from '../base/tab-styles';

const styles = {
  explorerHeight : {
    height: 'calc(100% - 144px)'
  }
};

const UiProjectTab = ({ project, onTabClosed }) => (
  <div style={Object.assign({}, tabStyles.fullHeight)}>
    <bs.Grid fluid={true} style={Object.assign({}, tabStyles.fullHeight)}>
      <bs.Row style={tabStyles.fullHeight}>
        <bs.Col sm={2} style={Object.assign({}, tabStyles.noPadding, tabStyles.fullHeight)}>
          <div style={tabStyles.fullHeight}>
            <mui.Paper>
              <Toolbox project={project} />
            </mui.Paper>
            <mui.Paper style={Object.assign({}, tabStyles.scrollable, styles.explorerHeight)}>
              <ExplorerContainer project={project.uid}/>
            </mui.Paper>
          </div>
        </bs.Col>
        <bs.Col sm={8} style={Object.assign({}, tabStyles.noPadding, tabStyles.scrollable, tabStyles.fullHeight)}>
          <div style={Object.assign({marginTop: '-10px' /* WTF ?! */}, tabStyles.noPadding, tabStyles.fullHeight)}>
            <TitleContainer project={project.uid} onTabClosed={onTabClosed} />
            <CanvasContainer project={project.uid} />
          </div>
        </bs.Col>
        <bs.Col sm={2} style={Object.assign({}, tabStyles.noPadding, tabStyles.fullHeight)}>
          <mui.Paper style={Object.assign({}, tabStyles.scrollable, tabStyles.fullHeight)}>
            <PropertiesContainer project={project.uid} />
          </mui.Paper>
        </bs.Col>
      </bs.Row>
    </bs.Grid>

    <DialogConfirmImportComponents project={project.uid}/>
  </div>
);

UiProjectTab.propTypes = {
  project: React.PropTypes.object.isRequired,
  onTabClosed: React.PropTypes.func.isRequired
};

export default UiProjectTab;
