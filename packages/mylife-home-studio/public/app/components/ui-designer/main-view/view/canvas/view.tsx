import React, { FunctionComponent, CSSProperties, useMemo } from 'react';
import { useSelector } from 'react-redux';
import clsx from 'clsx';
import { darken, makeStyles } from '@material-ui/core/styles';

import Image from '../../common/image';
import { useViewState, useControlState, useTemplateInstanceState } from '../view-state';
import { useTextValue } from '../control-text-value';
import { UiControlTextData } from '../../../../../../../shared/project-manager';
import { AppState } from '../../../../../store/types';
import { getControl, getStylesMap, getTemplateInstance, getTemplate } from '../../../../../store/ui-designer/selectors';
import { UiWindow } from '../../../../../store/ui-designer/types';

const useStyles = makeStyles((theme) => ({
  wrapper: {
    height: '100%',
    width: '100%',
    border: `1px solid ${theme.palette.divider}`,

    // Note: must match UI render
    padding: '2px',
    // display: 'table-cell',
    // verticalAlign: 'middle',

    // For text children
    fontSize: 16,
    lineHeight: 1.5,
    fontWeight: 400
  },
  selected: {
    border: `1px solid ${theme.palette.primary.main}`,
  },
  image: {
    // Note: must match UI render
    height: '100%',
    width: '100%',

    margin: 'auto'
  },
  text: {
    // Note: must match UI render
    margin: 'auto'
  },
  templateContainer: {
    height: '100%',
    width: '100%',
    position: 'relative',
  },
  templateElement: {
    position: 'absolute',
    border: `1px solid ${theme.palette.divider}`,
  },
  templateInstanceWrapper: {
    background: darken(theme.palette.background.paper, 0.03),
    opacity: 0.5,
  }
}));

const Wrapper: FunctionComponent<{ style?: CSSProperties; selected: boolean }> = ({ style, children, selected }) => {
  const classes = useStyles();

  return <div className={clsx(classes.wrapper, selected && classes.selected)} style={style}>{children}</div>;
};

export const CanvasViewView = () => {
  const classes = useStyles();
  const { viewType, view, selected } = useViewState();
  const window = viewType === 'window' ? view as UiWindow : null;
  const style = useObjectStyle(window?.style || []);

  return (
    <Wrapper selected={selected} style={style}>
      {window && (
        <Image resource={window.backgroundResource} className={classes.image} />
      )}
    </Wrapper>
  );
};

export const CanvasControlView: FunctionComponent<{ id: string }> = ({ id }) => {
  const { control, selected } = useControlState(id);
  const style = useObjectStyle(control.style);

  return (
    <Wrapper selected={selected} style={style}>
      <ControlContent id={id} />
    </Wrapper>
  );
};

const TextView: FunctionComponent<{ className?: string; text: UiControlTextData }> = ({ className, text }) => {
  const value = useTextValue(text);
  return (
    <p className={className}>
      {value}
    </p>
  )
}

export const CanvasControlCreationView: FunctionComponent = () => {
  const classes = useStyles();

  return (
    <Wrapper selected>
      <div className={classes.image} />
    </Wrapper>
  );
}

export const CanvasTemplateInstanceView: FunctionComponent<{ id: string }> = ({ id }) => {
  const classes = useStyles();
  const { template, selected } = useTemplateInstanceState(id);

  return (
    <Wrapper selected={selected}>
      <TemplateContent id={template.id} className={classes.templateInstanceWrapper} />
    </Wrapper>
  );
};

const ControlItem: FunctionComponent<{ id: string }> = ({ id }) => {
  const classes = useStyles();
  const control = useSelector((state: AppState) => getControl(state, id));

  return (
    <div style={{ height: control.height, width: control.width, left: control.x, top: control.y }} className={classes.templateElement}>
      <ControlContent id={id} />
    </div>
  );
};

const ControlContent: FunctionComponent<{ id: string }> = ({ id }) => {
  const classes = useStyles();
  const control = useSelector((state: AppState) => getControl(state, id));

  return control.text ? (
    <TextView className={classes.text} text={control.text} />
  ) : (
    <Image resource={control.display.defaultResource} className={classes.image} />
  );
};

const TemplateInstanceItem: FunctionComponent<{ id: string }> = ({ id }) => {
  const classes = useStyles();
  const templateInstance = useSelector((state: AppState) => getTemplateInstance(state, id));
  const template = useSelector((state: AppState) => getTemplate(state, templateInstance.templateId));

  return (
    <div style={{ height: template.height, width: template.width, left: templateInstance.x, top: templateInstance.y }} className={clsx(classes.templateContainer, classes.templateElement)}>
      <TemplateContent id={templateInstance.templateId} />
    </div>
  );
};

const TemplateContent: FunctionComponent<{ className?: string; id: string }> = ({ className,id }) => {
  const classes = useStyles();
  const template = useSelector((state: AppState) => getTemplate(state, id));

  return (
    <div className={clsx(classes.templateContainer, className)}>
      {template.templates.map(id => (
        <TemplateInstanceItem key={id} id={id} />
      ))}

      {template.controls.map(id => (
        <ControlItem key={id} id={id} />
      ))}
    </div>
  )
};

function useObjectStyle(style: string[]) {
  const stylesMap = useSelector(getStylesMap);

  return useMemo(() => {
    const result: CSSProperties = {};

    // Note: merge may not happen like in browser
    for (const id of style) {
      const { properties } = stylesMap[id];
      Object.assign(result, properties);
    }

    return result;

  }, [style, stylesMap]);
}
