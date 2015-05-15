'use strict';
angular.module("rbn.filters", []).filter('skip', function() {
  return function(input, skip) {
    if (!input) {
      return;
    }
    return _.rest(input, skip);
  };
});