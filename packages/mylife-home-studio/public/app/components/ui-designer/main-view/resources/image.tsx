import React, { SyntheticEvent, FunctionComponent, useState, useEffect, useCallback } from 'react';
import { AutoSizer } from 'react-virtualized';
import { makeStyles } from '@material-ui/core/styles';
import { DisplayStyle } from './display';

export type Size = { width: number; height: number; };

const useStyles = makeStyles((theme) => ({
  containerFit: {
  },
  containerOriginal: {
    overflow: 'auto',
  },
  imageFit: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
  },
  imageOriginal: {
  },
}));

export interface ImageProps {
  className?: string;
  source: string;
  style: DisplayStyle;
  onLoad: (e: SyntheticEvent<HTMLImageElement>) => void;
}

const Image: FunctionComponent<ImageProps> = ({ className, source, style, onLoad }) => {
  const classes = useStyles();
  const containerClass = style === 'fit' ? classes.containerFit : classes.containerOriginal;
  const imageClass = style === 'fit' ? classes.imageFit : classes.imageOriginal;

  return (
    <div className={className}>
      <AutoSizer>
        {({ height, width }) => (
          <div style={{height, width}} className={containerClass}>
            <img className={imageClass} src={source} onLoad={onLoad} />
          </div>
        )}
      </AutoSizer>
    </div>
  );
};

export default Image;

export function useImageSizeWithElement(url: string): [Size, (e: SyntheticEvent<HTMLImageElement>) => void] {
  const [size, setSize] = useState<Size>(null);

  const onLoad = useCallback((e: SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth: width , naturalHeight: height } = e.currentTarget;
    setSize({ width, height });
  }, [setSize]);

  useEffect(() => {
    setSize(null);
  }, [url]);

  return [size, onLoad];
};
