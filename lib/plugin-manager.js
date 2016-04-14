import { extname, basename } from 'path';
import LinkResolver from './plugins/link-resolver';
import ManifestNPM from './plugins/manifest-npm';
import ManifestGemfile from './plugins/manifest-gemfile';
import { filePathByLanguage } from '../packages/helper-file-type';
import { flattenAndCompact } from './utils/array';

const plugins = [
  LinkResolver,
  ManifestNPM,
  ManifestGemfile,
];

function getTypes(config) {
  return flattenAndCompact(config.map((type) => {
    if (type.startsWith('preset:')) {
      const presetName = type.split(':')[1];
      return filePathByLanguage(presetName);
    }

    return type;
  }));
}

const pluginCache = (function () {
  const list = new Map();

  plugins.forEach((PluginClass) => {
    const pluginInstance = new PluginClass();

    const types = getTypes(
      pluginInstance.listenTo()
    );

    types.forEach((type) => {
      const caller = list.get(type) || [];
      const pluginHasAlreadyBeenAdded = caller.indexOf(pluginInstance) > -1;
      const callerHasAlreadyBeenAdded = list.has(type);

      if (pluginHasAlreadyBeenAdded) {
        return;
      }

      caller.push(pluginInstance);

      if (callerHasAlreadyBeenAdded) {
        return;
      }

      list.set(type, caller);
    });
  });

  return list;
}());

console.log('PluginCache:', pluginCache);

function getPluginsForExt(filepath) {
  return pluginCache.get(extname(filepath));
}

function getPluginsForFilename(filepath) {
  return pluginCache.get(basename(filepath));
}

export default function (filepath) {
  return flattenAndCompact([
    getPluginsForExt(filepath),
    getPluginsForFilename(filepath),
  ]);
}
