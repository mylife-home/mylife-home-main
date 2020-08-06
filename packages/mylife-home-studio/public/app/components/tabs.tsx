import React, { FunctionComponent, useRef } from 'react';
import clsx from 'clsx';
import { makeStyles, darken } from '@material-ui/core/styles';

import MuiTabs from '@material-ui/core/Tabs';
import MuiTab from '@material-ui/core/Tab';
import IconButton from '@material-ui/core/IconButton';

import Close from '@material-ui/icons/Close';

import { useDrag, useDrop, DropTargetMonitor } from 'react-dnd';

const TABS_HEIGHT = 36;

const useTabStyles = makeStyles((theme) => ({
  root: {
    borderLeftColor: theme.palette.background.paper,
    borderLeftStyle: 'solid',
    borderLeftWidth: 1,
    borderRightColor: theme.palette.background.paper,
    borderRightStyle: 'solid',
    borderRightWidth: 1,
    minHeight: TABS_HEIGHT,
    height: TABS_HEIGHT
  },
  selected: {
    backgroundColor: theme.palette.background.paper
  },
  dropTarget: {
    backgroundColor: darken(theme.palette.background.paper, 0.1),
  },
  wrapper: {
    flexDirection: 'row'
  },
  innerSpan: {
    flex: 1
  },
  innerCloseButton: {
    padding: 6
  }
}));

const tabSymbol = Symbol('tab');

interface DragItem {
  index: number;
  type: string;
}

export interface TabProps {
  text: string;
  index: number;
  onClose?: (index: number) => void;
  onMove: (sourceIndex: number, targetIndex: number) => void;
  onSelect: (index: number) => void;
}

export const Tab: FunctionComponent<TabProps> = ({ text, index, onClose, onMove, onSelect, ...props }) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isHovered }, drop] = useDrop({
    accept: tabSymbol,
    drop(item: DragItem) {
      const dragIndex = item.index;
      const dropIndex = index;
      onMove(dragIndex, dropIndex);
    },
    canDrop: (item: DragItem) => {
      return item.index !== index;
    },
    collect: (monitor: DropTargetMonitor) => ({
      isHovered: monitor.isOver() && monitor.getItem().index !== index
    })
  });

  const [, drag] = useDrag({
    item: { type: tabSymbol, index },
    begin: () => onSelect(index)
  });

  drag(drop(ref));
  
  const classes = useTabStyles();
  const rootClasses = clsx(classes.root, { [classes.dropTarget]: isHovered });
  return (
    <MuiTab {...props} disableRipple classes={{ root: rootClasses, selected: classes.selected, wrapper: classes.wrapper }} ref={ref} component='div' label={
      <>
        <span className={classes.innerSpan}>
          {text}
        </span>
        {onClose && (
          <IconButton className={classes.innerCloseButton} onClick={(e) => {
            e.stopPropagation();
            onClose(index);
          }}>
            <Close/>
          </IconButton>
        )}
      </>
    } id={`scrollable-auto-tab-${index}`} aria-controls={`scrollable-auto-tabpanel-${index}`} />
  );
};


const useTabsStyles = makeStyles((theme) => ({
  indicator: {
    display: 'none'
  },
  root: {
    minHeight: TABS_HEIGHT,
    height: TABS_HEIGHT
  },
}));

export interface TabsProps {
  value?: any;
  onChange?: (event: React.ChangeEvent<{}>, value: any) => void;
}

export const Tabs: FunctionComponent<TabsProps> = ({ value, onChange, children }) => {
  const classes = useTabsStyles();
  return (
    <MuiTabs
      value={value}
      onChange={onChange}
      indicatorColor="primary"
      textColor="primary"
      variant="scrollable"
      scrollButtons="auto"
      classes={{ indicator: classes.indicator, root: classes.root }}
    >
      {children}
    </MuiTabs>
  );
};