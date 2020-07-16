import { createSelector } from 'reselect';
import { AppState } from '../types';
import { getComponentState } from './registry';
import { Window, Control, ControlDisplayMapItem, ControlText, ControlDisplay, Resource } from '../types/model';
import { getWindowControl, getWindow } from './model';

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
    [
      (state: AppState) => getWindow(state, windowId),
      (state: AppState) => getWindowControl(state, windowId, controlId)
    ], (window, control): StaticModel => {

      const template: UIControl = {
        id: control.id,
        width: control.width,
        height: control.height,
        left: window.width * control.x - control.width / 2,
        top: window.height * control.y - control.height / 2,
        displayResource: null,
        text: null,
        active: !!control.primaryAction,
      };

      const { display, text } = control;
      const requiredComponentStates: RequiredComponentState[] = [];
      let displayResourceResolver: (componentStates: ProvidedComponentStates) => Resource = () => null;
      let textResolver: (componentStates: ProvidedComponentStates) => Resource = () => null;

      if (display) {
        requiredComponentStates.push({ componentId: display.componentId, componentState: display.componentState });

        displayResourceResolver = (componentStates) => {

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
      };

      if (text) {
        for (const item of text.context) {
          requiredComponentStates.push({ componentId: item.componentId, componentState: item.componentState });
        }

        const argNames = text.context.map((item) => item.id).join(',');
        let func: (args: string[]) => string;
        try {
          func = new Function(argNames, text.format) as (args: string[]) => string;
        } catch (err) {
          console.error(err); // eslint-disable-line no-console
          func = () => err.message;
        }

        textResolver = (componentStates) => {
          const args = text.context.map((item) => findComponentState(componentStates, item.componentId, item.componentState));

          try {
            return func(args);
          } catch (err) {
            console.error(err); // eslint-disable-line no-console
            return err.message as string;
          }
        };
      }

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

function findComponentState(componentStates: ProvidedComponentStates, componentId: string, componentState: string) {
  return componentStates[`${componentId}$${componentState}`];
}


export const getUIControl = (state: AppState, windowId: string, controlId: string): UIControl => {
  const window = getWindow(state, windowId);
  const control = getWindowControl(state, windowId, controlId);
  return prepareControl(state, window, control);
};

function prepareControl(state: AppState, window: Window, control: Control): UIControl {
  const { id, width, height, display, text, primaryAction } = control;

  return {
    id,
    width,
    height,
    left: window.width * control.x - width / 2,
    top: window.height * control.y - height / 2,
    displayResource: prepareDisplay(state, display),
    text: prepareText(state, text),
    active: !!primaryAction,
  };
}

function prepareDisplay(state: AppState, display: ControlDisplay) {
  if (!display) {
    return null;
  }

  const { defaultResource } = display;

  const value = getComponentState(state, display.componentId, display.componentState);
  if (value === undefined) {
    return defaultResource;
  }
  const item = findDisplayItem(display.map, value);
  if (!item) {
    return defaultResource;
  }

  return item.resource;
}

function findDisplayItem(map: ControlDisplayMapItem[], value: any) {
  if (typeof value === 'number') {
    return map.find((item) => item.min <= value && value <= item.max) || null;
  }

  return map.find((item) => item.value === value) || null;
}

function prepareText(state: AppState, text: ControlText) {
  if (!text) {
    return null;
  }

  const args = text.context.map((item) => getComponentState(state, item.componentId, item.componentState));

  // TODO: cache function
  const argNames = text.context.map((item) => item.id).join(',');
  let func: (args: string[]) => string;
  try {
    func = new Function(argNames, text.format) as (args: string[]) => string;
  } catch (err) {
    console.error(err); // eslint-disable-line no-console
    func = () => err.message;
  }
  // ---

  try {
    return func(args);
  } catch (err) {
    console.error(err); // eslint-disable-line no-console
    return err.message as string;
  }
}
