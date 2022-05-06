import React, { ReactNode, FunctionComponent, useMemo, useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import clsx from 'clsx';
import { makeStyles, darken } from '@material-ui/core/styles';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import EditIcon from '@material-ui/icons/Edit';
import CheckIcon from '@material-ui/icons/Check';
import ClearIcon from '@material-ui/icons/Clear';

import { useTabPanelId } from '../../../lib/tab-panel';
import { AppState } from '../../../../store/types';
import { getStyle } from '../../../../store/ui-designer/selectors';
import { setStyle } from '../../../../store/ui-designer/actions';
import JssEditor from './jss-editor';

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  toolbar: {
    backgroundColor: darken(theme.palette.background.paper, 0.03)
  },
  toolbarTitle: {
    flex: 1,
    textAlign: 'center',
  },
  wrapper: {
    flex: '1 1 auto',
    position: 'relative',
  }
}));

export type DisplayStyle = 'view' | 'edit';

const Display : FunctionComponent<{ id: string; className?: string; }> = ({ id, className }) => {
  const [displayStyle, setDisplayStyle] = useState<DisplayStyle>('view');

  useEffect(() => {
    setDisplayStyle('view');
  }, [id]);

  switch (displayStyle) {
    case 'view':
      return (
        <DisplayViewer id={id} className={className} onToEdit={() => setDisplayStyle('edit')} />
      );

    case 'edit':
      return (
        <DisplayEditor id={id} className={className} onToView={() => setDisplayStyle('view')} />
      );
  }
};

export default Display;

const DisplayViewer: FunctionComponent<{ id: string; className?: string; onToEdit: () => void }> = ({ id, className, onToEdit }) => {
  const style = useSelector((state: AppState) => getStyle(state, id));
  const editorValue = useMemo(() => JSON.stringify(style.properties, null, 2), [style.properties]);

  return (
    <DisplayTemplate id={id} className={className} buttons={
      <IconButton onClick={onToEdit}>
        <EditIcon />
      </IconButton>
    }>
      <JssEditor value={editorValue} />
    </DisplayTemplate>
  );
};

const DisplayEditor: FunctionComponent<{ id: string;  className?: string; onToView: () => void }> = ({ id, className, onToView }) => {
  const style = useSelector((state: AppState) => getStyle(state, id));
  const setStyle = useSetStyle(id);
  const [editorValue, setEditorValue] = useState('');

  const canValidate = useMemo(() => {
    try {
      const value = JSON.parse(editorValue);
      return typeof value === 'object' && !Array.isArray(value) && value !== null;
    } catch(err) {
      return false;
    }
  }, [editorValue]);

  useEffect(() => {
    setEditorValue(JSON.stringify(style.properties, null, 2));
  }, [style.properties]);

  const cancel = onToView;
  const validate = () => {
    setStyle(JSON.parse(editorValue));
    onToView();
  };

  return (
    <DisplayTemplate id={id} className={className} buttons={
      <>
        <IconButton onClick={validate} disabled={!canValidate}>
          <CheckIcon />
        </IconButton>
        <IconButton onClick={cancel}>
          <ClearIcon />
        </IconButton>
      </>
    }>
      <JssEditor value={editorValue} onChange={setEditorValue} />
    </DisplayTemplate>
  );
};

const DisplayTemplate: FunctionComponent<{ id: string; className?: string; buttons: ReactNode; }> = ({ id, className, buttons, children }) => {
  const classes = useStyles();
  const style = useSelector((state: AppState) => getStyle(state, id));

  return (
    <div className={clsx(className, classes.container)}>

      <Toolbar className={classes.toolbar}>
        {buttons}

        <Typography variant="h6" className={classes.toolbarTitle}>
          {style.styleId}
        </Typography>
      </Toolbar>

      <div className={classes.wrapper}>
        {children}
      </div>
    </div>
  );
};

function useSetStyle(id: string) {
  const tabId = useTabPanelId();
  const { styleId } = useSelector((state: AppState) => getStyle(state, id));
  const dispatch = useDispatch();

  return useCallback((properties: object) => dispatch(setStyle({ tabId, style: { id, styleId, properties } })), [dispatch, tabId, id, styleId]);
}
