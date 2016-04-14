import injection from 'github-injection';
import BlobReader from '../packages/blob-reader';
import clickHandler from './click-handler';
import getPluginsForBlob from './plugin-manager.js';
import debugMode from './debug-mode.js';

function initialize(self) {
  debugMode(true);
  clickHandler();

  self._blobReader = new BlobReader();
}

function run(self) {
  if (!self._blobReader.hasBlobs()) {
    return false;
  }

  console.time('total');

  self._blobReader.read();

  self._blobReader.forEach((blob) => {
    const plugins = getPluginsForBlob(blob.path);

    if (!plugins.length) {
      console.log('No plugins found for ', blob.path);
      return;
    }

    console.log('Plugins found for ', blob.path, plugins);

    plugins.forEach((plugin) => {
      plugin.parseBlob(blob);
    });
  });

  console.timeEnd('total');
}

export default class OctoLinkerCore {
  constructor() {
    initialize(this);
  }

  init() {
    injection(window, run.bind(null, this));
  }
}
