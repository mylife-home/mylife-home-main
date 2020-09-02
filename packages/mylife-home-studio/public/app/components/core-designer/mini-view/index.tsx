import React, { FunctionComponent, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { makeStyles, darken } from '@material-ui/core/styles';
import clsx from 'clsx';

import { useTabPanelId } from '../../lib/tab-panel';
import { LAYER_SIZE } from '../drawing/defs';
import { Point } from '../drawing/types';
import SquareBox from './square-box';
import Canvas from './canvas';
import Component from './component';
import MainViewMark from './main-view-mark';
import { usePosition } from '../drawing/viewport-manips';

import { AppState } from '../../../store/types';
import { getComponentIds } from '../../../store/core-designer/selectors';

export interface MiniViewProps {
  className?: string;
}

const useStyles = makeStyles((theme) => ({
  container: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: darken(theme.palette.background.paper, 0.1),
    position: 'relative',
  }
}));

const MiniView: FunctionComponent<MiniViewProps> = ({ className }) => {
  const classes = useStyles();
  const [size, setSize] = useState(1);
  const scale = size / LAYER_SIZE;
  const { componentIds } = useConnect();
  const clickHandler = useClickHandler(scale);

  return (
    <SquareBox adjust='height' className={clsx(classes.container, className)}>
      <Canvas size={size} scale={scale} onSizeChange={setSize} onClick={clickHandler}>

        {componentIds.map((id) => (
          <Component key={id} componentId={id} />
        ))}

        <MainViewMark scale={scale}/>

        </Canvas>
    </SquareBox>
  );
};

export default MiniView;

function useClickHandler(scale: number) {
  const { setLayerPosition } = usePosition();

  return useCallback((pos: Point) => {
    const layerPosition = {
      x: pos.x / scale,
      y: pos.y / scale,
    };

    setLayerPosition(layerPosition);

  }, [scale, setLayerPosition]);
}

function useConnect() {
  const tabId = useTabPanelId();
  return {
    componentIds: useSelector((state: AppState) => getComponentIds(state, tabId))
  };
}