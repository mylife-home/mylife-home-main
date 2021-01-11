import React, { FunctionComponent, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

import { Container, Title } from '../../lib/main-view-layout';
import { ProjectIcon } from '../../lib/icons';
import { useTabPanelId } from '../../lib/tab-panel';
import { AppState } from '../../../store/types';
import { getDefaultWindow } from '../../../store/ui-designer/selectors';
import { setDefaultWindow } from '../../../store/ui-designer/actions';
import { DefaultWindow } from '../../../../../shared/ui-model';
import WindowSelector from './common/window-selector';

const useStyles = makeStyles((theme) => ({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,

    display: 'flex',
    flexDirection: 'column',
  },
  group: {
    margin: theme.spacing(3),
    display: 'flex',
    flexDirection: 'column',
  },
  item: {
    margin: theme.spacing(1),
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemTitle: {
    width: 80,
  }
}));

const Project: FunctionComponent = () => {
  const classes = useStyles();
  const { defaultWindow, updateDefaultWindow } = useProjectConnect();
  
  return (
    <Container
      title={
        <Title text="Projet" icon={ProjectIcon} />
      }
    >
      <div className={classes.wrapper}>

        <Group title={"Fenêtre par défaut"}>
          <Item title={"Desktop"}>
            <WindowSelector value={defaultWindow.desktop} onChange={id => updateDefaultWindow('desktop', id)} />
          </Item>
          <Item title={"Mobile"}>
            <WindowSelector value={defaultWindow.mobile} onChange={id => updateDefaultWindow('mobile', id)} />
          </Item>
        </Group>
      </div>
    </Container>
  );
};

export default Project;

const Group: FunctionComponent<{ title: string }> = ({ title, children }) => {
  const classes = useStyles();

  return (
    <div className={classes.group}>
      <Typography variant="h6">{title}</Typography>
      {children}
    </div>
  );
};

const Item: FunctionComponent<{ title: string }> = ({title, children }) => {
  const classes = useStyles();

  return (
    <div className={classes.item}>
      <Typography className={classes.itemTitle}>{title}</Typography>
      {children}
    </div>
  );
}

function useProjectConnect() {
  const tabId = useTabPanelId();
  const defaultWindow = useSelector((state: AppState) => getDefaultWindow(state, tabId));
  const dispatch = useDispatch();

  const updateDefaultWindow = useCallback((type: string, windowId: string) => {
    const newDefaultWindow: DefaultWindow = { ...defaultWindow, [type]: windowId };
    dispatch(setDefaultWindow({ id: tabId, defaultWindow: newDefaultWindow }));
  }, [defaultWindow, dispatch]);

  return { defaultWindow, tabId, updateDefaultWindow };
}