import React, { FunctionComponent, createContext, useContext, useMemo, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useSelector } from 'react-redux';
import clsx from 'clsx';

import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import SvgIcon from '@material-ui/core/SvgIcon';
import MuiTreeView from '@material-ui/lab/TreeView';
import TreeItem from '@material-ui/lab/TreeItem';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';

import { InstanceIcon, PluginIcon, ComponentIcon, StateIcon } from '../lib/icons';

import { AppState } from '../../store/types';
import { getInstancesIds, getInstance, getPluginsIds, getPlugin, getComponentsIds, getComponent, getState } from '../../store/online-components-view/selectors';

export type NodeType = 'instance' | 'plugin' | 'component' | 'state';
export type OnNodeClick = (type: NodeType, id: string) => void;
export type Type = 'instances-plugins-components' | 'instances-components' | 'plugins-components' | 'components';

export type TreeViewProps = { type: Type; onNodeClick: OnNodeClick };

// TODO:
// flash on value change => https://github.com/JonnyBurger/use-color-change/blob/master/src/index.ts
// layout to properly scroll when treeview is too big
// tree values: use bold on important stuff, normal on not important (eg: state values, instance name on plugins)
// add tree icons by type

const TreeView: FunctionComponent<TreeViewProps> = ({ type, onNodeClick }) => {
  const config = useMemo(() => buildConfig(type), [type]);
  const nodeRepository = useMemo(() => new Map<string, { type: string; id: string }>() as NodeRepository, []);

  const [expanded, setExpanded] = React.useState<string[]>([]);
  const [selected, setSelected] = React.useState<string>(null);

  const handleToggle = (event: React.ChangeEvent, nodeIds: string[]) => {
    setExpanded(nodeIds);
  };

  const handleSelect = (event: React.ChangeEvent, nodeId: string) => {
    setSelected(nodeId);

    const { type, id } = nodeRepository.get(nodeId);
    onNodeClick(type, id);
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
    setSelected(null);
  }, [type]);

  return (
    <ConfigContext.Provider value={config}>
      <NodeRepositoryContext.Provider value={nodeRepository}>
        <Tooltip title="Replier tout">
          <IconButton onClick={handleCollapse}>
            <RemoveIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="Déplier le niveau suivant">
          <IconButton onClick={handleExpand}>
            <AddIcon />
          </IconButton>
        </Tooltip>

        <MuiTreeView
          defaultCollapseIcon={<ExpandMoreIcon />}
          defaultExpandIcon={<ChevronRightIcon />}
          expanded={expanded}
          selected={selected}
          onNodeToggle={handleToggle}
          onNodeSelect={handleSelect}
        >
          <Root />
        </MuiTreeView>
      </NodeRepositoryContext.Provider>
    </ConfigContext.Provider>
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
  const nodeId = `${type}$${id}`;

  useEffect(() => {
    repository.set(nodeId, { type, id });
    return () => {
      repository.delete(nodeId);
    };
  }, [type, id]);

  return nodeId;
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
        <LabelContainer flashing={false}>
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
        <LabelContainer flashing={false}>
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
        <LabelContainer flashing={false}>
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
        <LabelContainer flashing={false}>
          <LabelIcon type="state" />
          <LabelPart bold>{state.name}</LabelPart>
          <LabelPart>{` = ${JSON.stringify(state.value)}`}</LabelPart>
        </LabelContainer>
      }
    />
  );
};

const useLabelStyles = makeStyles((theme) => ({
  container: {
    display: 'flex'
  },
  flashing: {},
  icon: {
    marginRight: theme.spacing(3)
  },
  part: {
    marginRight: theme.spacing(1)
  },
  bold: {
    fontWeight: 'bold'
  },
}));

const ICONS_BY_TYPE: { [type in NodeType]: typeof SvgIcon } = {
  instance: InstanceIcon,
  plugin: PluginIcon,
  component: ComponentIcon,
  state: StateIcon,
};

const LabelContainer: FunctionComponent<{ flashing: boolean }> = ({ flashing, children }) => {
  const classes = useLabelStyles();
  return <div className={clsx(classes.container, { [classes.flashing]: flashing })}>{children}</div>;
};

const LabelIcon: FunctionComponent<{ type: NodeType }> = ({ type }) => {
  const classes = useLabelStyles();
  const Icon = ICONS_BY_TYPE[type];

  return <Icon className={classes.icon} />;
};

const LabelPart: FunctionComponent<{ bold?: boolean }> = ({ bold = false, children }) => {
  const classes = useLabelStyles();
  return <Typography className={clsx(classes.part, { [classes.bold]: bold })}>{children}</Typography>;
};
