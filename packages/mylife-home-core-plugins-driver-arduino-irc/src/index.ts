import { registerPluginVersion } from 'mylife-home-core';

import './agent';
import './rgb';

declare var __WEBPACK_PLUGIN_VERSION__: string;
registerPluginVersion(__WEBPACK_PLUGIN_VERSION__);