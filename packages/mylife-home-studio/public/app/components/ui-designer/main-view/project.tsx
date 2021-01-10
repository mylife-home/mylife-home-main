import React, { FunctionComponent } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import { Container, Title } from '../../lib/main-view-layout';
import { ProjectIcon } from '../../lib/icons';
import { useTabSelector } from '../../lib/use-tab-selector';
import { getDefaultWindow } from '../../../store/ui-designer/selectors';

const useStyles = makeStyles((theme) => ({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,

    display: 'flex',
    flexDirection: 'row',
  },
}));

const Project: FunctionComponent = () => {
  const classes = useStyles();
  const defaultWindow = useTabSelector(getDefaultWindow);
  
  return (
    <Container
      title={
        <Title text="Projet" icon={ProjectIcon} />
      }
    >
      <div className={classes.wrapper}>
        TODO
        {JSON.stringify(defaultWindow)}
      </div>
    </Container>
  );
};

export default Project;
