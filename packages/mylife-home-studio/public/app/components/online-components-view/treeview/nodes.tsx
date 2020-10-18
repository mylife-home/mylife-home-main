import React, { FunctionComponent, useContext, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import TreeItem from '@material-ui/lab/TreeItem';

import { AppState } from '../../../store/types';
import { getInstancesIds, getInstance, getPluginsIds, getPlugin, getComponentsIds, getComponent, getState } from '../../../store/online-components-view/selectors';
import { NodeType } from '../common';
import { ConfigContext, makeNodeId, NodeRepositoryContext } from './common';
import { LabelContainer, LabelIcon, LabelPart } from './label';

export const Instances: FunctionComponent = () => {
  const instancesIds = useSelector(getInstancesIds);
  return (
    <>
      {instancesIds.map((id) => (
        <Instance key={id} id={id} />
      ))}
    </>
  );
};

export const Plugins: FunctionComponent = () => {
  const pluginsIds = useSelector(getPluginsIds);
  return (
    <>
      {pluginsIds.map((id) => (
        <Plugin key={id} id={id} />
      ))}
    </>
  );
};

export const Components: FunctionComponent = () => {
  const componentsIds = useSelector(getComponentsIds);
  return (
    <>
      {componentsIds.map((id) => (
        <Component key={id} id={id} />
      ))}
    </>
  );
};

const Instance: FunctionComponent<{ id: string }> = ({ id }) => {
  const nodeId = useNode('instance', id);
  const { instance: config } = useContext(ConfigContext);
  const instance = useSelector((state: AppState) => getInstance(state, id));

  return (
    <TreeItem
      nodeId={nodeId}
      label={
        <LabelContainer>
          <LabelIcon type="instance" />
          <LabelPart bold>{instance.display}</LabelPart>
        </LabelContainer>
      }
    >
      {config.plugins && instance.plugins.map((id) => <Plugin key={id} id={id} />)}
      {config.components && instance.components.map((id) => <Component key={id} id={id} />)}
    </TreeItem>
  );
};

const Plugin: FunctionComponent<{ id: string }> = ({ id }) => {
  const nodeId = useNode('plugin', id);
  const { plugin: config, root } = useContext(ConfigContext);
  const plugin = useSelector((state: AppState) => getPlugin(state, id));

  return (
    <TreeItem
      nodeId={nodeId}
      label={
        <LabelContainer>
          <LabelIcon type="plugin" />
          {root !== 'instances' && <LabelPart>{`${plugin.instance} - `}</LabelPart>}
          <LabelPart bold>{plugin.display}</LabelPart>
        </LabelContainer>
      }
    >
      {config.components && plugin.components.map((id) => <Component key={id} id={id} />)}
    </TreeItem>
  );
};

const Component: FunctionComponent<{ id: string }> = ({ id }) => {
  const nodeId = useNode('component', id);
  const { component: config } = useContext(ConfigContext);
  const component = useSelector((state: AppState) => getComponent(state, id));

  return (
    <TreeItem
      nodeId={nodeId}
      label={
        <LabelContainer>
          <LabelIcon type="component" />
          <LabelPart bold>{component.display}</LabelPart>
        </LabelContainer>
      }
    >
      {config.plugin && <Plugin id={component.plugin} />}
      {config.states && component.states.map((id) => <State key={id} id={id} />)}
    </TreeItem>
  );
};

const State: FunctionComponent<{ id: string }> = ({ id }) => {
  const nodeId = useNode('state', id);
  const state = useSelector((state: AppState) => getState(state, id));
  const flashing = useFlashOnUpdate(state.value);

  return (
    <TreeItem
      nodeId={nodeId}
      label={
        <LabelContainer>
          <LabelIcon type="state" />
          <LabelPart bold>{state.name}</LabelPart>
          <LabelPart>{' = '}</LabelPart>
          <LabelPart flashing={flashing}>{JSON.stringify(state.value)}</LabelPart>
        </LabelContainer>
      }
    />
  );
};

function useNode(type: NodeType, id: string) {
  const repository = useContext(NodeRepositoryContext);
  const nodeId = makeNodeId(type, id);

  useEffect(() => {
    repository.set(nodeId, { type, id });
    return () => {
      repository.delete(nodeId);
    };
  }, [type, id]);

  return nodeId;
}

function useFlashOnUpdate(value: any) {
  const [current, setCurrent] = useState(value);
  const { flashing, trigger } = useFlashOnTrigger();

  useEffect(() => {
    if (Object.is(current, value)) {
      return;
    }

    setCurrent(value);

    // value has changed
    trigger();
    
  }, [value]);

  return flashing;
}

function useFlashOnTrigger() {
  const [flashing, setFlashing] = useState(false);
  const timerRef = useRef<NodeJS.Timeout>();

  useEffect(() => () => {
    clearTimeout(timerRef.current);
  }, []);

  const trigger = () => {
    setFlashing(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setFlashing(false), 500);
  };

  return { trigger, flashing };
}