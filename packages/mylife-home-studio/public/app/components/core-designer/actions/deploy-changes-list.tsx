import React, { FunctionComponent, useCallback, useState, useMemo, useEffect } from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Collapse from '@material-ui/core/Collapse';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import { DeployChanges } from '../../../store/core-designer/types';
import { ChangeType } from '../../../../../shared/project-manager';

const useStyles = makeStyles((theme) => ({
  list: {
    height: '50vh',
    overflowY: 'auto',
    border: `1px solid ${theme.palette.divider}`,
  },
  changeItem: {
    paddingLeft: theme.spacing(4),
  },
}));

const DeployChangesList: FunctionComponent<{ className?: string; changes: DeployChanges; bindingsInstanceName?: string }> = ({ className, changes, bindingsInstanceName }) => {
  const data = useMemo(() => buildChanges(changes, bindingsInstanceName), [changes, bindingsInstanceName]);
  const classes = useStyles();
  return (
    <List className={clsx(classes.list, className)}>
      {data.map(instance => (
        <InstanceItem key={instance.name} instance={instance} />
      ))}
    </List>
  );
};

export default DeployChangesList;

const InstanceItem: FunctionComponent<{ instance: Instance }> = ({ instance }) => {
  const [open, setOpen] = useState(true);

  const handleClick = () => {
    setOpen(!open);
  };

  const changesCount = instance.changes.length;
  const detail = changesCount > 1 ? `${changesCount} changements` : `${changesCount} changement`;

  return (
    <>
      <ListItem button onClick={handleClick}>
        <ListItemText primary={instance.name} secondary={detail} />
        {open ? <ExpandLess /> : <ExpandMore />}
      </ListItem>

      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {instance.changes.map(change => (
            <ChangeItem key={change.objectId} change={change} />
          ))}
        </List>
      </Collapse>
    </>
  );
};

const CHANGE_TYPE_LABELS = {
  add: 'Ajout',
  update: 'Modification',
  delete: 'Suppression'
};

const OBJECT_TYPE_LABELS = {
  component: 'composant',
  binding: 'binding',
};

const ChangeItem: FunctionComponent<{ change: Change }> = ({ change }) => {
  const classes = useStyles();

  const operation = CHANGE_TYPE_LABELS[change.changeType];
  const objectType = OBJECT_TYPE_LABELS[change.objectType];
  const label=`${operation} du ${objectType} '${change.objectId}'`;

  return (
    <ListItem className={classes.changeItem}>
      <ListItemText primary={label} />
    </ListItem>
  );
};

interface Change {
  objectType: 'component' | 'binding';
  changeType: ChangeType;
  objectId: string;
}

interface Instance {
  name: string;
  changes: Change[];
}

function buildChanges(changes: DeployChanges, bindingsInstanceName: string = '(A définir)') {
  const instancesMap = new Map<string, Change[]>();

  for (const change of changes.components) {
    const list = getInstance(change.instanceName);
    list.push({ objectType: 'component', changeType: change.type, objectId: change.componentId });
  }

  for (const change of changes.bindings) {
    const list = getInstance(bindingsInstanceName);
    list.push({ objectType: 'binding', changeType: change.type, objectId: change.bindingId });
  }

  const instances: Instance[] = [];

  for(const name of Array.from(instancesMap.keys()).sort()) {
    const changes = instancesMap.get(name);
    instances.push({ name, changes });

    changes.sort(changeComparer);
  }

  return instances;

  function getInstance(name: string) {
    let list = instancesMap.get(name);
    if (!list) {
      list = [];
      instancesMap.set(name, list);
    }

    return list;
  }
}

const OBJECT_TYPE_ORDER = {
  component: 1,
  binding: 2,
};

const CHANGE_TYPE_ORDER = {
  add: 1,
  update: 2,
  delete: 3,
};

function changeComparer(a: Change, b: Change) {
  let comp = OBJECT_TYPE_ORDER[a.objectType] - OBJECT_TYPE_ORDER[b.objectType];
  if(comp !== 0) {
    return comp;
  }

  comp = CHANGE_TYPE_ORDER[a.changeType] - CHANGE_TYPE_ORDER[b.changeType];
  if(comp !== 0) {
    return comp;
  }

  return a.objectId < b.objectId ? -1 : 1;
}
