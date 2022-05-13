import React, { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';

import Actions from './actions';
import { ProjectIcon, WindowIcon, TemplateIcon, ResourceIcon, StyleIcon, ComponentIcon } from '../lib/icons';
import { SideBarList, SideBarDivider, Section, Item } from '../lib/sidebar-layout';
import { useSelection } from './selection';
import { useTabSelector } from '../lib/use-tab-selector';
import { AppState } from '../../store/types';
import { getWindowsIds, getWindow, getTemplatesIds, getTemplate } from '../../store/ui-designer/selectors';

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
        <Templates />
        <SideBarDivider />
        <Resources />
        <SideBarDivider />
        <Styles />
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

const Templates: FunctionComponent = () => {
  const { select } = useSelection();
  const templatesIds = useTabSelector(getTemplatesIds);
  return (
    <>
      <Section title="Templates" icon={TemplateIcon} onClick={() => select({ type: 'templates' })} />
      {templatesIds.map((id) => (
        <TemplateItem key={id} id={id} />
      ))}
    </>
  );
};

const TemplateItem: FunctionComponent<{ id: string; }> = ({ id }) => {
  const { select } = useSelection();
  const template = useSelector((state: AppState) => getTemplate(state, id));

  return (
    <Item title={template.templateId} icon={TemplateIcon} onClick={() => select({ type: 'template', id })} />
  );
};

const Resources: FunctionComponent = () => {
  const { select } = useSelection();
  return (
    <Section title="Ressources" icon={ResourceIcon} onClick={() => select({ type: 'resources' })} />
  );
};

const Styles: FunctionComponent = () => {
  const { select } = useSelection();
  return (
    <Section title="Styles" icon={StyleIcon} onClick={() => select({ type: 'styles' })} />
  );
};

const Components: FunctionComponent = () => {
  const { select } = useSelection();
  return (
    <Section title="Composants" icon={ComponentIcon} onClick={() => select({ type: 'components' })} />
  );
};
