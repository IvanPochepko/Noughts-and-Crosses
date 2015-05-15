angular.module("rbn").controller('newProperty', [
  '$scope', '$rootScope', '$http', '$location', function($scope, $rootScope, $http, $location) {
    var currencyFilter;
    $scope.wizard = {
      active: 'basic'
    };
    $scope.new_property_page = true;
    $scope.property = {
      letByRoom: false,
      isRentWeekly: false,
      furnishing: 'unfurnished',
      rooms: [],
      beneficialInterest: 100
    };
    $scope.invalid = {};
    $scope.createProperty = function() {
      if (!$scope.validate()) {
        return;
      }
      $scope.wizard.basic = 'complete';
      $scope.property.wizard = $scope.wizard;
      return $http.post('/property/create', $scope.property).success(function(data) {
        var url;
        $rootScope.properties = $scope.properties.concat(data.property);
        url = '/property/' + data.property.routeName + '/overview';
        return $location.url(url);
      });
    };
    $scope.validate = function(which, force) {
      var isValid, key, keys, prop, value, _i, _len;
      prop = $scope.property;
      if (which) {
        keys = [which];
      } else {
        keys = ['address1', 'name', 'city', 'county', 'postal'];
        if (!prop.letByRoom) {
          keys.push('rent');
        } else {
          keys.push('rooms');
        }
      }
      isValid = true;
      for (_i = 0, _len = keys.length; _i < _len; _i++) {
        key = keys[_i];
        value = prop[key];
        if (_.isArray(value)) {
          value = value.length;
        }
        if (force) {
          value = force;
        }
        $scope.invalid[key] = !value;
        isValid = isValid && !!value;
      }
      return isValid;
    };
    $scope.changeAddress1 = function() {
      $scope.validate('address1');
      if (!$scope.editable_name) {
        return $scope.property.name = $scope.property.address1;
      }
    };
    $scope.changeWholeRent = function() {
      var value;
      value = $scope.property.rent;
      if (!value) {
        return;
      }
      $scope.property.rent = currencyFilter(value);
      return $scope.validate('rent');
    };
    $scope.addRoom = function() {
      var rent;
      if (!$scope.new_room) {
        return;
      }
      rent = $scope.new_room.rent.replace('£ ', '');
      $scope.new_room.rent = Number(rent);
      $scope.new_room.isRentWeekly = !!$scope.new_room.isRentWeekly;
      if (!$scope.edit_room) {
        $scope.property.rooms.push(_.clone($scope.new_room));
      }
      if ($scope.new_room.editable) {
        $scope.new_room.editable = false;
      }
      $scope.edit_room = false;
      $scope.new_room = {};
      return $scope.validate('rooms');
    };
    $scope.editRoom = function(room) {
      $scope.edit_room = true;
      room.editable = true;
      $scope.new_room = room;
      return $scope.new_room.rent = '£ ' + room.rent;
    };
    $scope.removeRoom = function(room) {
      if ($scope.new_room === room) {
        $scope.edit_room = false;
      }
      return $scope.property.rooms = _.without($scope.property.rooms, room);
    };
    $scope.changeRoomRent = function() {
      var num_val, value;
      value = $scope.new_room.rent;
      if (!value) {
        return;
      }
      num_val = currencyFilter(value);
      return $scope.new_room.rent = num_val && '£ ' + num_val;
    };
    $scope.changePercentage = function() {
      var value;
      value = $scope.property.beneficialInterest;
      value = value.replace(/\D/g, '');
      value = value || 1;
      value = Number(value);
      value = Math.min(value, 100);
      value = Math.max(value, 1);
      $scope.property.beneficialInterest = value;
      return console.log(value);
    };
    return currencyFilter = function(value) {
      var afterDot, arr, isDotted;
      arr = value.split('');
      isDotted = false;
      afterDot = 2;
      arr = arr.filter(function(char) {
        var res;
        res = /(\.|\d)/.test(char);
        if (isDotted && char === '.') {
          res = false;
        }
        if (!afterDot) {
          res = false;
        }
        if (res && isDotted) {
          afterDot--;
        }
        isDotted = isDotted || char === '.';
        return res;
      });
      return value = arr.join('');
    };
  }
]);