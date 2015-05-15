'use strict';
angular.module("rbn.services", []).factory('User', [
  '$http', '$rootScope', function($http, $rootScope) {
    var User;
    User = {
      loadProperties: function(cb) {
        return $http.get('/property/my').success(function(data) {
          data.forEach(function(item) {
            return item.order = 0;
          });
          $rootScope.properties = data;
          return cb && cb(data);
        });
      },
      logout: function(cb) {
        return $http.get('/logout').success(function(data) {
          return cb && cb(data);
        });
      }
    };
    return User;
  }
]);