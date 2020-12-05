import React, { FunctionComponent, useRef } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';

import { addLineBreaks } from '../../lib/add-line-breaks';
import { useFireAsync } from '../../lib/use-error-handling';

const useStyles = makeStyles((theme) => ({
}));

type CreateNewCallback = (id: string) => void;
type ImportV1Callback = (content: string) => void;

export interface ProjectListProps {
  onCreateNew: CreateNewCallback;
  onImportV1: ImportV1Callback;
}

export const ProjectList: FunctionComponent<ProjectListProps> = ({ onCreateNew, onImportV1, children }) => {
  const classes = useStyles();

  return (
    <>
      <List>
        {children}
      </List>
      
      <ImportV1Button onImportV1={onImportV1} />
    </>
  );
};

type DeleteCallback = () => void;
type RenameCallback = (newId: string) => void;

export interface ProjectItemProps {
  id: string;
  info: string[];
  onDelete: DeleteCallback;
  onRename: RenameCallback;
}

export const ProjectItem: FunctionComponent<ProjectItemProps> = ({ id, info, onDelete, onRename }) => {
  const classes = useStyles();

  return (
    <Tooltip title={addLineBreaks(info)}>
      <ListItem>
        <ListItemText primary={id} />
      </ListItem>
    </Tooltip>
  );
};

const ImportV1Button: FunctionComponent<{ onImportV1: ImportV1Callback }> = ({ onImportV1 }) => {
  const inputRef = useRef<HTMLInputElement>();
  const fireAsync = useFireAsync();

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files[0];
    fireAsync(async () => {
      const content = await file.text();
      onImportV1(content);
    });
  };

  return (
    <>
      <input ref={inputRef} type="file" hidden onChange={handleUpload} />

      <Tooltip title='Import v1'>
        <IconButton onClick={() => inputRef.current.click()}>
          <CloudUploadIcon />
        </IconButton>
      </Tooltip>
    </>
  );
};
