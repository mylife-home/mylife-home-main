import React, { FunctionComponent } from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import Slider, { Mark } from '@material-ui/core/Slider';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';

import { ImageIcon } from '../../../lib/icons';
import QuickAccess from '../../../lib/quick-access';
import { useSelection, useCreateControl, SelectionType, useSelectableControlList, useViewType } from './view-state';
import { useCreatable } from './canvas/dnd';
import { useSnapEditor } from './snap';
import PropertiesWindow from './properties/window';
import PropertiesTemplate from './properties/template';
import PropertiesControl from './properties/control';
import { UiViewType } from '../../../../store/ui-designer/types';

const useStyles = makeStyles(
  (theme) => ({
    container: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,

      display: 'flex',
      flexDirection: 'column',
      alignItems: 'stretch',
    },
    controls: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
    },
    control: {
      margin: theme.spacing(2),
      color: theme.palette.success.main,
      cursor: 'copy',
    },
    snapEditor: {
      flex: 1,
      margin: theme.spacing(2),
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    snapSliderWrapper: {
      width: '100%',
      paddingLeft: theme.spacing(4),
      paddingRight: theme.spacing(4),
    },
    controlSelector: {
      margin: theme.spacing(2),
      flex: 1,
    },
    properties: {
      flex: 1,
      overflowY: 'auto',
    },
  }),
  { name: 'window-toolbox' }
);

const Toolbox: FunctionComponent<{ className?: string }> = ({ className }) => {
  const classes = useStyles();
  const { type, id } = useSelection();
  const viewType = useViewType();

  return (
    <div className={clsx(classes.container, className)}>
      <Controls />
      <Divider />
      {getProperties(viewType, type, id, classes.properties)}
    </div>
  );
};

export default Toolbox;

const Controls: FunctionComponent = () => {
  const classes = useStyles();
  const { controlsList, selectControl } = useSelectableControlList();

  return (
    <div className={classes.controls}>
      <Control />
      <SnapEditor />
      <QuickAccess className={classes.controlSelector} list={controlsList} onSelect={selectControl} />
    </div>
  );
};

const Control: FunctionComponent = () => {
  const classes = useStyles();
  const onCreate = useCreateControl();
  const ref = useCreatable(onCreate);

  return (
    <Tooltip title="Drag and drop sur la fenêtre pour ajouter un contrôle">
      <IconButton disableRipple className={classes.control} ref={ref}>
        <ImageIcon fontSize="large" />
      </IconButton>
    </Tooltip>
  );
};

const MARKS = buildMarks();

const SnapEditor: FunctionComponent = () => {
  const classes = useStyles();
  const { value, setValue } = useSnapEditor();

  return (
    <div className={classes.snapEditor}>
      <Typography gutterBottom>Grille de positionnement</Typography>
      <div className={classes.snapSliderWrapper}>
        <Slider value={value} onChange={(e, newValue) => setValue(newValue as number)} min={1} max={20} marks={MARKS} valueLabelDisplay="auto" />
      </div>
    </div>
  );
};

function buildMarks() {
  const visibleMarks = new Set([1, 5, 10, 15, 20]);
  const marks: Mark[] = [];

  for (let index = 1; index <= 20; ++index) {
    const mark: Mark = { value: index };
    if (visibleMarks.has(index)) {
      mark.label = index.toString();
    }

    marks.push(mark);
  }

  return marks;
}

function getProperties(viewType: UiViewType, type: SelectionType, id: string, className: string) {
  switch (type) {
    case 'view':
      switch (viewType) {
        case 'window':
          return <PropertiesWindow className={className} />;
        case 'template':
          return <PropertiesTemplate className={className} />;
      }
    case 'control':
      return <PropertiesControl id={id} className={className} />;
  }
}