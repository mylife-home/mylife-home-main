import React, { FunctionComponent } from 'react';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary'
import { makeStyles } from '@material-ui/core/styles';

import { useTabSelector } from '../lib/use-tab-selector';
import StartPage from '../start-page';
import CoreDesigner from '../core-designer';
import UiDesigner from '../ui-designer';
import OnlineComponentsView from '../online-components-view';
import OnlineHistory from '../online-history';
import OnlineInstancesView from '../online-instances-view';
import OnlineLogs from '../online-logs';
import Deploy from '../deploy';
import { DialogText } from '../dialogs/common';

import { TabType } from '../../store/tabs/types';
import { getTab } from '../../store/tabs/selectors';

const Panel: FunctionComponent = () => (
  <ErrorBoundary FallbackComponent={ErrorFallback}>
    <UnsafePanel />
  </ErrorBoundary>
);

export default Panel;

const UnsafePanel: FunctionComponent = () => {
  const tab = useTabSelector(getTab);

  switch(tab.type) {
    case TabType.START_PAGE:
      return (<StartPage />);
    case TabType.CORE_DESIGNER:
      return (<CoreDesigner />);
    case TabType.UI_DESIGNER:
      return (<UiDesigner />);
    case TabType.ONLINE_COMPONENTS_VIEW:
      return (<OnlineComponentsView />);
    case TabType.ONLINE_HISTORY:
      return (<OnlineHistory />);
    case TabType.ONLINE_INSTANCES_VIEW:
      return (<OnlineInstancesView />);
    case TabType.ONLINE_LOGS:
      return (<OnlineLogs />);
    case TabType.DEPLOY:
      return (<Deploy />);
  }
};


const useStyles = makeStyles((theme) => ({
  errorContainer: {
    marginTop: theme.spacing(8),
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorWrapper: {
    color: theme.palette.error.main,
  },
}));

const ErrorFallback: FunctionComponent<FallbackProps> = ({ error }) => {
  const classes = useStyles();

  return (
    <div className={classes.errorContainer}>
      <div className={classes.errorWrapper}>
        <DialogText value={error.stack} />
      </div>
    </div>
  );
};