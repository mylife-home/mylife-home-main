import { createSelector } from 'reselect';
import { AppState } from '../types';
import { getComponentState } from './registry';
import { ControlDisplayMapItem, ControlText, ControlDisplay, Resource } from '../types/model';
import { getWindowControl } from './model';

export interface UIControl {
  readonly id: string;
  readonly height: number;
  readonly width: number;
  readonly left: number;
  readonly top: number;
  readonly displayResource: string;
  readonly text: string;
  readonly active: boolean;
}

interface RequiredComponentState {
  readonly componentId: string;
  readonly componentState: string;
}

type ProvidedComponentStates = { [key: string]: any; };

interface StaticModel {
  readonly template: UIControl;
  readonly requiredComponentStates: RequiredComponentState[];
  readonly displayResourceResolver: (componentStates: ProvidedComponentStates) => Resource;
  readonly textResolver: (componentStates: ProvidedComponentStates) => string;
}

export const makeGetUIControl = (windowId: string, controlId: string): (state: AppState) => UIControl => {
  const getStaticModel = createSelector(
    [(state: AppState) => getWindowControl(state, windowId, controlId)], (control): StaticModel => {

      const template: UIControl = {
        id: control.id,
        width: control.width,
        height: control.height,
        left: control.x,
        top: control.y,
        displayResource: null,
        text: null,
        active: !!control.primaryAction,
      };

      const { display, text } = control;
      const requiredComponentStates: RequiredComponentState[] = [];

      if (display) {
        requiredComponentStates.push({ componentId: display.componentId, componentState: display.componentState });
      }

      if (text) {
        for (const item of text.context) {
          requiredComponentStates.push({ componentId: item.componentId, componentState: item.componentState });
        }
      }

      const displayResourceResolver = createResourceDisplayResolver(display);
      const textResolver = createTextResolver(text);

      return { template, requiredComponentStates, displayResourceResolver, textResolver };
    }
  );

  return state => {
    const { template, requiredComponentStates, displayResourceResolver, textResolver } = getStaticModel(state);
    const componentStates = getRequiredComponentStates(state, requiredComponentStates);

    return {
      ...template,
      displayResource: displayResourceResolver(componentStates),
      text: textResolver(componentStates)
    };
  };
};

function getRequiredComponentStates(state: AppState, requiredComponentStates: RequiredComponentState[]) {
  const componentStates: ProvidedComponentStates = {};
  for (const { componentId, componentState } of requiredComponentStates) {
    componentStates[`${componentId}$${componentState}`] = getComponentState(state, componentId, componentState);
  }
  return componentStates;
}

function createResourceDisplayResolver(display: ControlDisplay): (componentStates: ProvidedComponentStates) => Resource {
  if (!display) {
    return () => null;
  }

  return (componentStates) => {

    const { defaultResource } = display;

    const value = findComponentState(componentStates, display.componentId, display.componentState);
    if (value === undefined) {
      return defaultResource;
    }

    const item = findDisplayItem(display.map, value);
    if (!item) {
      return defaultResource;
    }

    return item.resource;
  };
}

function createTextResolver(text: ControlText): (componentStates: ProvidedComponentStates) => string {
  if (!text) {
    return () => null;
  }

  const argNames = text.context.map((item) => item.id).join(',');
  let func: (...args: any[]) => string;
  try {
    func = new Function(argNames, text.format) as (...args: any[]) => string;
  } catch (err) {
    console.error(err); // eslint-disable-line no-console
    func = () => err.message;
  }

  return (componentStates) => {
    const args = text.context.map((item) => findComponentState(componentStates, item.componentId, item.componentState));

    try {
      return func(...args);
    } catch (err) {
      console.error(err); // eslint-disable-line no-console
      return err.message as string;
    }
  };
}

function findComponentState(componentStates: ProvidedComponentStates, componentId: string, componentState: string) {
  return componentStates[`${componentId}$${componentState}`];
}

function findDisplayItem(map: ControlDisplayMapItem[], value: any) {
  if (typeof value === 'number') {
    return map.find((item) => item.min <= value && value <= item.max) || null;
  }

  return map.find((item) => item.value === value) || null;
}
