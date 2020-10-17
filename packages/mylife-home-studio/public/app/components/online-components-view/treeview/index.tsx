import React, { FunctionComponent, createContext, useContext, useMemo, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useSelector } from 'react-redux';
import clsx from 'clsx';
import { AutoSizer } from 'react-virtualized';
import Divider from '@material-ui/core/Divider';
import MuiTreeView from '@material-ui/lab/TreeView';
import TreeItem from '@material-ui/lab/TreeItem';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';

import { AppState } from '../../../store/types';
import { getInstancesIds, getInstance, getPluginsIds, getPlugin, getComponentsIds, getComponent, getState } from '../../../store/online-components-view/selectors';
import { NodeType, Selection } from '../types';
import { Type } from './types';
import TypeSelector from './type-selector';
import Actions from './actions';
import { LabelContainer, LabelIcon, LabelPart } from './label';

export type OnNodeClick = (type: NodeType, id: string) => void;

export interface TreeViewProps {
  className?: string;
  selection: Selection;
  onSelect: (selection: Selection) => void;
}

// TODO:
// flash on value change => https://github.com/JonnyBurger/use-color-change/blob/master/src/index.ts
// https://github.com/thomasnordquist/MQTT-Explorer/blob/master/app/src/components/Tree/TreeNode/effects/useAnimationToIndicateTopicUpdate.tsx

const useStyles = makeStyles((theme) => ({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
  },
  typeSelector: {},
  actions: {},
  treeContainer: {
    flex: '1 1 auto',
  },
  tree: {
    overflowY: 'auto',
  },
}));

const TreeView: FunctionComponent<TreeViewProps> = ({ className, selection, onSelect }) => {
  const [type, setType] = React.useState<Type>('instances-plugins-components');
  const [expanded, setExpanded] = React.useState<string[]>([]);

  const config = useMemo(() => buildConfig(type), [type]);
  const nodeRepository = useMemo(() => new Map<string, { type: string; id: string }>() as NodeRepository, []);

  const classes = useStyles();

  const handleToggle = (event: React.ChangeEvent, nodeIds: string[]) => {
    setExpanded(nodeIds);
  };

  const selected = selection ? makeNodeId(selection.type, selection.id) : null;

  const handleSelect = (event: React.ChangeEvent, nodeId: string) => {
    const { type, id } = nodeRepository.get(nodeId);
    onSelect({ type, id });
  };

  const handleCollapse = () => {
    setExpanded([]);
  };

  // only next sub-level of nodes are loaded
  // so expand all will only expand the next level
  const handleExpand = () => {
    setExpanded(Array.from(nodeRepository.keys()));
  };

  useEffect(() => {
    setExpanded([]);
    onSelect(null);
  }, [type]);

  return (
    <div className={clsx(classes.container, className)}>
      <TypeSelector type={type} setType={setType} className={classes.typeSelector} />
      <Actions className={classes.actions} onCollapse={handleCollapse} onExpand={handleExpand} />

      <Divider />

      <div className={classes.treeContainer}>
        <AutoSizer>
          {({ height, width }) => (
            <ConfigContext.Provider value={config}>
              <NodeRepositoryContext.Provider value={nodeRepository}>
                <MuiTreeView
                  style={{ height, width }}
                  defaultCollapseIcon={<ExpandMoreIcon />}
                  defaultExpandIcon={<ChevronRightIcon />}
                  expanded={expanded}
                  selected={selected}
                  onNodeToggle={handleToggle}
                  onNodeSelect={handleSelect}
                  className={classes.tree}
                >
                  <Root />
                </MuiTreeView>
              </NodeRepositoryContext.Provider>
            </ConfigContext.Provider>
          )}
        </AutoSizer>
      </div>
    </div>
  );
};

export default TreeView;

interface Config {
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

const ConfigContext = createContext<Config>(null);

function buildConfig(type: Type) {
  switch (type) {
    case 'instances-plugins-components':
      return {
        root: 'instances',
        instance: { components: false, plugins: true },
        plugin: { components: true },
        component: { plugin: false, states: true },
      } as Config;

    case 'instances-components':
      return {
        root: 'instances',
        instance: { components: true, plugins: false },
        plugin: { components: false },
        component: { plugin: true, states: true },
      } as Config;

    case 'plugins-components':
      return {
        root: 'plugins',
        instance: { components: false, plugins: false },
        plugin: { components: true },
        component: { plugin: false, states: true },
      } as Config;

    case 'components':
      return {
        root: 'components',
        instance: { components: false, plugins: false },
        plugin: { components: false },
        component: { plugin: true, states: true },
      } as Config;
  }
}

type NodeRepository = Map<string, { type: NodeType; id: string }>;

const NodeRepositoryContext = createContext<NodeRepository>(null);

function useNode(type: NodeType, id: string) {
  const repository = useContext(NodeRepositoryContext);
  const nodeId = makeNodeId(type, id);

  useEffect(() => {
    repository.set(nodeId, { type, id });
    return () => {
      repository.delete(nodeId);
    };
  }, [type, id]);

  return nodeId;
}

function makeNodeId(type: NodeType, id: string) {
  return `${type}$${id}`;
}

const Root: FunctionComponent = () => {
  const { root } = useContext(ConfigContext);
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
  const nodeId = useNode('instance', id);
  const { instance: config } = useContext(ConfigContext);
  const instance = useSelector((state: AppState) => getInstance(state, id));

  return (
    <TreeItem
      nodeId={nodeId}
      label={
        <LabelContainer>
          <LabelIcon type="instance" />
          <LabelPart bold>{instance.display}</LabelPart>
        </LabelContainer>
      }
    >
      {config.plugins && instance.plugins.map((id) => <Plugin key={id} id={id} />)}
      {config.components && instance.components.map((id) => <Component key={id} id={id} />)}
    </TreeItem>
  );
};

const Plugin: FunctionComponent<{ id: string }> = ({ id }) => {
  const nodeId = useNode('plugin', id);
  const { plugin: config, root } = useContext(ConfigContext);
  const plugin = useSelector((state: AppState) => getPlugin(state, id));

  return (
    <TreeItem
      nodeId={nodeId}
      label={
        <LabelContainer>
          <LabelIcon type="plugin" />
          {root !== 'instances' && <LabelPart>{`${plugin.instance} - `}</LabelPart>}
          <LabelPart bold>{plugin.display}</LabelPart>
        </LabelContainer>
      }
    >
      {config.components && plugin.components.map((id) => <Component key={id} id={id} />)}
    </TreeItem>
  );
};

const Component: FunctionComponent<{ id: string }> = ({ id }) => {
  const nodeId = useNode('component', id);
  const { component: config } = useContext(ConfigContext);
  const component = useSelector((state: AppState) => getComponent(state, id));

  return (
    <TreeItem
      nodeId={nodeId}
      label={
        <LabelContainer>
          <LabelIcon type="component" />
          <LabelPart bold>{component.display}</LabelPart>
        </LabelContainer>
      }
    >
      {config.plugin && <Plugin id={component.plugin} />}
      {config.states && component.states.map((id) => <State key={id} id={id} />)}
    </TreeItem>
  );
};

const State: FunctionComponent<{ id: string }> = ({ id }) => {
  const nodeId = useNode('state', id);
  const state = useSelector((state: AppState) => getState(state, id));

  return (
    <TreeItem
      nodeId={nodeId}
      label={
        <LabelContainer>
          <LabelIcon type="state" />
          <LabelPart bold>{state.name}</LabelPart>
          <LabelPart flashing>{` = ${JSON.stringify(state.value)}`}</LabelPart>
        </LabelContainer>
      }
    />
  );
};
