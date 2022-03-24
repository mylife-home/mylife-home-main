import React, { FunctionComponent, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useModal } from 'react-modal-hook';
import { makeStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import AddIcon from '@material-ui/icons/Add';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

import { TransitionProps } from '../../dialogs/common';
import { useTabPanelId, TabIdContext } from '../../lib/tab-panel';
import { useTabSelector } from '../../lib/use-tab-selector';
import { AppState } from '../../../store/types';
import { setTemplate } from '../../../store/core-designer/actions';
import { getTemplateIds, getTemplate, getTemplatesMap } from '../../../store/core-designer/selectors';

export type DialogResult = { status: 'ok' | 'cancel'; format?: string };

export function useManagementDialog() {
  const tabId = useTabPanelId();

  const [showModal, hideModal] = useModal(({ in: open, onExited }: TransitionProps) => {
    // bind modal to current tab
    return (
      <TabIdContext.Provider value={tabId}>
        <ManagementDialog open={open} hideModal={hideModal} onExited={onExited} />
      </TabIdContext.Provider>
    );
  }, [tabId]);

  return showModal;
}

const useStyles = makeStyles((theme) => ({
  dialog: {
  },
  content: {
    //position: 'relative',
    //padding: 0,
  },
  newButton: {
    color: theme.palette.success.main,
  },
  list: {
    height: 200,
    width: 500,
  }
}), { name: 'template-management-dialog'});

interface ManagementDialogProps {
  open: boolean;
  hideModal: () => void;
  onExited: () => void;
}

const ManagementDialog: FunctionComponent<ManagementDialogProps> = ({ open, hideModal, onExited }) => {
  const classes = useStyles();

  return (
    <Dialog aria-labelledby="dialog-title" open={open} onExited={onExited} onClose={hideModal} classes={{ paper: classes.dialog }} scroll='paper'>
      <DialogTitle id="dialog-title">
        Templates
        <NewTemplateButton className={classes.newButton} />
      </DialogTitle>
    
      <DialogContent dividers classes={{ root: classes.content }}>
        <TemplateList className={classes.list} />
      </DialogContent>
    
      <DialogActions>
        <Button onClick={hideModal}>Fermer</Button>
      </DialogActions>
    </Dialog>
  );
};

const NewTemplateButton: FunctionComponent<{ className?: string; }> = ({ className }) => {
  const tabId = useTabPanelId();
  const dispatch = useDispatch();
  const makeNewId = useMakeNewId();
  
  const onNew = useCallback(() => {
    const templateId = makeNewId();
    dispatch(setTemplate({ tabId, templateId }));
  }, [tabId, dispatch, makeNewId]);

  return (
    <IconButton className={className} onClick={onNew}>
      <AddIcon />
    </IconButton>
  );
};

const TemplateList: FunctionComponent<{ className?: string; }> = ({ className }) => {
  const templateIds = useTabSelector(getTemplateIds);

  return (
    <List className={className}>
      {templateIds.map(templateId => (
        <TemplateItem key={templateId} id={templateId} />
      ))}
    </List>
  );
};

const TemplateItem: FunctionComponent<{ id: string; }> = ({ id }) => {
  const template = useSelector((state: AppState) => getTemplate(state, id));

  return (
    <ListItem>
      <ListItemText primary={template.templateId} />
    </ListItem>
  );
}

function useMakeNewId() {
  const templateIds = useTabSelector(getTemplateIds);
  const templatesMap = useSelector(getTemplatesMap);
  
  return useCallback(() => {
    const set = new Set(templateIds.map(id => templatesMap[id].templateId));

    for (let i = 1; ; ++i) {
      const candidate = `new-${i}`;
      if (!set.has(candidate)) {
        return candidate;
      }
    }
  }, [templateIds]);
}
