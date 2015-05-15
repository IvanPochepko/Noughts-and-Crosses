angular.module("rbn").controller('tenancyOverview', [
  '$scope', '$rootScope', '$http', '$routeParams', function($scope, $rootScope, $http, $routeParams) {
    var formatTenancyDate, getBreadcrumb, getTenancyItemStatus, initializeTenancy, routeName, tenancyId;
    routeName = $routeParams.property;
    tenancyId = $routeParams.tenancy;
    $scope.$watch('properties', function() {
      if (!$scope.properties) {
        return;
      }
      $scope.property = _.findWhere($scope.properties, {
        routeName: routeName
      });
      $scope.tenancy = _.findWhere($scope.property.tenancies, {
        _id: tenancyId
      });
      initializeTenancy($scope.tenancy);
      return getBreadcrumb($scope.tenancy.tenants);
    });
    $scope.tenantName = '';
    $scope.$watch('tenantName', function() {
      if ($scope.tenantName === '') {
        $scope.tenantInfo = true;
      }
      if (!$scope.tenantName.name) {
        return;
      }
      $scope.tenantInfo = true;
      return addExistingTenant();
    });
    $scope.add = function() {
      return $scope.tenantInfo = false;
    };
    $http.get('/tenancy/get-free-tenants').success(function(data) {
      return $scope.freeTenants = data;
    });
    formatTenancyDate = function(tenancy) {
      if (!(tenancy.startDate && tenancy.endDate)) {
        return;
      }
      tenancy.endDate = moment(tenancy.endDate).format('DD MMM YYYY');
      return tenancy.startDate = moment(tenancy.startDate).format('DD MMM YYYY');
    };
    getTenancyItemStatus = function(tenancy) {
      var exp_range, status;
      if (!tenancy) {
        return;
      }
      exp_range = moment().add(60, 'd');
      if (moment(exp_range).isBefore(tenancy.endDate)) {
        status = 'ACTIVE';
      } else if (moment().isAfter(tenancy.endDate)) {
        status = 'ENDED';
      } else {
        status = 'ENDING';
      }
      return tenancy.status = status;
    };
    initializeTenancy = function(tenancy) {
      if (!tenancy) {
        return;
      }
      getTenancyItemStatus(tenancy);
      return formatTenancyDate(tenancy);
    };
    getBreadcrumb = function(tenants) {
      $scope.breadcrumb = [];
      if (!tenants) {
        return;
      }
      _.each(tenants, function(item) {
        return $scope.breadcrumb = $scope.breadcrumb.concat(item.contact.name);
      });
      return $scope.breadcrumb = $scope.breadcrumb.join(', ');
    };
    $scope.tenant = {};
    $scope.addTenant = function() {
      var data;
      data = _.clone($scope.tenant);
      data.property = $scope.property._id;
      data.type = 'tenant';
      data.tenancy = $scope.tenancy._id;
      data.startDate = $scope.tenancy.startDate;
      data.endDate = $scope.tenancy.endDate;
      $http.post('/tenancy/new-tenant', data).success(function(data) {
        return $scope.tenancy.tenants = $scope.tenancy.tenants.concat(data);
      });
      return $scope.tenant = {};
    };
    $scope.skipCount = 0;
    $scope.back = function() {
      if ($scope.skipCount !== 0) {
        return $scope.skipCount--;
      }
    };
    return $scope.next = function() {
      if ($scope.skipCount < $scope.tenancy.tenants.length - 4) {
        return $scope.skipCount++;
      }
    };
  }
]);