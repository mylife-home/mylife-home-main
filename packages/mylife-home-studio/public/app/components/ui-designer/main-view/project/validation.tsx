import React, { FunctionComponent, useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useModal } from 'react-modal-hook';
import { makeStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import TreeView from '@material-ui/lab/TreeView';
import TreeItem from '@material-ui/lab/TreeItem';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';

import { TransitionProps, DialogText } from '../../../dialogs/common';
import { useTabPanelId } from '../../../lib/tab-panel';
import { useFireAsync } from '../../../lib/use-error-handling';
import { AsyncDispatch } from '../../../../store/types';
import { validateProject } from '../../../../store/ui-designer/actions';
import { ElementPathNode } from '../common/element-path-breadcrumbs';
import { UiValidationError, UiElementPathNode } from '../../../../../../shared/project-manager';
import { useSnackbar } from '../../../dialogs/snackbar';

const useStyles = makeStyles((theme) => ({
  tree: {
    maxHeight: '50vh',
    overflowY: 'auto',
    border: `1px solid ${theme.palette.divider}`,
  },
}));

export function useProjectValidation() {
  const tabId = useTabPanelId();
  const dispatch = useDispatch<AsyncDispatch<UiValidationError[]>>();
  const fireAsync = useFireAsync();
  const showDialog = useShowDialog();
  const { enqueueSnackbar } = useSnackbar();

  return useCallback(() => {
    fireAsync(async () => {
      const errors = await dispatch(validateProject({ id: tabId }));
      if (errors.length === 0) {
        enqueueSnackbar('Le projet a été validé sans erreur.', { variant: 'success' });
      } else {
        await showDialog(errors);
      }
    });
  }, [tabId, dispatch, fireAsync, showDialog, enqueueSnackbar]);
}

function useShowDialog() {
  const classes = useStyles();
  const [treeData, setTreeData] = useState<TreeData>();
  const [onClose, setOnClose] = useState<() => void>();

  const [showModal, hideModal] = useModal(
    ({ in: open, onExited }: TransitionProps) => {
      const close = () => {
        hideModal();
        onClose();
      };

      const handleKeyDown = (e: React.KeyboardEvent) => {
        switch (e.key) {
          case 'Enter':
          case 'Escape':
            close();
            break;
        }
      };

      return (
        <Dialog aria-labelledby="dialog-title" open={open} onExited={onExited} onClose={close} scroll="paper" maxWidth="lg" fullWidth onKeyDown={handleKeyDown}>
          <DialogTitle id="dialog-title">Erreurs de validation</DialogTitle>

          <DialogContent dividers>
            <DialogText value={'Le projet a les erreurs de validation suivantes :'} />

            <TreeView className={classes.tree} defaultCollapseIcon={<ExpandMoreIcon />} defaultExpandIcon={<ChevronRightIcon />} defaultExpanded={treeData.nodeIds}>
              {treeData.roots.map((node) => (
                <TreeNode node={node} key={node.id} />
              ))}
            </TreeView>

            <DialogText value={`${treeData.errorsCount} erreurs`} />
          </DialogContent>

          <DialogActions>
            <Button color="primary" onClick={close}>
              OK
            </Button>
          </DialogActions>
        </Dialog>
      );
    },
    [treeData, onClose]
  );

  return useCallback(
    (errors: UiValidationError[]) =>
      new Promise<void>((resolve) => {
        setTreeData(buildTreeData(errors));
        setOnClose(() => resolve); // else useState think resolve is a state updater

        showModal();
      }),
    [setTreeData, setOnClose, setOnClose]
  );
}

const TreeNode: FunctionComponent<{ node: Node }> = ({ node }) => {
  const { id, children } = node;

  return (
    <TreeItem nodeId={id} label={label(node)}>
      {children.map((node) => (
        <TreeNode node={node} key={node.id} />
      ))}
    </TreeItem>
  );
};

function label(node: Node) {
  switch (node.type) {
    case 'path': {
      const pathNode = node as PathNode;
      return <ElementPathNode node={pathNode.node} />;
    }

    case 'message': {
      const messageNode = node as MessageNode;
      return <Typography color="error">{messageNode.message}</Typography>;
    }
  }
}

interface TreeData {
  roots: Node[];
  nodeIds: string[];
  errorsCount: number;
}

interface Node {
  id: string;
  type: 'path' | 'message';
  children: Node[];
}

interface MessageNode extends Node {
  type: 'message';
  message: string;
}

interface PathNode extends Node {
  type: 'path';
  node: UiElementPathNode;
}

function buildTreeData(errors: UiValidationError[]) {
  const nodeIds: string[] = [];
  const fakeRoot: PathNode = {
    id: '',
    type: 'path',
    node: null,
    children: [],
  };

  for (const [index, error] of errors.entries()) {
    let current: Node = fakeRoot;

    for (const pathPart of error.path) {
      current = getOrCreatePathNode(current, pathPart);
    }

    createMessageNode(current, index, error.message);
  }

  return { roots: fakeRoot.children, nodeIds, errorsCount: errors.length };

  function getOrCreatePathNode(parent: Node, node: UiElementPathNode) {
    const id = `${parent.id}/${node.type}.${node.id}`;
    const existing = parent.children.find((child) => child.id === id);
    if (existing) {
      return existing;
    }

    const newNode: PathNode = { id, type: 'path', children: [], node };
    parent.children.push(newNode);
    nodeIds.push(id);

    return newNode;
  }

  function createMessageNode(parent: Node, index: number, message: string) {
    const id = `${parent.id}/${index}`;
    const newNode: MessageNode = { id, type: 'message', children: [], message };

    parent.children.push(newNode);
    nodeIds.push(id);

    return newNode;
  }
}
