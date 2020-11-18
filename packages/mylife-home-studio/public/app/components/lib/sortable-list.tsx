import React, { FunctionComponent, Children, useRef, useState, useMemo, useCallback, createContext, useContext } from 'react';
import { useDrag, useDrop, DropTargetMonitor } from 'react-dnd';
import { XYCoord } from 'dnd-core';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

const sortableListSymbol = Symbol('dnd-sortable-list');

interface SortableListContextProps {
  moveItem: (dragIndex: number, hoverIndex: number) => void;
}

interface SortableListItemContextProps {
  index: number;
}

const SortableListContext = createContext<SortableListContextProps>(null);
const SortableListItemContext = createContext<SortableListItemContextProps>(null);

const style = {
  cursor: 'move',
};

interface DragItem {
  index: number;
  type: string;
}

export const SortableListItem: FunctionComponent = ({ children }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { moveItem } = useContext(SortableListContext);
  const { index } = useContext(SortableListItemContext);
  const [, drop] = useDrop({
    accept: sortableListSymbol,
    hover(item: DragItem, monitor: DropTargetMonitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect();

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

  const [{ isDragging }, drag] = useDrag({
    item: { type: sortableListSymbol, index },
    collect: (monitor: any) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const opacity = isDragging ? 0 : 1;
  drag(drop(ref));

  return (
    <ListItem button disableRipple ref={ref} style={{ ...style, opacity }}>
      {children}
    </ListItem>
  );
};

const SortableListItemWrapper: FunctionComponent<{ index: number }> = ({ index, children }) => {
  const itemContext: SortableListItemContextProps = useMemo(() => ({ index }), [index]);
  return <SortableListItemContext.Provider value={itemContext}>{children}</SortableListItemContext.Provider>;
};

// Only works if children are an array of (indirect) items, i.e.: each child correspond to exactly one item
export const SortableList: FunctionComponent<{ moveItem: (from: number, to: number) => void; }> = ({ moveItem, children }) => {
    const listContext: SortableListContextProps = useMemo(() => ({ moveItem }), [moveItem]);

    return (
      <SortableListContext.Provider value={listContext}>
        <List>
          {Children.map(children, (child, index) => (
            <SortableListItemWrapper index={index}>
              {child}
            </SortableListItemWrapper>
          ))}
        </List>
      </SortableListContext.Provider>
    );
};
