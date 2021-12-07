import React, { FunctionComponent, useCallback, useState, useMemo, useEffect } from 'react';
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
import { coreImportData } from '../../../../../shared/project-manager';

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
  }
}));

type ChangesDialogResult = ConfirmResult & { selection?: string[] };

type TriState = 'unchecked' | 'checked' | 'indeterminate';

export function useShowChangesDialog() {
  const classes = useStyles();
  const [changes, setChanges] = useState<coreImportData.ObjectChange[]>();
  const [onResult, setOnResult] = useState<(value: ChangesDialogResult) => void>();

  const [showModal, hideModal] = useModal(
    ({ in: open, onExited }: TransitionProps) => {
      const [selection, setSelection] = useState(initSelection(changes));
      const stats = useMemo(() => computeStats(changes, selection), [changes, selection]);
      const [type, setType] = useState<Type>('instances-objectTypes');

      const cancel = () => {
        hideModal();
        onResult({ status: 'cancel' });
      };

      const validate = () => {
        hideModal();
        onResult({ status: 'ok', selection: formatSelection(selection) });
      };

      const setSelected = useCallback((partial: SelectionSet) => setSelection((selection) => ({ ...selection, ...partial })), [setSelection]);

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

            <List className={classes.list}>
              <ChangeSetItem type="plugins" stats={stats.plugins} changes={changes.filter(change => change.objectType === 'plugin') as coreImportData.PluginChange[]} selection={selection} setSelected={setSelected} />
              <ChangeSetItem type="components" stats={stats.components} changes={changes.filter(change => change.objectType === 'component') as coreImportData.ComponentChange[]} selection={selection} setSelected={setSelected} />
            </List>
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

type Type = 'instances-objectTypes' | 'objectTypes-instances' | 'objectTypes';

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
          <ChangeTypeItem stats={stats.adds} changes={typeAndChanges.changes.filter(change => change.changeType === 'add')} title="Ajouts" type={typeAndChanges.type} selection={selection} setSelected={setSelected} />
          <ChangeTypeItem stats={stats.updates} changes={typeAndChanges.changes.filter(change => change.changeType === 'update')} title="Modifications" type={typeAndChanges.type} selection={selection} setSelected={setSelected} />
          <ChangeTypeItem stats={stats.deletes} changes={typeAndChanges.changes.filter(change => change.changeType === 'delete')} title="Suppressions" type={typeAndChanges.type} selection={selection} setSelected={setSelected} />
        </ItemWithChildren>
      );

    case 'components':
      return (
        <ItemWithChildren className={classes.changeSetItem} title={title} stats={stats.total}>
          <ChangeTypeItem stats={stats.adds} changes={typeAndChanges.changes.filter(change => change.changeType === 'add')} title="Ajouts" type={typeAndChanges.type} selection={selection} setSelected={setSelected} />
          <ChangeTypeItem stats={stats.updates} changes={typeAndChanges.changes.filter(change => change.changeType === 'update')} title="Modifications" type={typeAndChanges.type} selection={selection} setSelected={setSelected} />
          <ChangeTypeItem stats={stats.deletes} changes={typeAndChanges.changes.filter(change => change.changeType === 'delete')} title="Suppressions" type={typeAndChanges.type} selection={selection} setSelected={setSelected} isDelete />
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
          {typeAndChanges.changes.map(change => (
            <PluginChangeItem key={change.key} change={change} selection={selection} setSelected={setSelected} />
          ))}
        </ItemWithChildren>
      );

    case 'components':
      return (
        <ItemWithChildren className={classes.changeTypeItem} title={title} stats={stats} checked={checkState} onCheckChange={onCheckChange}>
          {typeAndChanges.changes.map(change => (
            <ComponentChangeItem key={change.key} change={change} selection={selection} setSelected={setSelected} isDelete={typeAndChanges.isDelete} />
          ))}
        </ItemWithChildren>
      );
  }
};

const PluginChangeItem: FunctionComponent<WithSelectionProps & { change: coreImportData.PluginChange }> = ({ change, selection, setSelected }) => {
  return (
    <ChangeItem change={change} selection={selection} setSelected={setSelected}>

      <ChangeDetailLine>{`Version : ${formatVersion(change.version)}`}</ChangeDetailLine>

      {change.usage && (
        <ChangeDetailLine>{`Changement d'usage : ${change.usage}`}</ChangeDetailLine>
      )}

      {Object.entries(change.members || {}).map(([memberName, type]) => {
        let changeType: string;

        switch(type) {
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

        return (
          <ChangeDetailLine key={memberName}>{`${changeType} : ${memberName}`}</ChangeDetailLine>
        );
      })}

      {Object.entries(change.config || {}).map(([configName, type]) => {
        let changeType: string;

        switch(type) {
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

        return (
          <ChangeDetailLine key={configName}>{`${changeType} : ${configName}`}</ChangeDetailLine>
        );
      })}

      {(change.impacts?.components || []).map(componentId => {
        <ChangeDetailLine key={componentId} highlight>{`Impact : Suppression du composant ${componentId}`}</ChangeDetailLine>
      })}

      {(change.impacts?.bindings || []).map(bindingId => {
        <ChangeDetailLine key={bindingId} highlight>{`Impact : Suppression du binding ${bindingId}`}</ChangeDetailLine>
      })}
    </ChangeItem>
  );
};

function formatVersion({ before, after }: { before: string; after: string; }) {
  if (before && after) {
    if(before !== after) {
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

const ComponentChangeItem: FunctionComponent<WithSelectionProps & { change: coreImportData.ComponentChange; isDelete: boolean; }> = ({ change, isDelete, selection, setSelected }) => {
  // only one dependency for now
  const dependency = change.dependencies[0];

  let forcedValue: boolean = null;

  if (dependency) {
    const dependencySelected = selection[dependency];

      // On delete, the component only appears if its plugin deletion is not checked (else its deletion is already an impact of plugin deletion)
    if (isDelete && dependencySelected) {
      forcedValue = true;
    }

    if(!isDelete && !dependencySelected) {
      forcedValue = false;
    }
  }

  const disabled = forcedValue !== null;

  // Force value when we become disabled
  useEffect(() => {
    if (disabled && selection[change.key] !== forcedValue) {
      setSelected({ [change.key]: forcedValue });
    }
  }, [selection, forcedValue, disabled]);

  return (
    <ChangeItem change={change} disabled={disabled} selection={selection} setSelected={setSelected}>
      {Object.entries(change.config || {}).map(([configName, { type, value }]) => {
        let changeType: string;

        switch(type) {
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

        return (
          <ChangeDetailLine key={configName}>{`${changeType} : ${configName}${formattedValue}`}</ChangeDetailLine>
        );
      })}

      {change.external != null && (
        <ChangeDetailLine>{`Changement flag 'externe' : ${change.external}`}</ChangeDetailLine>
      )}

      {change.pluginId != null && (
        <ChangeDetailLine>{`Changement de plugin : ${change.pluginId}`}</ChangeDetailLine>
      )}

      {(change.impacts?.bindings || []).map(bindingId => {
        <ChangeDetailLine key={bindingId} highlight>{`Impact : Suppression du binding ${bindingId}`}</ChangeDetailLine>
      })}
    </ChangeItem>
  );
};

const ChangeItem: FunctionComponent<WithSelectionProps & { change: coreImportData.ObjectChange; disabled?: boolean }> = ({ change, disabled, selection, setSelected, children }) => {
  const classes = useStyles();
  const checked = selection[change.key];
  const onCheck = () => setSelected({ [change.key]: !checked });

  return (
    <ListItem className={classes.changeItem} button onClick={onCheck} disabled={disabled}>
      <ListItemIcon>
        <Checkbox
          edge="start"
          color="primary"
          checked={checked}
          tabIndex={-1}
        />
      </ListItemIcon>

      <ListItemText
        disableTypography
        primary={<Typography variant="body1">{change.id}</Typography>}
        secondary={
          <div className={classes.changeDetailsContainer}>
            {children}
          </div>
        } />
    </ListItem>
  );
};

const ChangeDetailLine: FunctionComponent<{ highlight?: boolean }> = ({ children, highlight = false }) => {
  return (
    <Typography variant="body2" color={highlight ? 'error' : 'textSecondary'}>{children}</Typography>
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

type SelectionSet = { [key: string]: boolean };

interface StatsItem {
  selected: number;
  unselected: number;
}

interface ChangeSetStats {
  total: StatsItem;
  adds: StatsItem;
  updates: StatsItem;
  deletes: StatsItem;
}

interface Stats {
  plugins: ChangeSetStats;
  components: ChangeSetStats;
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

  for (const [id, selected] of Object.entries(selection)) {
    if (selected) {
      values.push(id);
    }
  }

  return values;
}

function computeStats(changes: coreImportData.ObjectChange[], selection: SelectionSet): Stats {
  return {
    plugins: computeChangeSetStats(changes.filter(change => change.objectType === 'plugin'), selection),
    components: computeChangeSetStats(changes.filter(change => change.objectType === 'component'), selection),
  };
}

function computeChangeSetStats<Item extends coreImportData.ObjectChange>(changes: Item[], selection: SelectionSet): ChangeSetStats {
  const stats = {
    adds: computeItemStats(changes.filter(change => change.changeType === 'add'), selection),
    updates: computeItemStats(changes.filter(change => change.changeType === 'update'), selection),
    deletes: computeItemStats(changes.filter(change => change.changeType === 'delete'), selection),
  };

  const total = {
    selected: Object.values(stats).reduce((acc, item) => acc + item.selected, 0),
    unselected: Object.values(stats).reduce((acc, item) => acc + item.unselected, 0),
  };

  return { ...stats, total };
}

function computeItemStats(changes: coreImportData.ObjectChange[], selection: SelectionSet): StatsItem {
  const stats: StatsItem = { selected: 0, unselected: 0 };

  for (const change of changes) {
    if (selection[change.key]) {
      ++stats.selected;
    } else {
      ++stats.unselected;
    }
  }

  return stats;
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
