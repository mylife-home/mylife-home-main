import React, { FunctionComponent, CSSProperties, useMemo } from 'react';
import { useSelector } from 'react-redux';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';

import Image from '../../common/image';
import { useWindowState, useControlState } from '../view-state';
import { useTextValue } from '../control-text-value';
import { UiControlTextData } from '../../../../../../../shared/project-manager';
import { getStylesMap } from '../../../../../store/ui-designer/selectors';

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
  }
}));

const Wrapper: FunctionComponent<{ style?: CSSProperties; selected: boolean }> = ({ style, children, selected }) => {
  const classes = useStyles();

  return <div className={clsx(classes.wrapper, selected && classes.selected)} style={style}>{children}</div>;
};

export const CanvasWindowView = () => {
  const classes = useStyles();
  const { window, selected } = useWindowState();
  const style = useObjectStyle(window.style);

  return (
    <Wrapper selected={selected} style={style}>
      <Image resource={window.backgroundResource} className={classes.image} />
    </Wrapper>
  );
};

export const CanvasControlView: FunctionComponent<{ id: string }> = ({ id }) => {
  const classes = useStyles();
  const { control, selected } = useControlState(id);
  const style = useObjectStyle(control.style);

  return (
    <Wrapper selected={selected} style={style}>
      {control.text ? <TextView className={classes.text} text={control.text} /> : <Image resource={control.display.defaultResource} className={classes.image} />}
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