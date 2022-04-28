import React, { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';

import { AppState } from '../../../store/types';
import { getGitDiffChunk } from '../../../store/git/selectors';
import { diff } from '../../../store/git/types';

// https://github.com/olahol/viewdiff/blob/master/client.js

const useStyles = makeStyles((theme) => ({
  table: {
    fontFamily: `Consolas, 'Liberation Mono', Menlo, Courier, monospace;`,
    borderCollapse: 'collapse',
    width: '100%',
  },

  td: {
    padding: '5px 10px',
    fontSize: '12px',
  },

  noStretch: {
    width: '1%',
    whiteSpace: 'nowrap',
  },

  chunkTd: {
    padding: '15px 10px',
    fontSize: '12px',
  },

  chunk: {
    backgroundColor: '#f4f7fb',
    color: '#bbb',
  },

  normal: {

  },

  add: {
    backgroundColor: '#dbffdb',
    fontWeight: 600,
  },

  del: {
    backgroundColor: '#ffdddd',
    fontWeight: 600,
  }
}));

const DiffView: FunctionComponent<{ chunks: string[]; }> = ({ chunks }) => {
  const classes = useStyles();

  return (
    <table className={classes.table}>
      {chunks.map(chunkId => (
        <ChunkView key={chunkId} chunkId={chunkId} />
      ))}
    </table>
  );
};

export default DiffView;

const ChunkView: FunctionComponent<{ chunkId: string }> = ({ chunkId }) => {
  const classes = useStyles();
  const chunk = useSelector((store: AppState) => getGitDiffChunk(store, chunkId));

  return (
    <tbody>
      <tr className={classes.chunk}>
        <td className={clsx(classes.noStretch, classes.chunkTd)}>---</td>
        <td className={clsx(classes.noStretch, classes.chunkTd)}>+++</td>
        <td className={classes.td}>{chunk.content}</td>
      </tr>
      {chunk.changes.map(change => (
        <Change change={change} />
      ))}
    </tbody>
  );
};

const Change: FunctionComponent<{ change: diff.Change }> = ({ change }) => {
  const classes = useStyles();
  const ln1 = change.type === 'normal' ? change.ln1 : change.ln;
  const ln2 = change.type === 'normal' ? change.ln2 : change.ln;

  return (
    <tr className={classes[change.type]}>
      <td className={clsx(classes.noStretch, classes.td)}>
        {change.type !== 'add' && ln1}
      </td>
      <td className={clsx(classes.noStretch, classes.td)}>
        {change.type !== 'del' && ln2}
      </td>
      <td className={classes.td}>
        {change.content}
      </td>
    </tr>
  );
}
