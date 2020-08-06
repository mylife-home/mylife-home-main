import React, { FunctionComponent, useState, useRef } from 'react';
import clsx from 'clsx';
import { makeStyles, darken } from '@material-ui/core/styles';

import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';

import Close from '@material-ui/icons/Close';

import { useDrag, useDrop, DropTargetMonitor } from 'react-dnd';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
  },
  indicator: {
    display: 'none'
  },
  tabRoot: {
    borderLeftColor: theme.palette.background.paper,
    borderLeftStyle: 'solid',
    borderLeftWidth: 1,
    borderRightColor: theme.palette.background.paper,
    borderRightStyle: 'solid',
    borderRightWidth: 1,
  },
  tabSelected: {
    backgroundColor: theme.palette.background.paper
  },
  tabDropTarget: {
    backgroundColor: darken(theme.palette.background.paper, 0.1),
  },
  tabWrapper: {
    flexDirection: 'row'
  },
  tabSpan: {
    flex: 1
  }
}));
const tabSymbol = Symbol('tab');

interface DragItem {
  index: number;
  type: string;
}

interface MoveableTabProps {
  text: string;
  index: number;
  onClose: (index: number) => void;
  onMove: (sourceIndex: number, targetIndex: number) => void;
  onSelect: (index: number) => void;
}

const MoveableTab: FunctionComponent<MoveableTabProps> = ({ text, index, onClose, onMove, onSelect, ...props }) => {
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
  
  const classes = useStyles();
  const rootClasses = clsx(classes.tabRoot, { [classes.tabDropTarget]: isHovered });
  return (
    <Tab {...props} disableRipple classes={{ root: rootClasses, selected: classes.tabSelected, wrapper: classes.tabWrapper }} ref={ref} component='div' label={
      <>
        <span className={classes.tabSpan}>
          {text}
        </span>
        <IconButton onClick={(e) => {
          e.stopPropagation();
          onClose(index);
        }}>
          <Close/>
        </IconButton>
      </>
    } id={`scrollable-auto-tab-${index}`} aria-controls={`scrollable-auto-tabpanel-${index}`} />
  );
};

const initialList = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];

const Layout: FunctionComponent = () => {
  const classes = useStyles();
  const [tabs, setTabs] = useState(initialList);
  const [tabIndex, setTabIndex] = useState(0);

  const handleTabChange = (event: React.ChangeEvent, newIndex: number) => {
    setTabIndex(newIndex);
  };

  const closeTab = (index: number) => {
    setTabs(tabs => removeItem(tabs, index));

    if(tabIndex >= index) {
      const newIndex = tabIndex - 1;
      setTabIndex(newIndex === -1 ? 0 : newIndex);
    }
  };

  const handleMove = (sourceIndex: number, targetIndex: number) => {
    const newTabs = [...tabs];

    newTabs.splice(sourceIndex, 1);
    newTabs.splice(targetIndex, 0, tabs[sourceIndex]);

    setTabs(newTabs);

    if (tabIndex === sourceIndex) {
      setTabIndex(targetIndex);
    }
  };

  const handleSelect = setTabIndex;

  return (
    <div className={classes.root}>

      <AppBar position="static" color="default">
        <Tabs
          value={tabIndex}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          aria-label="scrollable auto tabs example"
          classes={{ indicator: classes.indicator }}
        >
          {tabs.map((tab, index) => (<MoveableTab key={index} text={tab} index={index} onClose={closeTab} onMove={handleMove} onSelect={handleSelect} />))}
        </Tabs>
      </AppBar>
      {tabs.map((tab, index) => (
        <div
          key={index}
          role="tabpanel"
          hidden={tabIndex !== index}
          id={`scrollable-auto-tabpanel-${index}`}
          aria-labelledby={`scrollable-auto-tab-${index}`}
        >
        {tabIndex === index && (
          <Box p={3}>
            <Typography>{tab}</Typography>
          </Box>
        )}
      </div>
    ))}
    </div>
  );
};

export default Layout;

function removeItem<T>(array: T[], index: number) {
  return [...array.slice(0, index), ...array.slice(index + 1)];
}
