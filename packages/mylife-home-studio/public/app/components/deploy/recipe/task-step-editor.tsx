import React, { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';

import { AppState } from '../../../store/types';
import { getTasksIds, getTask, getTaskGetter } from '../../../store/deploy/selectors';
import { TaskStepConfig, Task, TaskParameters } from '../../../store/deploy/types';
import { SetStepConfig, useStyles } from './step-editor';

const TaskStepEditor: FunctionComponent<{ step: TaskStepConfig; setStep: SetStepConfig }> = ({ step, setStep }) => {
  const getTask = useSelector(getTaskGetter);

  const handleTaskChange = (newTask: string) => {
    const task = getTask(newTask);
    const parameters = initTaskParameters(task);
    const newStep: TaskStepConfig = { ...step, task: newTask, parameters };
    setStep(newStep);
  };

  const handleParameterChange = (name: string, value: any) => {
    const newParameters = { ...step.parameters, [name]: value };
    const newStep: TaskStepConfig = { ...step, parameters: newParameters };
    setStep(newStep);
  };

  return (
    <>
      <TaskSelector value={step.task} onChange={handleTaskChange} />
      <TaskParametersEditor task={step.task} parameters={step.parameters} onChange={handleParameterChange} />
    </>
  );
};

export default TaskStepEditor;

function initTaskParameters(task: Task) {
  const parameters: TaskParameters = {};
  for (const { name, default: defaultValue } of task.metadata.parameters) {
    parameters[name] = defaultValue || '';
  }
  return parameters;
}

const TaskSelector: FunctionComponent<{ value: string; onChange: (newValue: string) => void }> = ({ value, onChange }) => {
  const classes = useStyles();
  const tasksIds = useSelector(getTasksIds);
  const taskMeta = useSelector((state: AppState) => getTask(state, value));
  const description = taskMeta?.metadata?.description; // in case task is null

  return (
    <Autocomplete
      className={classes.itemWidth}
      value={value}
      onChange={(event: React.ChangeEvent, newValue: string) => onChange(newValue)}
      options={tasksIds}
      disableClearable
      renderInput={(params) => <TextField {...params} label="Tâche" helperText={description} variant="outlined" className={classes.autoCompleteInput} />}
    />
  );
};

const TaskParametersEditor: FunctionComponent<{ task: string; parameters: TaskParameters; onChange: (name: string, value: any) => void }> = ({ task, parameters, onChange }) => {
  const classes = useStyles();
  const taskMeta = useSelector((state: AppState) => getTask(state, task));

  // in case task is null
  if (!taskMeta) {
    return null;
  }

  return (
    <>
      {taskMeta.metadata.parameters.map((parameter) => (
        <TextField
          key={parameter.name}
          className={classes.itemWidth}
          label={parameter.name}
          helperText={parameter.description}
          variant="outlined"
          value={parameters[parameter.name] || ''}
          onChange={(e) => onChange(parameter.name, e.target.value)}
        />
      ))}
    </>
  );
};
