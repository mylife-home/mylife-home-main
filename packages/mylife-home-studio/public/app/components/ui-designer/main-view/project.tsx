import React, { FunctionComponent, useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import Button, { ButtonProps } from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Typography from '@material-ui/core/Typography';
import CheckIcon from '@material-ui/icons/Check';
import PublishIcon from '@material-ui/icons/Publish';

import { Container, Title } from '../../lib/main-view-layout';
import { ProjectIcon, ComponentIcon, InstanceIcon } from '../../lib/icons';
import { useTabPanelId } from '../../lib/tab-panel';
import { useFireAsync } from '../../lib/use-error-handling';
import { AppState } from '../../../store/types';
import { getDefaultWindow } from '../../../store/ui-designer/selectors';
import { setDefaultWindow, validateProject } from '../../../store/ui-designer/actions';
import { DefaultWindow } from '../../../../../shared/ui-model';
import WindowSelector from './common/window-selector';
import { Group, Item } from './common/properties-layout';

const useStyles = makeStyles((theme) => ({
  wrapper: {
    position: 'absolute',
    left: 0,
    width: 450,
    top: 0,
    bottom: 0,

    display: 'flex',
    flexDirection: 'column',
  },
  button: {
    margin: theme.spacing(2),
    padding: `${theme.spacing(2)}px ${theme.spacing(3)}px`,
  },
}));

const Project: FunctionComponent = () => {
  const classes = useStyles();
  const { defaultWindow, updateDefaultWindow } = useProjectConnect();
  const validateProject = useProjectValidation();

  return (
    <Container title={<Title text="Projet" icon={ProjectIcon} />}>
      <div className={classes.wrapper}>
        <Group title={'Fenêtre par défaut'}>
          <Item title={'Desktop'}>
            <WindowSelector value={defaultWindow.desktop} onChange={(id) => updateDefaultWindow('desktop', id)} />
          </Item>
          <Item title={'Mobile'}>
            <WindowSelector value={defaultWindow.mobile} onChange={(id) => updateDefaultWindow('mobile', id)} />
          </Item>
        </Group>

        <Group title={'Opérations'}>
          <Item>
            <ButtonMenu className={classes.button} variant="contained" startIcon={<ComponentIcon />} text={'Rafraîchir les composants'}>
              <MenuItem onClick={() => console.log('TODO')}>
                <ListItemIcon>
                  <ProjectIcon fontSize="small" />
                </ListItemIcon>
                <Typography variant="inherit" noWrap>
                  Depuis un projet core
                </Typography>
              </MenuItem>
              <MenuItem onClick={() => console.log('TODO')}>
                <ListItemIcon>
                  <InstanceIcon fontSize="small" />
                </ListItemIcon>
                <Typography variant="inherit" noWrap>
                  Depuis les instances en ligne
                </Typography>
              </MenuItem>
            </ButtonMenu>
          </Item>

          <Item>
            <Button className={classes.button} onClick={validateProject} variant="contained" startIcon={<CheckIcon />}>
              Valider
            </Button>
          </Item>

          <Item>
            <Button className={classes.button} onClick={() => console.log('TODO')} variant="contained" startIcon={<PublishIcon />}>
              Déployer
            </Button>
          </Item>
        </Group>
      </div>
    </Container>
  );
};

export default Project;

function useProjectConnect() {
  const tabId = useTabPanelId();
  const defaultWindow = useSelector((state: AppState) => getDefaultWindow(state, tabId));
  const dispatch = useDispatch();

  const updateDefaultWindow = useCallback(
    (type: string, windowId: string) => {
      const newDefaultWindow: DefaultWindow = { ...defaultWindow, [type]: windowId };
      dispatch(setDefaultWindow({ id: tabId, defaultWindow: newDefaultWindow }));
    },
    [defaultWindow, dispatch]
  );

  return { defaultWindow, tabId, updateDefaultWindow };
}

function useProjectValidation() {
  const tabId = useTabPanelId();
  const dispatch = useDispatch();
  const fireAsync = useFireAsync();

  return useCallback(() => {
    fireAsync(async () => {
      const validatorErrors = await dispatch(validateProject({ id: tabId }));
      console.log('TODO', validatorErrors);
    });
  }, [tabId, dispatch, fireAsync]);
}

const ButtonMenu: FunctionComponent<ButtonProps & { text: string }> = ({ text, children, ...props }) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Button {...props} onClick={handleClick}>
        {text}
      </Button>

      <Menu
        getContentAnchorEl={null}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        keepMounted
        anchorEl={anchorEl}
        open={!!anchorEl}
        onClose={handleClose}
        onClick={handleClose}
      >
        {children}
      </Menu>
    </>
  );
};
