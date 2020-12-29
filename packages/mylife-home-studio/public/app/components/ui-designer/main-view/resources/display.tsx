import React, { ChangeEvent, FunctionComponent, useState } from 'react';
import clsx from 'clsx';
import { makeStyles, darken } from '@material-ui/core/styles';
import Toolbar from '@material-ui/core/Toolbar';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Typography from '@material-ui/core/Typography';

import { useTabSelector } from '../../../lib/use-tab-selector';
import { getResource } from '../../../../store/ui-designer/selectors';
import Image, { useImageSizeWithElement } from './image';
import { makeDataUrl } from './utils';

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  image: {
    flex: '1 1 auto',
  },
  toolbar: {
    backgroundColor: darken(theme.palette.background.paper, 0.03)
  },
  toolbarTitle: {
    flex: 1,
    textAlign: 'center',
  }
}));

export type DisplayStyle = 'fit' | 'original';

const Display : FunctionComponent<{ id: string; className?: string; }> = ({ id, className }) => {
  const classes = useStyles();
  const resource = useTabSelector((state, tabId) => getResource(state, tabId, id));
  const url = makeDataUrl(resource);
  const [size, onLoad] = useImageSizeWithElement(url);
  const [style, setStyle] = useState<DisplayStyle>('fit');

  const handleChangeStyle = (event: ChangeEvent<HTMLInputElement>) => {
    setStyle(event.currentTarget.value as DisplayStyle);
  };

  return (
    <div className={clsx(className, classes.container)}>

      <Toolbar className={classes.toolbar}>
        <RadioGroup row value={style} onChange={handleChangeStyle}>
          <FormControlLabel value="fit" control={<Radio color="primary" />} label="Fit" />
          <FormControlLabel value="original" control={<Radio color="primary" />} label="Original" />
        </RadioGroup>

        <Typography variant="h6" className={classes.toolbarTitle}>
          {resource.id}
        </Typography>

        {size && (
          <Typography className={classes.toolbar}>{`${size.width} x ${size.height}`}</Typography>
        )}
      </Toolbar>

      <Image className={classes.image} source={url} onLoad={onLoad} style={style} />

    </div>
  );
};

export default Display;