import React, { FunctionComponent, useState, useCallback, useEffect } from 'react';
import { useModal } from 'react-modal-hook';
import { makeStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';

import { UiControlTextContextItemData, UiControlTextData } from '../../../../../../../shared/project-manager';
import { TransitionProps } from '../../../../dialogs/common';
import SplitPane from '../../../../lib/split-pane';
import { useTabPanelId, TabIdContext } from '../../../../lib/tab-panel';
import CodeEditor from './code-editor';
import TestPanel from './test-panel';

export type DialogResult = { status: 'ok' | 'cancel'; updateData?: Partial<UiControlTextData> };

export function useFormatEditorDialog() {
  const tabId = useTabPanelId();
  const [initialText, setInitialText] = useState<UiControlTextData>();
  const [onResult, setOnResult] = useState<(result: DialogResult) => void>();

  const [showModal, hideModal] = useModal(({ in: open, onExited }: TransitionProps) => {
    // bind modal to current tab
    return (
      <TabIdContext.Provider value={tabId}>
        <FormatDialog open={open} hideModal={hideModal} onExited={onExited} initialText={initialText} onResult={onResult} />
      </TabIdContext.Provider>
    );
  }, [initialText, onResult, tabId]);

  return useCallback((initialText: UiControlTextData) => new Promise<DialogResult>(resolve => {
    setInitialText(initialText);

    // else useState think resolve is a state updater
    setOnResult(() => resolve);

    showModal();
  }), [setInitialText, setOnResult, showModal]);
}

const useStyles = makeStyles((theme) => ({
  dialog: {
    height: 'calc(100% - 64px)', // same than fullWidth
  },
  content: {
    position: 'relative',
    padding: 0,
  }
}), { name: 'properties-format-editor-dialog'});

interface FormatDialogProps {
  open: boolean;
  hideModal: () => void;
  onExited: () => void;
  initialText: UiControlTextData;
  onResult: (result: DialogResult) => void;
}

const FormatDialog: FunctionComponent<FormatDialogProps> = ({ open, hideModal, onExited, initialText, onResult }) => {
  const classes = useStyles();
  const [format, setFormat] = useState<string>();
  const [context, setContext] = useState<UiControlTextContextItemData[]>();

  useEffect(() => {
    setFormat(initialText.format);
    setContext(initialText.context);
  }, [initialText]);

  const updateTestValue = useCallback((index: number, testValue: any) => setContext(context => {
    return context.map((item, itemIndex) => {
      if (itemIndex === index) {
        return { ...item, testValue };
      } else {
        return item;
      }
    });
  }), [setContext]);

  const cancel = () => {
    hideModal();
    onResult({ status: 'cancel' });
  };

  const validate = () => {
    hideModal();
    onResult({ status: 'ok', updateData: { format, context } });
  };

  return (
    <Dialog aria-labelledby="dialog-title" open={open} onExited={onExited} onClose={cancel} maxWidth="xl" fullWidth classes={{ paper: classes.dialog }}>
      <DialogTitle id="dialog-title">Format</DialogTitle>
    
      <DialogContent dividers classes={{ root: classes.content }}>
        <SplitPane split="vertical" defaultSize={300} minSize={300}>
          <TestPanel format={format} context={context} updateTestValue={updateTestValue} />
          <CodeEditor value={format} onChange={setFormat} />
        </SplitPane>
      </DialogContent>
    
      <DialogActions>
        <Button color="primary" onClick={validate}>OK</Button>
        <Button onClick={cancel}>Annuler</Button>
      </DialogActions>
    </Dialog>
  );
};
