import React, { FunctionComponent, useState, useMemo, useEffect } from 'react';
import { useModal } from 'react-modal-hook';
import { Transition } from 'react-transition-group'; // used by material-ui
import { makeStyles } from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';

import { ControlText, ControlTextContextItem } from '../../../../../../../shared/ui-model';
import { makeGetComponentsAndPlugins } from '../../../../../store/ui-designer/selectors';
import { useTabSelector } from '../../../../lib/use-tab-selector';
import { useTabPanelId, TabIdContext } from '../../../../lib/tab-panel';
import CodeEditor from './code-editor';

type TransitionProps = Transition<HTMLElement>['props'];

export type DialogResult = { status: 'ok' | 'cancel'; format?: string };

export function useFormatEditorDialog() {
  const [text, setText] = useState<ControlText>();
  const [onResult, setOnResult] = useState<(value: DialogResult) => void>();
  const tabId = useTabPanelId();

  const [showModal, hideModal] = useModal(({ in: open, onExited }: TransitionProps) => {
    // bind modal to current tab
    return (
      <TabIdContext.Provider value={tabId}>
        <FormatDialog open={open} hideModal={hideModal} onExited={onExited} text={text} onResult={onResult} />
      </TabIdContext.Provider>
    );
  }, [text, onResult, tabId]);

  return (text: ControlText) => new Promise<DialogResult>(resolve => {
    setText(text);
    setOnResult(() => resolve); // else useState think resolve is a state updater

    showModal();
  });
}

const useStyles = makeStyles((theme) => ({
  dialog: {
    height: 'calc(100% - 64px)', // same than fullWidth
  },
}), { name: 'properties-format-editor-dialog'});

interface FormatDialogProps {
  open: boolean;
  hideModal: () => void;
  onExited: () => void;
  text: ControlText,
  onResult: (value: DialogResult) => void;
}

const FormatDialog: FunctionComponent<FormatDialogProps> = ({ open, hideModal, onExited, text, onResult }) => {
  const classes = useStyles();
  const [format, setFormat] = useState<string>();

  useEffect(() => {
    setFormat(text.format);
  }, [text]);

  const cancel = () => {
    hideModal();
    onResult({ status: 'cancel' });
  };

  const validate = () => {
    hideModal();
    onResult({ status: 'ok', format });
  };

  return (
    <Dialog aria-labelledby="dialog-title" open={open} onExited={onExited} onClose={cancel} maxWidth="xl" fullWidth classes={{ paper: classes.dialog }}>
      <DialogTitle id="dialog-title">Format</DialogTitle>
    
      <DialogContent dividers>
        <TestPanel format={format} context={text.context} />
        <CodeEditor value={format} onChange={setFormat} />
      </DialogContent>
    
      <DialogActions>
        <Button color="primary" onClick={validate}>OK</Button>
        <Button onClick={cancel}>Annuler</Button>
      </DialogActions>
    </Dialog>
  );
};

const TestPanel: FunctionComponent<{ format: string; context: ControlTextContextItem[] }> = ({ format, context }) => {
  const getComponentsAndPlugins = useMemo(() => makeGetComponentsAndPlugins(), []);
  const componentsAndPlugins = useTabSelector(getComponentsAndPlugins);

  const contextData = useMemo(() => {
    const map = new Map(componentsAndPlugins.map(componentAndPlugin => ([componentAndPlugin.component.id, componentAndPlugin.plugin])));

    return context.map(item => {
      const plugin = map.get(item.componentId);
      const state = plugin.members[item.componentState];
      return { ...item, valueType: state.valueType };
    });
  }, [context, componentsAndPlugins]);

  return (
    <>
      TODO: pouvoir tester la sortie en fournissant des valeurs de context
      {JSON.stringify(contextData)}
    </>
  );
};