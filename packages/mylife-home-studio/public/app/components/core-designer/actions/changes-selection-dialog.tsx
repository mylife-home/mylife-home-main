import React, { FunctionComponent, useCallback, useState, useMemo, useEffect, createContext, useContext } from 'react';
import { useModal } from 'react-modal-hook';
import { makeStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Collapse from '@material-ui/core/Collapse';
import Checkbox from '@material-ui/core/Checkbox';
import Typography from '@material-ui/core/Typography';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';

import { ConfirmResult } from '../../dialogs/confirm';
import { TransitionProps, DialogText } from '../../dialogs/common';
import { coreImportData } from '../../../store/core-designer/types';

interface StatsItem {
  selected: number;
  unselected: number;
}

interface Node {
  type: 'root' | 'objectType' | 'instanceName' | 'changeType' | 'change';
}

interface NodeWithChildren extends Node {
  type: 'root' | 'objectType' | 'instanceName' | 'changeType';
  children: string[];
}

interface RootNode extends NodeWithChildren {
  type: 'root';
}

interface ObjectTypeNode extends NodeWithChildren {
  type: 'objectType';
  objectType: coreImportData.ObjectType;
}

interface InstanceNameNode extends NodeWithChildren {
  type: 'instanceName';
  instanceName: string;
}

interface ChangeTypeNode extends NodeWithChildren {
  type: 'changeType';
  changeType: coreImportData.ChangeType;
}

interface ChangeNode extends Node {
  type: 'change';
  change: string; // key
}

type Type = 'instances-objectTypes' | 'objectTypes-instances' | 'objectTypes';

// key is change key
type SelectionSet = { [key: string]: boolean };

// data model is immutable
interface DataModel {
  // root nodes have keys: byInstancesObjectTypes, byObjectTypesInstances, byObjectTypes
  nodes: { [key: string]: Node };
  changes: { [key: string]: coreImportData.ObjectChange };
}

// key is node key
type StatsSet = { [key: string]: StatsItem };

interface TreeContextProps {
  model: DataModel;
  stats: StatsSet;
  selection: SelectionSet;
  setSelected: (key: string, selected: boolean) => void;
}

const TreeContext = createContext<TreeContextProps>(null);

const useStyles = makeStyles((theme) => ({
  list: {
    height: '50vh',
    overflowY: 'auto',
    border: `1px solid ${theme.palette.divider}`,
  },
  changeSetItem: {},
  changeTypeItem: {
    paddingLeft: theme.spacing(4),
  },
  changeItem: {
    paddingLeft: theme.spacing(8),
  },
  changeDetailsContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
}));

type ChangesDialogResult = ConfirmResult & { selection?: string[] };

type TriState = 'unchecked' | 'checked' | 'indeterminate';

export function useShowChangesDialog() {
  const classes = useStyles();
  const [changes, setChanges] = useState<coreImportData.ObjectChange[]>();
  const [onResult, setOnResult] = useState<(value: ChangesDialogResult) => void>();

  const [showModal, hideModal] = useModal(
    ({ in: open, onExited }: TransitionProps) => {
      const [selection, setSelection] = useState(() => initSelection(changes));
      const [type, setType] = useState<Type>('instances-objectTypes');

      const treeContext: TreeContextProps = useMemo(() => {
        const model = buildDataModel(changes);
        const stats = computeStats(model, selection);

        const setSelected = (node: string, selected: boolean) => {
          console.log('setSelected', node, selected);
        };
        
        return { model, stats, selection, setSelected };
      }, [changes, selection]);

      const cancel = () => {
        hideModal();
        onResult({ status: 'cancel' });
      };

      const validate = () => {
        hideModal();
        onResult({ status: 'ok', selection: formatSelection(selection) });
      };

      // const setSelected = useCallback((partial: SelectionSet) => setSelection((selection) => ({ ...selection, ...partial })), [setSelection]);

      const handleKeyDown = (e: React.KeyboardEvent) => {
        switch (e.key) {
          case 'Enter':
            validate();
            break;

          case 'Escape':
            cancel();
            break;
        }
      };

      return (
        <Dialog aria-labelledby="dialog-title" open={open} onExited={onExited} onClose={cancel} scroll="paper" maxWidth="lg" fullWidth onKeyDown={handleKeyDown}>
          <DialogTitle id="dialog-title">Changements engendrés</DialogTitle>

          <DialogContent dividers>
            <DialogText value={'Sélectionnez les changements à apporter au projet :'} />

            <TypeSelector type={type} setType={setType} />

            <TreeContext.Provider value={treeContext}>
              <List className={classes.list}>
                {/*
                <ChangeSetItem
                  type="plugins"
                  stats={stats.plugins}
                  changes={changes.filter((change) => change.objectType === 'plugin') as coreImportData.PluginChange[]}
                  selection={selection}
                  setSelected={setSelected}
                />
                <ChangeSetItem
                  type="components"
                  stats={stats.components}
                  changes={changes.filter((change) => change.objectType === 'component') as coreImportData.ComponentChange[]}
                  selection={selection}
                  setSelected={setSelected}
                />
                */}
              </List>
            </TreeContext.Provider>
          </DialogContent>

          <DialogActions>
            <Button color="primary" onClick={validate}>
              OK
            </Button>
            <Button onClick={cancel}>Annuler</Button>
          </DialogActions>
        </Dialog>
      );
    },
    [changes, onResult]
  );

  return useCallback(
    (changes: coreImportData.ObjectChange[]) =>
      new Promise<ChangesDialogResult>((resolve) => {
        setChanges(changes);
        setOnResult(() => resolve); // else useState think resolve is a state updater

        showModal();
      }),
    [setChanges, setOnResult, showModal]
  );
}

const TypeSelector: FunctionComponent<{ type: Type; setType: (type: Type) => void }> = ({ type, setType }) => {
  const handleTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setType(event.target.value as Type);
  };

  return (
    <RadioGroup value={type} onChange={handleTypeChange} row>
      <FormControlLabel value="instances-objectTypes" control={<Radio color="primary" />} label="instances / plugins-composants" />
      <FormControlLabel value="objectTypes-instances" control={<Radio color="primary" />} label="plugins-composants / instances" />
      <FormControlLabel value="objectTypes" control={<Radio color="primary" />} label="plugins-composants" />
    </RadioGroup>
  );
};

interface WithSelectionProps {
  selection: SelectionSet;
  setSelected: (partial: SelectionSet) => void;
}

/*

interface BaseChangeSetProps extends WithSelectionProps {
  stats: ChangeSetStats;
}

interface PluginChangeSetProps extends BaseChangeSetProps {
  type: 'plugins';
  changes: coreImportData.PluginChange[];
}

interface ComponentChangeSetProps extends BaseChangeSetProps {
  type: 'components';
  changes: coreImportData.ComponentChange[];
}

const TITLES = {
  plugins: 'Plugins',
  components: 'Composants',
};

const ChangeSetItem: FunctionComponent<PluginChangeSetProps | ComponentChangeSetProps> = ({ stats, selection, setSelected, ...typeAndChanges }) => {
  // keep typeAndChanges together to keep their type links
  const classes = useStyles();
  const title = TITLES[typeAndChanges.type];

  // we need that to keep typing
  switch (typeAndChanges.type) {
    case 'plugins':
      return (
        <ItemWithChildren className={classes.changeSetItem} title={title} stats={stats.total}>
          <ChangeTypeItem
            stats={stats.adds}
            changes={typeAndChanges.changes.filter((change) => change.changeType === 'add')}
            title="Ajouts"
            type={typeAndChanges.type}
            selection={selection}
            setSelected={setSelected}
          />
          <ChangeTypeItem
            stats={stats.updates}
            changes={typeAndChanges.changes.filter((change) => change.changeType === 'update')}
            title="Modifications"
            type={typeAndChanges.type}
            selection={selection}
            setSelected={setSelected}
          />
          <ChangeTypeItem
            stats={stats.deletes}
            changes={typeAndChanges.changes.filter((change) => change.changeType === 'delete')}
            title="Suppressions"
            type={typeAndChanges.type}
            selection={selection}
            setSelected={setSelected}
          />
        </ItemWithChildren>
      );

    case 'components':
      return (
        <ItemWithChildren className={classes.changeSetItem} title={title} stats={stats.total}>
          <ChangeTypeItem
            stats={stats.adds}
            changes={typeAndChanges.changes.filter((change) => change.changeType === 'add')}
            title="Ajouts"
            type={typeAndChanges.type}
            selection={selection}
            setSelected={setSelected}
          />
          <ChangeTypeItem
            stats={stats.updates}
            changes={typeAndChanges.changes.filter((change) => change.changeType === 'update')}
            title="Modifications"
            type={typeAndChanges.type}
            selection={selection}
            setSelected={setSelected}
          />
          <ChangeTypeItem
            stats={stats.deletes}
            changes={typeAndChanges.changes.filter((change) => change.changeType === 'delete')}
            title="Suppressions"
            type={typeAndChanges.type}
            selection={selection}
            setSelected={setSelected}
            isDelete
          />
        </ItemWithChildren>
      );
  }
};

interface BaseChangeTypeProps extends WithSelectionProps {
  stats: StatsItem;
  title: string;
}

interface PluginChangeTypeProps extends BaseChangeTypeProps {
  type: 'plugins';
  changes: coreImportData.PluginChange[];
}

interface ComponentChangeTypeProps extends BaseChangeTypeProps {
  type: 'components';
  changes: coreImportData.ComponentChange[];

  // used to manage dependencies: On delete, the component is check-forced if plugin deletion is checked else on add/update it is uncheck-forced if plugin is not checked
  isDelete?: boolean;
}

const ChangeTypeItem: FunctionComponent<PluginChangeTypeProps | ComponentChangeTypeProps> = ({ stats, selection, setSelected, title, ...typeAndChanges }) => {
  // keep typeAndChanges together to keep their type links
  const classes = useStyles();

  const checkState = getTriState(stats);

  const onCheckChange = () => {
    switch (checkState) {
      case 'indeterminate':
      case 'unchecked':
        setSelected(prepareSelectedAll(typeAndChanges.changes, true));
        break;

      case 'checked':
        setSelected(prepareSelectedAll(typeAndChanges.changes, false));
        break;
    }
  };

  // we need that to keep typing
  switch (typeAndChanges.type) {
    case 'plugins':
      return (
        <ItemWithChildren className={classes.changeTypeItem} title={title} stats={stats} checked={checkState} onCheckChange={onCheckChange}>
          {typeAndChanges.changes.map((change) => (
            <PluginChangeItem key={change.key} change={change} selection={selection} setSelected={setSelected} />
          ))}
        </ItemWithChildren>
      );

    case 'components':
      return (
        <ItemWithChildren className={classes.changeTypeItem} title={title} stats={stats} checked={checkState} onCheckChange={onCheckChange}>
          {typeAndChanges.changes.map((change) => (
            <ComponentChangeItem key={change.key} change={change} selection={selection} setSelected={setSelected} isDelete={typeAndChanges.isDelete} />
          ))}
        </ItemWithChildren>
      );
  }
};
*/

const PluginChangeItem: FunctionComponent<{ node: string; }> = ({ node: nodeKey }) => {
  const treeContext = useContext(TreeContext);
  const { model, selection, setSelected } = treeContext;
  const node = model.nodes[nodeKey] as ChangeNode;
  const change = model.changes[node.change] as coreImportData.PluginChange;
  const selected = selection[node.change];
  const onSetSelected = (value: boolean) => setSelected(nodeKey, value);

  return (
    <ChangeItem title={change.id} selected={selected} onSetSelected={onSetSelected}>
      <ChangeDetailLine>{`Version : ${formatVersion(change.version)}`}</ChangeDetailLine>

      {change.usage && <ChangeDetailLine>{`Changement d'usage : ${change.usage}`}</ChangeDetailLine>}

      {Object.entries(change.members || {}).map(([memberName, type]) => {
        let changeType: string;

        switch (type) {
          case 'add':
            changeType = 'Ajout de membre';
            break;

          case 'update':
            changeType = 'Modification de membre';
            break;

          case 'delete':
            changeType = 'Suppression de membre';
            break;
        }

        return <ChangeDetailLine key={memberName}>{`${changeType} : ${memberName}`}</ChangeDetailLine>;
      })}

      {Object.entries(change.config || {}).map(([configName, type]) => {
        let changeType: string;

        switch (type) {
          case 'add':
            changeType = 'Ajout de configuration';
            break;

          case 'update':
            changeType = 'Modification de configuration';
            break;

          case 'delete':
            changeType = 'Suppression de configuration';
            break;
        }

        return <ChangeDetailLine key={configName}>{`${changeType} : ${configName}`}</ChangeDetailLine>;
      })}

      {(change.impacts?.components || []).map((componentId) => {
        <ChangeDetailLine key={componentId} highlight>{`Impact : Suppression du composant ${componentId}`}</ChangeDetailLine>;
      })}

      {(change.impacts?.bindings || []).map((bindingId) => {
        <ChangeDetailLine key={bindingId} highlight>{`Impact : Suppression du binding ${bindingId}`}</ChangeDetailLine>;
      })}
    </ChangeItem>
  );
};

function formatVersion({ before, after }: { before: string; after: string }) {
  if (before && after) {
    if (before !== after) {
      return `${before} -> ${after}`;
    } else {
      return before;
    }
  }

  if (before) {
    return before;
  }

  if (after) {
    return after;
  }

  return null;
}

const ComponentChangeItem: FunctionComponent<{ node: string; }> = ({ node: nodeKey }) => {
  const treeContext = useContext(TreeContext);
  const { model, selection, setSelected } = treeContext;
  const node = model.nodes[nodeKey] as ChangeNode;
  const change = model.changes[node.change] as coreImportData.ComponentChange;
  const selected = selection[node.change];
  const onSetSelected = (value: boolean) => setSelected(nodeKey, value);
  
  const isDelete = change.changeType === 'delete';
  // only one dependency for now
  const dependency = change.dependencies[0];

  let forcedValue: boolean = null;

  if (dependency) {
    const dependencySelected = selection[dependency];

    // On delete, the component only appears if its plugin deletion is not checked (else its deletion is already an impact of plugin deletion)
    if (isDelete && dependencySelected) {
      forcedValue = true;
    }

    if (!isDelete && !dependencySelected) {
      forcedValue = false;
    }
  }

  const disabled = forcedValue !== null;

  // Force value when we become disabled
  useEffect(() => {
    if (disabled && selection[change.key] !== forcedValue) {
      setSelected(nodeKey, forcedValue);
    }
  }, [selection, forcedValue, disabled]);

  return (
    <ChangeItem title={change.id} disabled={disabled} selected={selected} onSetSelected={onSetSelected}>
      {Object.entries(change.config || {}).map(([configName, { type, value }]) => {
        let changeType: string;

        switch (type) {
          case 'add':
            changeType = 'Ajout de configuration';
            break;

          case 'update':
            changeType = 'Modification de configuration';
            break;

          case 'delete':
            changeType = 'Suppression de configuration';
            break;
        }

        const formattedValue = value === undefined ? '' : ` -> '${value}'`;

        return <ChangeDetailLine key={configName}>{`${changeType} : ${configName}${formattedValue}`}</ChangeDetailLine>;
      })}

      {change.external != null && <ChangeDetailLine>{`Changement flag 'externe' : ${change.external}`}</ChangeDetailLine>}

      {change.pluginId != null && <ChangeDetailLine>{`Changement de plugin : ${change.pluginId}`}</ChangeDetailLine>}

      {(change.impacts?.bindings || []).map((bindingId) => {
        <ChangeDetailLine key={bindingId} highlight>{`Impact : Suppression du binding ${bindingId}`}</ChangeDetailLine>;
      })}
    </ChangeItem>
  );
};

interface ChangeItemProps {
  title: string;
  selected: boolean;
  onSetSelected: (value: boolean) => void;
  disabled?: boolean;
}

const ChangeItem: FunctionComponent<ChangeItemProps> = ({
  title,
  disabled,
  selected,
  onSetSelected,
  children,
}) => {
  const classes = useStyles();
  const onCheck = () => onSetSelected(!selected);

  return (
    <ListItem className={classes.changeItem} button onClick={onCheck} disabled={disabled}>
      <ListItemIcon>
        <Checkbox edge="start" color="primary" checked={selected} tabIndex={-1} />
      </ListItemIcon>

      <ListItemText disableTypography primary={<Typography variant="body1">{title}</Typography>} secondary={<div className={classes.changeDetailsContainer}>{children}</div>} />
    </ListItem>
  );
};

const ChangeDetailLine: FunctionComponent<{ highlight?: boolean }> = ({ children, highlight = false }) => {
  return (
    <Typography variant="body2" color={highlight ? 'error' : 'textSecondary'}>
      {children}
    </Typography>
  );
};

function prepareSelectedAll(changes: coreImportData.ObjectChange[], selected: boolean) {
  const partial: SelectionSet = {};

  for (const change of changes) {
    partial[change.key] = selected;
  }

  return partial;
}

function getTriState(stats: StatsItem): TriState {
  // both empty and (some selected and some unselected)
  if (!!stats.selected === !!stats.unselected) {
    return 'indeterminate';
  } else if (stats.selected) {
    return 'checked';
  } else {
    return 'unchecked';
  }
}

const ItemWithChildren: FunctionComponent<{ className?: string; title: string; stats: StatsItem; checked?: TriState; onCheckChange?: () => void }> = ({
  className,
  title,
  stats,
  checked,
  onCheckChange,
  children,
}) => {
  const [open, setOpen] = useState(true);

  const handleClick = () => {
    setOpen(!open);
  };

  if (areStatsEmpty(stats)) {
    return null;
  }

  return (
    <>
      <ListItem button onClick={handleClick} className={className}>
        {checked && onCheckChange && (
          <ListItemIcon>
            <Checkbox
              onClick={(e) => e.stopPropagation() /* prevent parent click (expand/collapse) */}
              onMouseDown={(e) => e.stopPropagation() /* prevent parent ripple effect */}
              edge="start"
              color="primary"
              indeterminate={checked === 'indeterminate'}
              checked={checked === 'checked'}
              onChange={onCheckChange}
              tabIndex={-1}
            />
          </ListItemIcon>
        )}

        <ListItemText primary={title} secondary={formatStats(stats)} />
        {open ? <ExpandLess /> : <ExpandMore />}
      </ListItem>

      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {children}
        </List>
      </Collapse>
    </>
  );
};

function buildDataModel(changes: coreImportData.ObjectChange[]) {
  const model: DataModel = {
    nodes: {},
    changes: {},
  };

  addRootNode('byInstancesObjectTypes');
  addRootNode('byObjectTypesInstances');
  addRootNode('byObjectTypes');

  for (const change of changes) {
    const { key, instanceName, objectType, changeType } = change;
    model.changes[key] = change;

    addNodeChain('byInstancesObjectTypes', instanceNode(instanceName), objectTypeNode(objectType), changeTypeNode(changeType), changeNode(key));
    addNodeChain('byObjectTypesInstances', objectTypeNode(objectType), instanceNode(instanceName), changeTypeNode(changeType), changeNode(key));
    addNodeChain('byObjectTypes', objectTypeNode(objectType), changeTypeNode(changeType), changeNode(key));
  }

  for (const node of Object.values(model.nodes)) {
    // sort depending of the type of children
    if (node.type === 'change') {
      continue;
    }

    // all other types have children
    const { children } = node as NodeWithChildren;
    if (children.length === 0) {
      continue; // Nothing to sort
    }

    const childType = model.nodes[children[0]].type;
    switch (childType) {
      case 'objectType':
        children.sort(objectTypeNodeComparer);
        break;

      case 'instanceName':
        children.sort(instanceNameNodeComparer);
        break;

      case 'changeType':
        children.sort(changeTypeNodeComparer);
        break;

      case 'change':
        children.sort(changeNodeComparer);
        break;
    }
  }

  return model;

  function addRootNode(path: string) {
    const key = path; // path is mono-part for root node

    const node: RootNode = {
      type: 'root',
      children: []
    };

    model.nodes[key] = node;
  }

  type Builder = (parentPath: string[]) => string;

  function addNodeChain(root: string, ...builders: Builder[]) {
    const path = [root];

    for (const builder of builders) {
      path.push(builder(path));
    }
  }

  function instanceNode(instanceName: string): Builder {
    return (parentPath: string[]) => {
      addOrGet<InstanceNameNode>([...parentPath, instanceName], () => ({ type: 'instanceName', instanceName, children: [] }));
      return instanceName;
    };
  }

  function objectTypeNode(objectType: coreImportData.ObjectType): Builder {
    return (parentPath: string[]) => {
      addOrGet<ObjectTypeNode>([...parentPath, objectType], () => ({ type: 'objectType', objectType, children: [] }));
      return objectType;
    };
  }

  function changeTypeNode(changeType: coreImportData.ChangeType): Builder {
    return (parentPath: string[]) => {
      addOrGet<ChangeTypeNode>([...parentPath, changeType], () => ({ type: 'changeType', changeType, children: [] }));
      return changeType;
    };
  }

  function changeNode(changeKey: string): Builder {
    return (parentPath: string[]) => {
      addOrGet<ChangeNode>([...parentPath, changeKey], () => ({ type: 'change', change: changeKey }));
      return changeKey;
    };
  }

  function addOrGet<TNode extends Node>(path: string[], factory: () => TNode): { key: string, node: TNode } {
    const key = path.join('/');
    const existing = model.nodes[key];
    if (existing) {
      return { key, node: existing as TNode };
    }

    const parentKey = path.slice(0, -1).join('/');
    const parentNode = model.nodes[parentKey] as NodeWithChildren;

    const newNode = factory();
    model.nodes[key] = newNode;
    parentNode.children.push(key);
  }

  function objectTypeNodeComparer(key1: string, key2: string) {
    const objectTypeOrdering = {
      plugin: 1,
      component: 2
    };
  
    const node1 = model.nodes[key1] as ObjectTypeNode;
    const node2 = model.nodes[key2] as ObjectTypeNode;

    return objectTypeOrdering[node1.objectType] - objectTypeOrdering[node2.objectType];
  }

  function instanceNameNodeComparer(key1: string, key2: string) {
    const node1 = model.nodes[key1] as InstanceNameNode;
    const node2 = model.nodes[key2] as InstanceNameNode;

    return node1.instanceName.localeCompare(node2.instanceName);
  }

  function changeTypeNodeComparer(key1: string, key2: string) {
    const changeTypeOrdering = {
      add: 1,
      update: 2,
      delete: 3
    };
  
    const node1 = model.nodes[key1] as ChangeTypeNode;
    const node2 = model.nodes[key2] as ChangeTypeNode;

    return changeTypeOrdering[node1.changeType] - changeTypeOrdering[node2.changeType];
  }

  function changeNodeComparer(key1: string, key2: string) {
    const node1 = model.nodes[key1] as ChangeNode;
    const node2 = model.nodes[key2] as ChangeNode;

    const change1 = model.changes[node1.change];
    const change2 = model.changes[node2.change];

    return change1.id.localeCompare(change2.id);
  }
}

function computeStats(model: DataModel, selection: SelectionSet): StatsSet {
  const stats: StatsSet = {};

  computeNode('byInstancesObjectTypes');
  computeNode('byObjectTypesInstances');
  computeNode('byObjectTypes');

  return stats;

  function computeNode(key: string): StatsItem {
    const existing = stats[key];
    if (existing) {
      return existing;
    }

    const node = model.nodes[key];
    const result: StatsItem = { selected: 0, unselected: 0 };

    if (node.type === 'change') {
      const changeNode = node as ChangeNode;

      if(selection[changeNode.change]) {
        ++result.selected;
      } else {
        ++result.unselected;
      }
    } else {
      // all other types have children
      for (const child of (node as NodeWithChildren).children) {
        const childStats = computeNode(child);
        result.selected += childStats.selected;
        result.unselected += childStats.unselected;
      }

      stats[key] = result;
    }

    return result;
  }
}

function initSelection(changes: coreImportData.ObjectChange[]): SelectionSet {
  const selection: SelectionSet = {};

  // By default select all add/update and unselect deletes

  for (const change of changes) {
    switch (change.changeType) {
      case 'add':
      case 'update':
        selection[change.key] = true;
        break;

      case 'delete':
        selection[change.key] = false;
        break;
    }
  }

  return selection;
}

function formatSelection(selection: SelectionSet) {
  const values = [];

  for (const [key, selected] of Object.entries(selection)) {
    if (selected) {
      values.push(key);
    }
  }

  return values;
}

function areStatsEmpty(stats: StatsItem) {
  return stats.selected === 0 && stats.unselected === 0;
}

function formatStats(stats: StatsItem) {
  if (areStatsEmpty(stats)) {
    return '(Aucun)';
  }

  if (stats.selected === 0) {
    const count = stats.unselected;
    return count < 2 ? `${count} item non sélectionné` : `${count} items non sélectionnés`;
  }

  if (stats.unselected === 0) {
    const count = stats.selected;
    return count < 2 ? `${count} item sélectionné` : `${count} items sélectionnés`;
  }

  const total = stats.selected + stats.unselected;
  const count = stats.selected;
  return count < 2 ? `${count} item sélectionné sur ${total}` : `${count} items sélectionnés sur ${total}`;
}
