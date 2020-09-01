import React, { FunctionComponent, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';

import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';

import { NewTabAction, TabType } from '../store/tabs/types';
import { newTab } from '../store/tabs/actions';

let idCounter = 0; // FIXME

const StartPage: FunctionComponent = () => {
  const { newTab } = useConnect();

  const newCoreDesigner = () => {
    const id = ++idCounter;
    newTab({
      id: `core-designer-${id}`,
      title: `Core designer ${id}`,
      type: TabType.CORE_DESIGNER,
      closable: true,
    });
  };

  return (
    <Box p={3}>
      <Typography>Démarrage</Typography>
      <Button onClick={newCoreDesigner}>Nouveau designer core</Button>
    </Box>
  );
};

export default StartPage;

function useConnect() {
  const dispatch = useDispatch();
  return useMemo(() => ({
    newTab: (payload: NewTabAction) => dispatch(newTab(payload)),
  }), [dispatch]);
}
