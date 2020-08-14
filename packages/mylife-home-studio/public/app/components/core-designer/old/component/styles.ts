import { makeStyles, darken } from '@material-ui/core/styles';
import { useCanvasContext } from '../canvas';

interface StyleProps {
    gridSize: number;
  }
  
  const useStyles = makeStyles((theme) => {
    const backgroundColor = darken(theme.palette.background.paper, 0.03);
    const borderColor = darken(theme.palette.background.paper, 0.1);
    const borderColorSelected = theme.palette.primary.main;
  
    return {
      root: {
        position: 'absolute',
        display: 'flex',
        flexDirection: 'column',
  
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor,
        boxSizing: 'content-box',
  
        backgroundColor
      },
  
      selected: {
        borderWidth: 2,
        borderColor: borderColorSelected
      },

      dragging: {
        opacity: 0,
      },
  
      item: (props: StyleProps) => ({
        userSelect: 'none',
        paddingLeft: props.gridSize / 2,
  
        height: props.gridSize,
        lineHeight: (props.gridSize - 1) + 'px',
        fontSize: props.gridSize * 0.6,
  
        '& > p': {
          lineHeight: 'inherit',
          fontSize: 'inherit',
          fontWeight: 'inherit'
        },
  
        '& > svg': {
          lineHeight: 'inherit',
          fontSize: 'inherit',
        },
      }),
  
      title: {
        backgroundColor: borderColor,
        cursor: 'grab',
        fontWeight: 'bold'
      },
  
      prop: (props: StyleProps) => ({
        borderTopStyle: 'solid',
        borderTopWidth: 1,
        borderTopColor: borderColor,
  
        cursor: 'pointer',
  
        display: 'flex',
        alignItems: 'center',
  
        '& > p': {
          marginLeft: props.gridSize / 2,
        }
      }),
  
      state: {
      },
  
      action: {
      }
    };
  });
  
  export function useComponentStyles() {
    const canvasContext = useCanvasContext();
    return useStyles({ gridSize: canvasContext.gridSize });
  }
  