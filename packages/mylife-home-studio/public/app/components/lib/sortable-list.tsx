import React, { FunctionComponent, Children, useRef, useMemo, createContext, useContext } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { XYCoord } from 'dnd-core';
import { useDrag, useDrop, DropTargetMonitor, ConnectDragSource } from 'react-dnd';
import List, { ListProps } from '@material-ui/core/List';
import ListItem, { ListItemProps } from '@material-ui/core/ListItem';
import ImportExportIcon from '@material-ui/icons/ImportExport';

  // see https://react-dnd.github.io/react-dnd/examples/sortable/simple
  // see https://react-dnd.github.io/react-dnd/examples/customize/handles-and-previews

const sortableListSymbol = Symbol('dnd-sortable-list');

interface SortableListContextProps {
  moveItem: (dragIndex: number, hoverIndex: number) => void;
}

interface SortableListItemContextProps {
  index: number;
}

interface MoveHandleContextProps {
  drag: ConnectDragSource;
}

const SortableListContext = createContext<SortableListContextProps>(null);
const SortableListItemContext = createContext<SortableListItemContextProps>(null);
const MoveHandleContext = createContext<MoveHandleContextProps>(null);

interface DragItem {
  index: number;
  type: string;
}

export const SortableListItem: FunctionComponent<ListItemProps> = ({ style, ...props }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { moveItem } = useContext(SortableListContext);
  const { index } = useContext(SortableListItemContext);

  const [, drop] = useDrop({
    accept: sortableListSymbol,
    hover(item: DragItem, monitor: DropTargetMonitor) {
      const element = ref.current;
      if (!element) {
        return;
      }

      const dragIndex = item.index;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }

      // Determine rectangle on screen
      const hoverBoundingRect = element.getBoundingClientRect();
      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      // Determine mouse position
      const clientOffset = monitor.getClientOffset();
      // Get pixels to the top
      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top;

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%

      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      // Time to actually perform the action
      moveItem(dragIndex, hoverIndex);

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag, preview] = useDrag({
    item: { type: sortableListSymbol, index },
    collect: (monitor: any) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const opacity = isDragging ? 0 : 1;
  preview(drop(ref));

  // cannot bind props properly without that
  const ListItemHack = ListItem as any;

  const moveHandleContext: MoveHandleContextProps = useMemo(() => ({ drag }), [drag]);

  return (
    <MoveHandleContext.Provider value={moveHandleContext}>
      <ListItemHack {...props} ref={ref} style={{ ...style, opacity }} />
    </MoveHandleContext.Provider>
  );
};

const useHandleStyles = makeStyles((theme) => ({
  container: {
    border: `solid 1px ${theme.palette.divider}`,
    display: 'inline-flex',
    cursor: 'move',
  },
}));

export const SortableListMoveHandle: FunctionComponent<{ className?: string; }> = ({ className }) => {
  const classes = useHandleStyles();
  const { drag } = useContext(MoveHandleContext);

  return (
    <div ref={drag} className={clsx(classes.container, className)}>
      <ImportExportIcon />
    </div>
  );
};

// Only works if children are an array of (indirect) items, i.e.: each child correspond to exactly one item
export const SortableList: FunctionComponent<ListProps & { moveItem: (from: number, to: number) => void; }> = ({ moveItem, children, ...props }) => {
  const listContext: SortableListContextProps = useMemo(() => ({ moveItem }), [moveItem]);

  return (
    <SortableListContext.Provider value={listContext}>
      <List {...props}>
        {Children.map(children, (child, index) => (
          <SortableListItemWrapper index={index}>
            {child}
          </SortableListItemWrapper>
        ))}
      </List>
    </SortableListContext.Provider>
  );
};

const SortableListItemWrapper: FunctionComponent<{ index: number }> = ({ index, children }) => {
  const itemContext: SortableListItemContextProps = useMemo(() => ({ index }), [index]);
  return <SortableListItemContext.Provider value={itemContext}>{children}</SortableListItemContext.Provider>;
};
