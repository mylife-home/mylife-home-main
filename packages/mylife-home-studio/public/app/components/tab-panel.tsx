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

const tabSymbol = Symbol('dnd-tab');

interface DragItem {
  index: number;
  type: string;
}

interface TabProps {
  text: React.ReactNode;
  index: number;
  onClose?: (index: number) => void;
  onMove: (sourceIndex: number, targetIndex: number) => void;
  onSelect: (index: number) => void;
}

const Tab: FunctionComponent<TabProps> = ({ text, index, onClose, onMove, onSelect, ...props }) => {
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
  return (
    <MuiTab 
      {...props}
      disableRipple
      classes={{ root: clsx(classes.root, { [classes.dropTarget]: isHovered }), selected: classes.selected, wrapper: classes.wrapper }}
      ref={ref}
      component='div'
      label={
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
      }
    />
  );
};

const useTabsStyles = makeStyles((theme) => ({
  indicator: {
    display: 'none'
  },
  root: {
    minHeight: TABS_HEIGHT,
    height: TABS_HEIGHT,
    backgroundColor: theme.palette.grey[100]
  },
}));

interface TabsProps {
  value?: any;
  onChange?: (event: React.ChangeEvent<{}>, value: any) => void;
}

const Tabs: FunctionComponent<TabsProps> = ({ value, onChange, children }) => {
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

export interface TabPanelItem {
  readonly id: string;
  readonly title: React.ReactNode;
  readonly closable: boolean;
  readonly render: () => JSX.Element;
}

export interface TabPanelProps {
  className?: string;
  items: TabPanelItem[];
  selectedIndex: number,
  onClose: (index: number) => void;
  onMove: (sourceIndex: number, targetIndex: number) => void;
  onSelect: (index: number) => void;
}

const useTabPanelStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: theme.palette.background.paper,
  },
  tabPanel: {
    flex: 1
  },
}));

const TabPanel: FunctionComponent<TabPanelProps> = ({ className, items, selectedIndex, onClose, onMove, onSelect }) => {
  const classes = useTabPanelStyles();

  const handleTabChange = (event: React.ChangeEvent, newIndex: number) => {
    onSelect(newIndex);
  };

  return (
    <div className={clsx(classes.root, className)}>
      <Tabs value={selectedIndex} onChange={handleTabChange}>
        {items.map((item, index) => (
          <Tab 
            key={item.id}
            text={item.title}
            index={index}
            onClose={item.closable ? onClose : undefined}
            onMove={onMove}
            onSelect={onSelect}
          />
        ))}
      </Tabs>

      {items.map((item, index) => (
        <div
          key={item.id}
          role="tabpanel"
          hidden={selectedIndex !== index}
          className={classes.tabPanel}
        >
          {selectedIndex === index && item.render()}
        </div>
      ))}
    </div>
  );
};

export default TabPanel;