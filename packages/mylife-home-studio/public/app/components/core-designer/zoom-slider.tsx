import React, { FunctionComponent, useState, useCallback } from 'react';
import Konva from 'konva';

import Typography from '@material-ui/core/Typography';
import Slider from '@material-ui/core/Slider';

import { useViewInfo } from './base/view-info';

const ZoomSlider: FunctionComponent = () => {
  const [zoom, setZoom] = useZoom();

  return (
    <>
      <Typography gutterBottom>
        zoom: {zoom}
      </Typography>
      <Slider min={10} max={100} step={10} value={zoom} onChange={(e, zoom) => setZoom(zoom as number)} />
    </>
  );
};

export default ZoomSlider;

function useZoom(): [number, (value: number) => void] {
  const [viewInfo, setViewInfo] = useViewInfo();

  const zoom = Math.round(viewInfo.scale * 100);
  const setZoom = useCallback((value: number) => setViewInfo((viewInfo) => ({ ...viewInfo, scale: value / 100 })), [setViewInfo]);

  return [zoom, setZoom];
}
