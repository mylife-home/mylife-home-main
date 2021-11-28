import React, { FunctionComponent, useCallback } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useSelector, useDispatch } from 'react-redux';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import SyncIcon from '@material-ui/icons/Sync';
import SyncProblemIcon from '@material-ui/icons/SyncProblem';

import { AppState } from '../../store/types';
import { getInstanceInfo } from '../../store/online-instances-view/selectors';
import { executeSystemRestart } from '../../store/online-instances-view/actions';

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex'
  }
}));

const Actions: FunctionComponent<{ instanceName: string }> = ({ instanceName }) => {
  const classes = useStyles();
  const instanceInfo = useInstanceInfo(instanceName)
  const executeSystemRestart = useExecuteSystemRestart(instanceName);

  if (!instanceInfo) {
    return null;
  }

  return (
    <div className={classes.container}>
      {instanceInfo.capabilities.includes('restart-api') && (
        <>
          <Tooltip title="Redémarrer">
            <IconButton onClick={() => executeSystemRestart(false)}>
              <SyncIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Redémarrer en mode sans échec">
            <IconButton onClick={() => executeSystemRestart(true)}>
              <SyncProblemIcon />
            </IconButton>
          </Tooltip>
        </>
      )}
    </div>
  );
};

export default Actions;

function useInstanceInfo(instanceName: string) {
  return useSelector((appState: AppState) => getInstanceInfo(appState, instanceName));
}

function useExecuteSystemRestart(instanceName: string) {
  const dispatch = useDispatch();
  return useCallback((failSafe: boolean) => dispatch(executeSystemRestart({ instanceName, failSafe })), [dispatch, instanceName]);
}
