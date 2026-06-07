(function () {
  'use strict';

  var VERSION = 'pr164-strict-watchdog-lifecycle-fix/v1';
  var SHORT_TIMEOUT_MS = 12000;
  var MEDIUM_TIMEOUT_MS = 18000;
  var LONG_TIMEOUT_MS = 29000;

  function rawUrl(input) {
    return typeof input === 'string' ? input : input && input.url ? input.url : '';
  }

  function rewriteUrl(input) {
    var raw = rawUrl(input);
    if (!raw || !/\/api