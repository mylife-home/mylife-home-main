import React, { FunctionComponent } from 'react';

import Typography from '@material-ui/core/Typography';
import Slider from '@material-ui/core/Slider';
import Tooltip from '@material-ui/core/Tooltip';

import { useZoom } from './drawing/viewport-manips';

interface ZoomSliderProps {
  className?: string;
}

const ZoomSlider: FunctionComponent<ZoomSliderProps> = ({ className }) => {
  const { zoom, slideZoom } = useZoom();
  
  const handleSlideZoom = (e: React.ChangeEvent, newZoom: number) => {
    if (newZoom !== zoom) {
      slideZoom(newZoom);
    }
  };

  return (
    <div className={className}>
      <Tooltip title={`${zoom} %`}>
        <Slider min={10} max={100} step={10} value={zoom} onChange={handleSlideZoom} />
      </Tooltip>
    </div>
  );
};

export default ZoomSlider;
