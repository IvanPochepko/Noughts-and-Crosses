'use strict';
angular.module("rbn", ['rbn.filters', 'rbn.services', 'rbn.directives', "ngRoute", "angularFileUpload", 'ui.bootstrap']).config([
  "$routeProvider", "$locationProvider", "$httpProvider", function($routeProvider, $locationProvider, $httpProvider) {
    $routeProvider.when('/', {
      templateUrl: '/partials/index',
      controller: 'index'
    }).when('/new-property', {
      templateUrl: '/partials/new_property',
      controller: 'newProperty'
    }).when('/property/:property/wizard/compliance', {
      templateUrl: '/partials/compliance',
      controller: 'compliance'
    }).when('/property/:property/overview', {
      templateUrl: '/partials/overview',
      controller: 'overview'
    }).when('/property/:property/tenancy', {
      templateUrl: '/partials/tenancies',
      controller: 'tenancies'
    }).when('/property/:property/tenancy/:tenancy', {
      templateUrl: '/partials/tenancy-overview',
      controller: 'tenancyOverview'
    }).when('/property/:property/create-tenancy/:tenancy', {
      templateUrl: '/partials/create-tenancy',
      controller: 'createTenancy'
    }).when('/property/:property/tenancy-terms/:tenancy', {
      templateUrl: '/partials/tenancy-terms',
      controller: 'tenancy-terms'
    }).otherwise({
      redirectTo: '/new-property'
    });
    return $locationProvider.html5Mode(true);
  }
]).run([
  "$rootScope", 'User', '$location', function($rootScope, User, $location) {
    User.loadProperties(function(data) {
      return console.log('properties loaded ', data);
    });
    $rootScope.logout = function() {
      return User.logout(function() {
        return location.reload();
      });
    };
    $rootScope.PropNavCount = 3;
    $rootScope.no_propagation = function($event) {
      return $event.stopPropagation();
    };
    $rootScope.selectProperty = function(item) {
      var prop, _i, _len, _ref, _results;
      _ref = $rootScope.properties;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        prop = _ref[_i];
        if (prop._id !== item._id) {
          _results.push(prop.order = 0);
        }
      }
      return _results;
    };
    return $rootScope.selectCollapsedProperty = function(item) {
      var prop, _i, _len, _ref;
      _ref = $rootScope.properties;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        prop = _ref[_i];
        if (prop._id !== item._id) {
          prop.order = 0;
        }
      }
      item.order = 10;
      return $location.path('/property/' + item.routeName + '/overview');
    };
  }
]);