import React, { FunctionComponent } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import Actions from './actions';
import { ProjectIcon, WindowIcon, ImageIcon, ComponentIcon } from '../lib/icons';
import { SideBarList, SideBarDivider, Section, Item } from '../lib/sidebar-layout';
import { useSelection } from './selection';
import { useTabSelector } from '../lib/use-tab-selector';
import { getWindowsIds } from '../../store/ui-designer/selectors';

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%'
  },
  list: {
    flex: 1
  },
  actions: {
  }
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

      <Actions className={classes.actions} />
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
        <Item key={id} title={id} icon={WindowIcon} onClick={() => select({ type: 'window', id })} />
      ))}
    </>
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
