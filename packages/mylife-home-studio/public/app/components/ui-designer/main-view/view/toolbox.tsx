import React, { FunctionComponent, useMemo } from 'react';
import { useSelector } from 'react-redux';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import Slider, { Mark } from '@material-ui/core/Slider';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';

import { ImageIcon, TextIcon, TemplateIcon } from '../../../lib/icons';
import QuickAccess from '../../../lib/quick-access';
import { useTabSelector } from '../../../lib/use-tab-selector';
import { useSelection, useCreateControl, useCreateTemplateInstance, SelectionType, useSelectableElementList, useViewType, useViewId } from './view-state';
import { useControlCreatable, useTemplateInstanceCreatable } from './canvas/dnd';
import { useSnapEditor } from './snap';
import PropertiesWindow from './properties/window';
import PropertiesTemplate from './properties/template';
import PropertiesControl from './properties/control';
import PropertiesTemplateInstance from './properties/template-instance';
import { AppState } from '../../../../store/types';
import { UiViewType } from '../../../../store/ui-designer/types';
import { getTemplatesIds, getTemplate } from '../../../../store/ui-designer/selectors';

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
    newElement: {
      color: theme.palette.success.main,
    },
    dndCreate: {
      margin: 0,
      padding: 0,
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
    elementSelector: {
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
      <Elements />
      <Divider />
      {getProperties(viewType, type, id, classes.properties)}
    </div>
  );
};

export default Toolbox;

const Elements: FunctionComponent = () => {
  const classes = useStyles();
  const { elementsList, selectElement } = useSelectableElementList();

  return (
    <div className={classes.controls}>
      <NewElement />
      <SnapEditor />
      <QuickAccess className={classes.elementSelector} list={elementsList} onSelect={selectElement} />
    </div>
  );
};

const NewElement: FunctionComponent = () => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const templatesIds = useTabSelector(getTemplatesIds);
  const viewType = useViewType();
  const viewId = useViewId();

  const usableTemplatesIds = useMemo(() => {
    switch (viewType) {
      case 'window':
        return templatesIds;
      case 'template':
        return templatesIds.filter(id => id !== viewId);
    }
  }, [templatesIds, viewType, viewId]);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Tooltip title="Ajouter un contrôle ou un template">
        <IconButton className={classes.newElement} onClick={handleClick}>
          <ImageIcon fontSize="large" />
        </IconButton>
      </Tooltip>

      <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={handleClose}>
        <ListSubheader>
          {`Contrôles`}
        </ListSubheader>

        <NewControlMenuItem type='display' onClose={handleClose} />
        <NewControlMenuItem type='text' onClose={handleClose} />

        {usableTemplatesIds.length > 0 && (
          <ListSubheader>
            {`Templates`}
          </ListSubheader>
        )}

        {usableTemplatesIds.map(templateId => (
          <NewTemplateInstanceMenuItem key={templateId} templateId={templateId} onClose={handleClose} />
        ))}
      </Menu>
    </>
  );
};

const NewControlMenuItem: FunctionComponent<{ type: 'display' | 'text'; onClose: () => void; }> = ({ type, onClose }) => {
  const classes = useStyles();
  const onCreate = useCreateControl(type);
  const ref = useControlCreatable(onCreate);

  return (
    <MenuItem button={false}>
      <ListItemIcon>
        <Tooltip title="Drag and drop sur la fenêtre pour ajouter un contrôle">
          <IconButton disableRipple className={classes.dndCreate} ref={ref} onMouseDown={onClose}>
            {type === 'display' && (
              <ImageIcon />
            )}

            {type === 'text' && (
              <TextIcon />
            )}
          </IconButton>
        </Tooltip>
      </ListItemIcon>
      <ListItemText>
        {type === 'display' && (
          <>Type image</>
        )}

        {type === 'text' && (
          <>Type texte</>
        )}
      </ListItemText>
    </MenuItem>
  );
};

const NewTemplateInstanceMenuItem: FunctionComponent<{ templateId: string; onClose: () => void; }> = ({ templateId, onClose }) => {
  const classes = useStyles();
  const onCreate = useCreateTemplateInstance(templateId);
  const template = useSelector((state: AppState) => getTemplate(state, templateId));

  const size = useMemo(() => {
    const { width, height } = template;
    return { width, height };
  }, [template.width, template.height]);

  const ref = useTemplateInstanceCreatable(size, onCreate);

  return (
    <MenuItem button={false}>
      <ListItemIcon>
        <Tooltip title="Drag and drop sur la fenêtre pour ajouter un template">
          <IconButton disableRipple className={classes.dndCreate} ref={ref} onMouseDown={onClose}>
            <TemplateIcon />
          </IconButton>
        </Tooltip>
      </ListItemIcon>
      <ListItemText>
        {template.templateId}
      </ListItemText>
    </MenuItem>
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
    case 'template-instance':
      return <PropertiesTemplateInstance id={id} className={className} />;
  }
}
