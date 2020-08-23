import React, { FunctionComponent } from 'react';

import Typography from '@material-ui/core/Typography';
import Slider from '@material-ui/core/Slider';

import { useZoom } from './base/zoom';

const ZoomSlider: FunctionComponent = () => {
  const { zoom, slideZoom } = useZoom();

  return (
    <>
      <Typography gutterBottom>
        zoom: {zoom}
      </Typography>
      <Slider min={10} max={100} step={10} value={zoom} onChange={(e, zoom) => slideZoom(zoom as number)} />
    </>
  );
};

export default ZoomSlider;
