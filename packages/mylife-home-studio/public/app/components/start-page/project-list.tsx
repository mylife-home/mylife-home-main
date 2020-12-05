import React, { FunctionComponent, useRef } from 'react';
import { useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Button from '@material-ui/core/Button';

import { useFireAsync } from '../lib/use-error-handling';
import { getUiProjectsIds } from '../../store/projects-list/selectors';
import { importV1Project } from '../../store/projects-list/actions';
import { useAction } from '../lib/use-actions';

const useStyles = makeStyles((theme) => ({
}));

const ProjectList: FunctionComponent = () => {
  const classes = useStyles();
  const ids = useSelector(getUiProjectsIds);

  return (
    <>
      <List>
        {ids.map((id) => {
          <ListItem key={id}>
            <ListItemText primary={id} />
          </ListItem>
        })}
      </List>
      
      <ImportV1Button />
    </>
  );
};

export default ProjectList;

const ImportV1Button = () => {
  const inputRef = useRef<HTMLInputElement>();
  const fireAsync = useFireAsync();
  const doImport = useAction(importV1Project);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files[0];
    fireAsync(async () => {
      const content = await file.text();
      doImport({ type: 'ui', content });
    });
  };

  return (
    <>
      <input ref={inputRef} type="file" hidden onChange={handleUpload} />
        <Button onClick={() => inputRef.current.click()}>Import V1</Button>
    </>
  );
}
