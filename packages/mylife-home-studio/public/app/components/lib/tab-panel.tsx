import React, { FunctionComponent, useRef, createContext, useContext, useMemo } from 'react';
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
  id: string;
  type: string;
}

interface TabProps {
  id: string;
  text: React.ReactNode;
  index: number;
  onClose?: (id: string) => void;
  onMove: (id: string, position: number) => void;
  onSelect: (id: string) => void;
  value: string; // used by MuiTabs on its children
}

const Tab: FunctionComponent<TabProps> = ({ id, text, index, onClose, onMove, onSelect, ...props }) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isHovered }, drop] = useDrop({
    accept: tabSymbol,
    drop(item: DragItem) {
      const dragId = item.id;
      const dropIndex = index;
      onMove(dragId, dropIndex);
    },
    canDrop: (item: DragItem) => {
      return item.id !== id;
    },
    collect: (monitor: DropTargetMonitor) => ({
      isHovered: monitor.isOver() && monitor.getItem().id !== id
    })
  });

  const [, drag] = useDrag({
    item: { type: tabSymbol, id },
    begin: () => onSelect(id)
  });

  drag(drop(ref));

  const classes = useTabStyles();

  return (
    <MuiTab 
      {...props} // must forward other props that are set by MuiTabs on its children (value, selected)
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
              onClose(id);
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
      indicatorColor='primary'
      textColor='primary'
      variant='scrollable'
      scrollButtons='auto'
      classes={{ indicator: classes.indicator, root: classes.root }}
    >
      {children}
    </MuiTabs>
  );
};

export interface TabPanelItem {
  readonly id: string;
  readonly title: React.ReactNode;
  readonly index: number;
  readonly closable: boolean;
}

export interface TabPanelProps {
  className?: string;
  items: TabPanelItem[];
  selectedId: string,
  onClose: (id: string) => void;
  onMove: (id: string, position: number) => void;
  onSelect: (id: string) => void;
  panelComponent: React.ReactType;
}

const useTabPanelStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: theme.palette.background.paper,
  },
  tabPanel: {
    flex: 1,
    position: 'relative'
  },
}));

export const TabIdContext = createContext<string>(null);

export function useTabPanelId() {
  return useContext(TabIdContext);
}

const TabPanel: FunctionComponent<TabPanelProps> = ({ className, items, selectedId, onClose, onMove, onSelect, panelComponent }) => {
  const classes = useTabPanelStyles();
  const PanelComponent = panelComponent;

  const handleTabChange = (event: React.ChangeEvent, newId: string) => onSelect(newId);

  return (
    <div className={clsx(classes.root, className)}>
      <Tabs value={selectedId} onChange={handleTabChange}>
        {items.map((item) => (
          <Tab 
            key={item.id}
            value={item.id}
            id={item.id}
            text={item.title}
            index={item.index}
            onClose={item.closable ? onClose : undefined}
            onMove={onMove}
            onSelect={onSelect}
          />
        ))}
      </Tabs>

      {items.map((item) => (
        <div
          key={item.id}
          role='tabpanel'
          hidden={selectedId !== item.id}
          className={classes.tabPanel}
        >
          <TabIdContext.Provider value={item.id}>
            <PanelComponent />
          </TabIdContext.Provider>
        </div>
      ))}
    </div>
  );
};

export default TabPanel;