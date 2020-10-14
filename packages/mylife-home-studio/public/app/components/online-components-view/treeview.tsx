import React, { FunctionComponent, createContext, useContext, useMemo } from 'react';
import { useSelector } from 'react-redux';

import MuiTreeView from '@material-ui/lab/TreeView';
import TreeItem from '@material-ui/lab/TreeItem';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';

import { AppState } from '../../store/types';
import { getInstancesIds, getInstance, getPluginsIds, getPlugin, getComponentsIds, getComponent, getState } from '../../store/online-components-view/selectors';

export type OnNodeClick = (type: 'instance' | 'plugin' | 'component' | 'state', id: string) => void;
export type Type = 'instances-plugins-components' | 'instances-components' | 'plugins-components' | 'components';

export type TreeViewProps = { type: Type; onNodeClick: OnNodeClick };

const TreeView: FunctionComponent<TreeViewProps> = ({ type, onNodeClick }) => {
  const config = useMemo(() => {
    switch (type) {
      case 'instances-plugins-components':
        return {
          onNodeClick,
          root: 'instances',
          instance: { components: false, plugins: true },
          plugin: { components: true },
          component: { plugin: false, states: true },
        } as TreeViewConfig;

      case 'instances-components':
        return {
          onNodeClick,
          root: 'instances',
          instance: { components: true, plugins: false },
          plugin: { components: false },
          component: { plugin: true, states: true },
        } as TreeViewConfig;

      case 'plugins-components':
        return {
          onNodeClick,
          root: 'plugins',
          instance: { components: false, plugins: false },
          plugin: { components: true },
          component: { plugin: false, states: true },
        } as TreeViewConfig;

      case 'components':
        return {
          onNodeClick,
          root: 'components',
          instance: { components: false, plugins: false },
          plugin: { components: false },
          component: { plugin: true, states: true },
        } as TreeViewConfig;
    }
  }, [type, onNodeClick]);

  return (
    <TreeViewConfigContext.Provider value={config}>
      <MuiTreeView defaultCollapseIcon={<ExpandMoreIcon />} defaultExpandIcon={<ChevronRightIcon />}>
        <Root />
      </MuiTreeView>
    </TreeViewConfigContext.Provider>
  );
};

export default TreeView;

interface TreeViewConfig {
  onNodeClick: OnNodeClick;

  root: 'instances' | 'plugins' | 'components';

  instance: {
    components: boolean;
    plugins: boolean;
  };

  plugin: {
    components: boolean;
  };

  component: {
    plugin: boolean;
    states: boolean;
  };
}

export const TreeViewConfigContext = createContext<TreeViewConfig>(null);

const Root: FunctionComponent = () => {
  const { root } = useContext(TreeViewConfigContext);
  switch (root) {
    case 'instances':
      return <Instances />;
    case 'plugins':
      return <Plugins />;
    case 'components':
      return <Components />;
  }
};

const Instances: FunctionComponent = () => {
  const instancesIds = useSelector(getInstancesIds);
  return (
    <>
      {instancesIds.map((id) => (
        <Instance key={id} id={id} />
      ))}
    </>
  );
};

const Plugins: FunctionComponent = () => {
  const pluginsIds = useSelector(getPluginsIds);
  return (
    <>
      {pluginsIds.map((id) => (
        <Plugin key={id} id={id} />
      ))}
    </>
  );
};

const Components: FunctionComponent = () => {
  const componentsIds = useSelector(getComponentsIds);
  return (
    <>
      {componentsIds.map((id) => (
        <Component key={id} id={id} />
      ))}
    </>
  );
};

const Instance: FunctionComponent<{ id: string }> = ({ id }) => {
  const { onNodeClick, instance: config } = useContext(TreeViewConfigContext);
  const instance = useSelector((state: AppState) => getInstance(state, id));

  return (
    <TreeItem nodeId={id} label={instance.instanceName} onClick={() => onNodeClick('instance', id)}>
      {config.plugins && instance.plugins.map((id) => <Plugin key={id} id={id} />)}
      {config.components && instance.components.map((id) => <Component key={id} id={id} />)}
    </TreeItem>
  );
};

const Plugin: FunctionComponent<{ id: string }> = ({ id }) => {
  const { onNodeClick, plugin: config } = useContext(TreeViewConfigContext);
  const plugin = useSelector((state: AppState) => getPlugin(state, id));

  return (
    <TreeItem nodeId={id} label={plugin.id} onClick={() => onNodeClick('plugin', id)}>
      {config.components && plugin.components.map((id) => <Component key={id} id={id} />)}
    </TreeItem>
  );
};

const Component: FunctionComponent<{ id: string }> = ({ id }) => {
  const { onNodeClick, component: config } = useContext(TreeViewConfigContext);
  const component = useSelector((state: AppState) => getComponent(state, id));

  return (
    <TreeItem nodeId={id} label={component.id} onClick={() => onNodeClick('component', id)}>
      {config.plugin && <Plugin id={component.plugin} />}
      {config.states && component.states.map((id) => <State key={id} id={id} />)}
    </TreeItem>
  );
};

const State: FunctionComponent<{ id: string }> = ({ id, children }) => {
  const { onNodeClick } = useContext(TreeViewConfigContext);
  const state = useSelector((state: AppState) => getState(state, id));

  return <TreeItem nodeId={id} label={`${state.name} = ${JSON.stringify(state.value)}`} onClick={() => onNodeClick('state', id)} />;
};
