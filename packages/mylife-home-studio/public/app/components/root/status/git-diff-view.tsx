import React, { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';

import { AppState } from '../../../store/types';
import { getGitDiffChunk } from '../../../store/git/selectors';
import { diff } from '../../../store/git/types';

// https://github.com/olahol/viewdiff/blob/master/client.js

const DiffView: FunctionComponent<{ chunks: string[]; }> = ({ chunks }) => {
  return (
    <table>
      {chunks.map(chunkId => (
        <ChunkView key={chunkId} chunkId={chunkId} />
      ))}
    </table>
  );
};

export default DiffView;

const ChunkView: FunctionComponent<{ chunkId: string }> = ({ chunkId }) => {
  const chunk = useSelector((store: AppState) => getGitDiffChunk(store, chunkId));

  return (
    <tbody>
      <tr className="chunk">
        <td className="nostretch">---</td>
        <td className="nostretch">+++</td>
        <td>{chunk.content}</td>
      </tr>
      {chunk.changes.map(change => (
        <Change change={change} />
      ))}
    </tbody>
  );
};

const Change: FunctionComponent<{ change: diff.Change }> = ({ change }) => {
  const ln1 = change.type === 'normal' ? change.ln1 : change.ln;
  const ln2 = change.type === 'normal' ? change.ln2 : change.ln;

  return (
    <tr className={change.type}>
      <td className="nostretch">
        {change.type !== 'add' && ln1}
      </td>
      <td className="nostretch">
        {change.type !== 'del' && ln2}
      </td>
      <td>
        {change.content}
      </td>
    </tr>
  );
}
