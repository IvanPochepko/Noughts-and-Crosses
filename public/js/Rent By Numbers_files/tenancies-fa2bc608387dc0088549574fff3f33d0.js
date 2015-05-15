angular.module("rbn").controller('tenancies', [
  '$scope', '$rootScope', '$http', '$routeParams', '$modal', '$location', function($scope, $rootScope, $http, $routeParams, $modal, $location) {
    var TenancyModalController, formatTenancyDate, getArrears, getManageLink, getRent, getTenancyItemStatus, getTenancyStatusImage, initializeTenancy, routeName;
    routeName = $routeParams.property;
    $scope.$watch('properties', function() {
      return $scope.property = _.findWhere($scope.properties, {
        routeName: routeName
      });
    });
    $scope.$watch('property', function() {
      return initializeTenancy();
    });
    $scope.tenancy = {};
    $scope.addTenancy = function() {
      var data;
      data = _.clone($scope.tenancy);
      data.property = $scope.property._id;
      $http.post('/tenancy/new-tenancy', data).success(function(body) {
        $scope.property.tenancies = $scope.property.tenancies.concat(body);
        return initializeTenancy();
      });
      return $scope.tenancy = {};
    };
    $scope.back = function(tenancy) {
      if (tenancy.scroll !== 0) {
        return tenancy.scroll--;
      }
    };
    $scope.next = function(tenancy) {
      if (tenancy.scroll < tenancy.tenants.length - 4) {
        return tenancy.scroll++;
      }
    };
    getTenancyItemStatus = function(tenancy) {
      var exp_range, order, status;
      if (!tenancy) {
        return;
      }
      exp_range = moment().add(60, 'd');
      if (tenancy.pending) {
        status = 'PENDING';
        order = 3;
      } else if (moment(exp_range).isBefore(tenancy.endDate)) {
        status = 'ACTIVE';
        order = 2;
      } else if (moment().isAfter(tenancy.endDate)) {
        status = 'ENDED';
        order = 0;
      } else {
        status = 'ENDING';
        order = 1;
      }
      tenancy.status = status;
      return tenancy.order = order;
    };
    getTenancyStatusImage = function(tenancy) {
      var image;
      if (!tenancy) {
        return;
      }
      if (tenancy.status === 'ACTIVE') {
        image = 'active';
      }
      if (tenancy.status === 'PENDING') {
        image = 'pending';
      }
      if (tenancy.status === 'ENDED') {
        image = 'ended';
      }
      if (tenancy.status === 'ENDING') {
        image = 'ending';
      }
      return tenancy.image = '../img/' + image + '.png';
    };
    formatTenancyDate = function(tenancy) {
      if (!(tenancy.startDate && tenancy.endDate)) {
        return;
      }
      tenancy.endDate = moment(tenancy.endDate).format('DD MMM YYYY');
      return tenancy.startDate = moment(tenancy.startDate).format('DD MMM YYYY');
    };
    getArrears = function(tenancy) {
      if (!(tenancy && tenancy.arrears)) {
        return;
      }
      tenancy.arrears.toString();
      if (tenancy.arrears === '0') {
        tenancy.arrears = 'NONE';
      }
      if (tenancy.arrears[0] !== '£') {
        return tenancy.arrears = '£' + tenancy.arrears;
      }
    };
    getRent = function(tenancy) {
      if (!(tenancy && tenancy.arrears)) {
        return;
      }
      tenancy.rent.toString();
      if (tenancy.rent[0] !== '£') {
        return tenancy.rent = '£' + tenancy.rent + ' per month';
      }
    };
    initializeTenancy = function() {
      if (!$scope.property) {
        return;
      }
      return _.each($scope.property.tenancies, function(item) {
        if (!item.scroll) {
          item.scroll = 0;
        }
        getTenancyItemStatus(item);
        getTenancyStatusImage(item);
        formatTenancyDate(item);
        getArrears(item);
        getManageLink(item);
        return getRent(item);
      });
    };
    getManageLink = function(tenancy) {
      if (!tenancy) {
        return;
      }
      if (tenancy.status === 'PENDING') {
        return tenancy.link = "/property/" + $scope.property.routeName + "/create-tenancy/" + tenancy._id;
      } else {
        return tenancy.link = "/property/" + $scope.property.routeName + "/tenancy/" + tenancy._id;
      }
    };
    $scope.openTenancyModal = function() {
      var modalInstance;
      console.log('Open Tenancy Modal');
      modalInstance = $modal.open({
        templateUrl: '/modals/new-tenancy',
        controller: TenancyModalController,
        resolve: {
          property: function() {
            return $scope.property;
          }
        }
      });
      return modalInstance.result.then(function(data) {
        return $http.post('/tenancy/create-tenancy', data).success(function(tenancy) {
          var url;
          $scope.property.tenancies = $scope.property.tenancies.concat(tenancy);
          initializeTenancy();
          url = "/property/" + data.property.routeName + "/create-tenancy/" + tenancy._id;

          /*if (data.room)
              url+= '?room=' + data.room.name
           */
          return $location.url(url);
        });
      });
    };
    return TenancyModalController = [
      '$scope', '$modalInstance', 'property', function($scope, $modalInstance, property) {
        $scope.property = property;
        $scope.selectProperty = function(prop) {
          if (prop._id === $scope.property._id) {
            return;
          }
          $scope.property = prop;
          return $scope.room = null;
        };
        $scope.selectRoom = function(room) {
          return $scope.room = room;
        };
        $scope.yes = function() {
          return $modalInstance.close({
            property: $scope.property,
            room: $scope.room,
            started: true
          });
        };
        return $scope.no = function() {
          return $modalInstance.close({
            property: $scope.property,
            room: $scope.room,
            started: false
          });
        };
      }
    ];
  }
]);