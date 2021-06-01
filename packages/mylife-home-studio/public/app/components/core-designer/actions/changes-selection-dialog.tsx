import React, { FunctionComponent, useCallback, useState, useMemo } from 'react';
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
  changeTypeItem: {},
  changeItem: {},
}));

type ChangesDialogResult = ConfirmResult & { selection?: string[] };

type TriState = 'unchecked' | 'checked' | 'indeterminate';

export function useShowChangesDialog() {
  const classes = useStyles();
  const [changes, setChanges] = useState<coreImportData.Changes>();
  const [onResult, setOnResult] = useState<(value: ChangesDialogResult) => void>();

  const [showModal, hideModal] = useModal(
    ({ in: open, onExited }: TransitionProps) => {
      const [selection, setSelection] = useState(initSelection(changes));
      const stats = useMemo(() => computeStats(changes, selection), [changes, selection]);

      const cancel = () => {
        hideModal();
        onResult({ status: 'cancel' });
      };

      const validate = () => {
        hideModal();
        onResult({ status: 'ok', selection: formatSelection(selection) });
      };

      const setSelected = (id: string, selected: boolean) => setSelection(selection => ({ ...selection, [id]: selected }));

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
            <DialogText value={'Importer les composants modifierait le projet :'} />

            <List className={classes.list}>
              <ItemWithChildren className={classes.changeSetItem} title="Plugins">

                <ItemWithChildren className={classes.changeTypeItem} title="Ajouts" checked="checked" onCheckChange={() => {}}>

                  <ListItem>
                    <ListItemText primary="Toto" />
                  </ListItem>

                  <ListItem>
                    <ListItemText primary="Titi" />
                  </ListItem>

                </ItemWithChildren>

                <ItemWithChildren className={classes.changeTypeItem} title="Modifications" checked="checked" onCheckChange={() => {}}>

                  <ListItem>
                    <ListItemText primary="Toto" />
                  </ListItem>

                  <ListItem>
                    <ListItemText primary="Titi" />
                  </ListItem>
                  
                </ItemWithChildren>

                <ItemWithChildren className={classes.changeTypeItem} title="Suppressions" checked="unchecked" onCheckChange={() => {}}>

                  <ListItem>
                    <ListItemText primary="Toto" />
                  </ListItem>

                  <ListItem>
                    <ListItemText primary="Titi" />
                  </ListItem>
                  
                </ItemWithChildren>

              </ItemWithChildren>

              <ListItem>
                <ListItemText primary="Composants" />
              </ListItem>

              <ListItem>
                <ListItemText primary="Ajouts" />
              </ListItem>

              <ListItem>
                <ListItemText primary="Modifications" />
              </ListItem>

              <ListItem>
                <ListItemText primary="Suppressions" />
              </ListItem>
            </List>

            <DialogText value={'Continuer ?'} />
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
    (changes: coreImportData.Changes) =>
      new Promise<ChangesDialogResult>((resolve) => {
        console.log(changes);
        setChanges(changes);
        setOnResult(() => resolve); // else useState think resolve is a state updater

        showModal();
      }),
    [setChanges, setOnResult, showModal]
  );
}

const ItemWithChildren: FunctionComponent<{ className?: string; title: string; checked?: TriState; onCheckChange?: () => void }> = ({ className, title, checked, onCheckChange, children }) => {
  const [open, setOpen] = useState(true);

  const handleClick = () => {
    setOpen(!open);
  };

  return (
    <>
      <ListItem button onClick={handleClick} className={className}>
        {checked && onCheckChange && (
          <ListItemIcon>
            <Checkbox
              edge="start"
              color="primary"
              indeterminate={checked === 'indeterminate'}
              checked={checked === 'checked'}
              onChange={onCheckChange}
              tabIndex={-1}
              disableRipple
            />
          </ListItemIcon>
        )}

        <ListItemText primary={title} />
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

interface StateItem {
  selected: number;
  unselected: number;
}

interface ChangeSetStats {
  total: StateItem;
  adds: StateItem;
  updates: StateItem;
  deletes: StateItem
}

interface Stats {
  plugins: ChangeSetStats;
  components: ChangeSetStats;
}

function initSelection(changes: coreImportData.Changes): SelectionSet {
  const selection: SelectionSet = {};

  // By default select all add/update and unselect deletes

  for (const change of [...Object.values(changes.plugins.adds), ...Object.values(changes.plugins.updates), ...Object.values(changes.components.adds), ...Object.values(changes.components.updates)]) {
    selection[change.key] = true;
  }

  for (const change of [...Object.values(changes.plugins.deletes), ...Object.values(changes.components.deletes)]) {
    selection[change.key] = false;
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

function computeStats(changes: coreImportData.Changes, selection: SelectionSet): Stats {
  return {
    plugins: computeChangeSetStats(changes.plugins, selection),
    components: computeChangeSetStats(changes.components, selection)
  };
}

function computeChangeSetStats<Item extends coreImportData.ItemChange>(changes: coreImportData.ItemChanges<Item>, selection: SelectionSet): ChangeSetStats {
  const stats = {
    adds: computeItemStats(changes.adds, selection),
    updates: computeItemStats(changes.updates, selection),
    deletes: computeItemStats(changes.deletes, selection),
  };

  const total = {
    selected: Object.values(stats).reduce((acc, item) => acc + item.selected, 0),
    unselected: Object.values(stats).reduce((acc, item) => acc + item.unselected, 0),
  };

  return { ...stats, total };
}

function computeItemStats(changes: { [id: string]: coreImportData.ItemChange }, selection: SelectionSet): StateItem {
  const stats: StateItem = { selected: 0, unselected: 0 };

  for (const change of Object.values(changes)) {
    if(selection[change.key]) {
      ++stats.selected;
    } else {
      ++stats.unselected;
    }
  }

  return stats;
}
