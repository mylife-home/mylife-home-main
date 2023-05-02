import { registerPluginVersion } from 'mylife-home-core';

import './step-relay';

// converters
import './binary-to-percent';
import './percent-to-binary';
import './switch-to-button';
import './binary-to-pulse';
import './percent-to-byte';
import './byte-to-percent';
import './float-to-nullable-percent';

// constants
import './constant-bool';
import './constant-percent';
import './constant-byte';

// value
import './value-binary';
import './value-nullable-percent';
import './value-percent';
import './value-float';

// bool
import './bool-and';
import './bool-or';
import './bool-not';

// float
import './float-average';

declare var __WEBPACK_PLUGIN_VERSION__: string;
registerPluginVersion(__WEBPACK_PLUGIN_VERSION__);