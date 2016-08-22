'use strict';

const PAD_LEN = 19; // number of digits in sys.maxint


function paddedInt(padLength, i) {
  var i_str = `${i}`;
  var pad = padLength - i_str.length;
  return `${'0'.repeat(pad)}${i_str}`;
}


function sanitizeVersion(version, defaultVersion) {
  if (defaultVersion) {
    version = version || 1;
    if (typeof version == typeof 123) {
      version = paddedInt(PAD_LEN, version);
    }

    version = `${version}`;
  }
  return version;
}


function fixArgs(args) {
  var version = args.version;
  var context = args.context;
  var done = args.done;

  var temp = undefined;

  if (!version && !context && !done) {
    return {version, context, done};
  }

  if (typeof version == typeof function(){}) {
    temp = version;
    version = done;
    done = temp;
  } else if (typeof context == typeof function(){}) {
    temp = context;
    context = done;
    done = temp;
  }

  if (typeof version == typeof {}) {
    temp = version;
    version = context;
    context = temp;
  }
  return {version, context, done};
}


function optArgs(args) {
  var fixed = fixArgs(args);

  var version = fixed.version;
  var context = fixed.context;
  var done = fixed.done;

  context = context || {};

  return {version, context, done};
}


module.exports = {
  sanitizeVersion,
  paddedInt,
  optArgs
};
