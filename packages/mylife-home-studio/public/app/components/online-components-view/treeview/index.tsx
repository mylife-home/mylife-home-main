import React, { FunctionComponent, useContext, useMemo, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { AutoSizer } from 'react-virtualized';
import Divider from '@material-ui/core/Divider';
import MuiTreeView from '@material-ui/lab/TreeView';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';

import { NodeType, Selection } from '../common';
import { ConfigContext, makeNodeId, NodeRepository, NodeRepositoryContext, Type, Config } from './common';
import TypeSelector from './type-selector';
import Actions from './actions';
import { Instances, Plugins, Components } from './nodes';

export type OnNodeClick = (type: NodeType, id: string) => void;

export interface TreeViewProps {
  className?: string;
  selection: Selection;
  onSelect: (selection: Selection) => void;
}

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

function buildConfig(type: Type): Config {
  switch (type) {
    case 'instances-plugins-components':
      return {
        root: 'instances',
        instance: { components: false, plugins: true },
        plugin: { components: true },
        component: { plugin: false, states: true },
      };

    case 'instances-components':
      return {
        root: 'instances',
        instance: { components: true, plugins: false },
        plugin: { components: false },
        component: { plugin: true, states: true },
      };

    case 'plugins-components':
      return {
        root: 'plugins',
        instance: { components: false, plugins: false },
        plugin: { components: true },
        component: { plugin: false, states: true },
      };

    case 'components':
      return {
        root: 'components',
        instance: { components: false, plugins: false },
        plugin: { components: false },
        component: { plugin: true, states: true },
      };
  }
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
