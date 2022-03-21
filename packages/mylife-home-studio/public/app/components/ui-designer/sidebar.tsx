import React, { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';

import Actions from './actions';
import { ProjectIcon, WindowIcon, ImageIcon, ComponentIcon } from '../lib/icons';
import { SideBarList, SideBarDivider, Section, Item } from '../lib/sidebar-layout';
import { useSelection } from './selection';
import { useTabSelector } from '../lib/use-tab-selector';
import { AppState } from '../../store/types';
import { getWindowsIds, getWindow } from '../../store/ui-designer/selectors';

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%'
  },
  list: {
    flex: 1
  },
}));

const SideBar: FunctionComponent = () => {
  const classes = useStyles();
  return (
    <div className={classes.container}>

      <SideBarList className={classes.list}>
        <Project />
        <SideBarDivider />
        <Windows />
        <SideBarDivider />
        <Resources />
        <SideBarDivider />
        <Components />
      </SideBarList>

      <SideBarDivider />
      <Actions />
    </div>
  );
};

export default SideBar;

const Project: FunctionComponent = () => {
  const { select } = useSelection();
  return (
    <Section title="Projet" icon={ProjectIcon} onClick={() => select({ type: 'project' })} />
  );
};

const Windows: FunctionComponent = () => {
  const { select } = useSelection();
  const windowsIds = useTabSelector(getWindowsIds);
  return (
    <>
      <Section title="Fenêtres" icon={WindowIcon} onClick={() => select({ type: 'windows' })} />
      {windowsIds.map((id) => (
        <WindowItem key={id} id={id} />
      ))}
    </>
  );
};

const WindowItem: FunctionComponent<{ id: string; }> = ({ id }) => {
  const { select } = useSelection();
  const window = useSelector((state: AppState) => getWindow(state, id));

  return (
    <Item title={window.windowId} icon={WindowIcon} onClick={() => select({ type: 'window', id })} />
  );
};

const Resources: FunctionComponent = () => {
  const { select } = useSelection();
  return (
    <Section title="Ressources" icon={ImageIcon} onClick={() => select({ type: 'resources' })} />
  );
};

const Components: FunctionComponent = () => {
  const { select } = useSelection();
  return (
    <Section title="Composants" icon={ComponentIcon} onClick={() => select({ type: 'components' })} />
  );
};
