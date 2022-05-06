import React, { FunctionComponent, useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import AddIcon from '@material-ui/icons/Add';
import ClearIcon from '@material-ui/icons/Clear';

import { useTabSelector } from '../../../lib/use-tab-selector';
import { AppState } from '../../../../store/types';
import { getStyle, getStylesIds } from '../../../../store/ui-designer/selectors';

const useStyles = makeStyles((theme) => ({
  item: {
    display: 'flex',
    alignItems: 'center',

    '& > :first-child': {
      flex: '1 1 auto'
    }
  },
  newButton: {
    alignSelf: 'flex-start',

    color: theme.palette.success.main,
    padding: theme.spacing(0.5),
    margin: theme.spacing(-0.5),
  },
  deleteButton: {
    color: theme.palette.error.main,
    padding: theme.spacing(0.5),
    margin: theme.spacing(-0.5),
  }
}), { name: 'properties-style-selector' });

const StyleSelector: FunctionComponent<{ value: string[], onChange: (value: string[]) => void; }> = ({ value, onChange }) => {
  const handleDelete = (id: string) => {
    onChange(value.filter(item => item !== id));
  };

  const handleAdd = (id: string) => {
    onChange([...value, id]);
  }
  
  return (
    <>
      {value.map(id => 
        <StyleValue key={id} id={id} onDelete={() => handleDelete(id)} />
      )}

      <NewStyleValueButton existing={value} onAdd={id => handleAdd(id)} />
    </>
  );
};

export default StyleSelector;

const StyleValue: FunctionComponent<{ id: string; onDelete: () => void; }> = ({ id, onDelete }) => {
  const classes = useStyles();
  const style = useSelector((state: AppState) => getStyle(state, id));

  return (
    <div className={classes.item}>
      <Typography>{style.styleId}</Typography>

      <Tooltip title="Supprimer l'élément de style">
        <IconButton className={classes.deleteButton} onClick={onDelete}>
          <ClearIcon />
        </IconButton>
      </Tooltip>
    </div>
  );
};

const NewStyleValueButton: FunctionComponent<{ existing: string[]; onAdd: (id: string) => void; }> = ({ existing, onAdd }) => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement>(null);

  const allStyles = useTabSelector(getStylesIds);

  const stylesIds = useMemo(() => {
    const set = new Set(existing);
    return allStyles.filter(id => !set.has(id));
  }, [allStyles, existing]);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleItemClick = (id: string) => {
    handleClose();
    onAdd(id);
  };

  return (
    <>
      <Tooltip title="Nouveau élément de style">
        <IconButton className={classes.newButton} onClick={handleClick} disabled={stylesIds.length === 0}>
          <AddIcon />
        </IconButton>
      </Tooltip>

      <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={handleClose}>
        {stylesIds.map(id => (
          <StyleMenuItem key={id} id={id} onClick={() => handleItemClick(id)} />
        ))}
      </Menu>
    </>
  );
};

const StyleMenuItem: FunctionComponent<{ id: string; onClick: () => void; }> = ({ id, onClick }) => {
  const style = useSelector((state: AppState) => getStyle(state, id));

  return (
    <MenuItem onClick={onClick}>{style.styleId}</MenuItem>
  );
};