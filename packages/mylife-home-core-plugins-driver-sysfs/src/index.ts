import { registerPluginVersion } from 'mylife-home-core';

import './ac-button';
import './ac-dimmer';
import './gpio-in';
import './gpio-out';
import './pwm-rgb';
import './pwm';

declare var __WEBPACK_PLUGIN_VERSION__: string;
registerPluginVersion(__WEBPACK_PLUGIN_VERSION__);