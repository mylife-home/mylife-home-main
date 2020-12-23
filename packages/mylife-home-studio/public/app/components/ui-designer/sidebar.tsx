import React, { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

import { ProjectIcon, WindowIcon, ImageIcon, ComponentIcon } from '../lib/icons';
import { SideBarList, SideBarDivider, Section, Item } from '../lib/sidebar-layout';
import { useSelection } from './selection';
import { useTabPanelId } from '../lib/tab-panel';
import { AppState } from '../../store/types';
import { getWindowsIds } from '../../store/ui-designer/selectors';

const SideBar: FunctionComponent = () => {
  return (
    <SideBarList>
      <Project />
      <SideBarDivider />
      <Windows />
      <SideBarDivider />
      <Resources />
      <SideBarDivider />
      <Components />
    </SideBarList>
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
  const tabId = useTabPanelId();
  const windowsIds = useSelector((state: AppState) => getWindowsIds(state, tabId));
  return (
    <>
      <Section title="Recettes" icon={WindowIcon} onClick={() => select({ type: 'windows' })} />
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
