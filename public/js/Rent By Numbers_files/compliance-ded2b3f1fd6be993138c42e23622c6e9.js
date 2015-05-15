angular.module("rbn").controller('compliance', [
  '$scope', '$rootScope', '$http', '$routeParams', function($scope, $rootScope, $http, $routeParams) {
    var checkItemStatus, form_map, routeName;
    routeName = $routeParams.property;
    $scope.$watch('properties', function() {
      return $scope.property = _.findWhere($scope.properties, {
        routeName: routeName
      });
    });
    $scope.$watch('property', function(old, actual) {
      if (!actual) {
        return;
      }
      $scope.property.wizard.active = 'compliance';
      $scope.wizard = $scope.property.wizard;
      console.log($scope.property);
      $scope.property.utilities.forEach(function(util) {
        util.view = 'default';
        util.records = _.where($scope.property.documents, {
          referrer: util.type
        });
        return util.not_supplied = !util.supplied;
      });
      $scope.gas = _.findWhere($scope.property.utilities, {
        type: 'gas'
      });
      console.log('Gas Found', $scope.gas);
      $scope.electricity = _.findWhere($scope.property.utilities, {
        type: 'electrical'
      });
      $scope.energy = _.findWhere($scope.property.utilities, {
        type: 'energy'
      });
      return $scope.license = _.findWhere($scope.property.utilities, {
        type: 'license'
      });
    });
    $scope.property = _.findWhere($scope.properties, {
      routeName: routeName
    });
    $scope.files = [];
    form_map = [
      {
        type: 'date',
        name: 'Expire Date',
        key: 'expire_at'
      }, {
        type: 'currency',
        name: 'Expense'
      }
    ];
    $scope.getItemIcon = function(item) {
      var icon_type, img_dir, url;
      img_dir = 'img/compliance/';
      console.log('Getting Item Icon', item);
      icon_type = (function() {
        switch (false) {
          case !!item.supplied:
            return '-not';
          case item.status !== 'expired':
            return '-expired';
          default:
            return '';
        }
      })();
      return url = img_dir + item.type + icon_type + '.png';
    };
    $scope.formatDate = function(date) {
      return moment(date).format('MMM DD, YYYY');
    };
    $scope.formatCurrency = function(amount) {
      return '£' + amount + '.00';
    };
    $scope.changeExpireDate = function(item, date) {
      console.log('setting date', date);
      return item.expire_at = date;
    };
    $scope.editItem = function(item) {
      item.view = 'edit';
      return item.backup = _.pick(item, 'expire_at', 'supplied', 'records', 'expenses', 'not_supplied');
    };
    $scope.saveItem = function(item) {
      checkItemStatus(item);
      delete item.backup;
      return item.view = 'default';
    };
    $scope.resetItem = function(item) {
      var key, value, _i, _len, _ref;
      item = _.extend(item, item.backup);
      _ref = item.backup;
      for (value = _i = 0, _len = _ref.length; _i < _len; value = ++_i) {
        key = _ref[value];
        item[key] = value;
      }
      delete item.backup;
      return item.view = 'default';
    };
    $scope.uploadGasSafetyCert = function() {
      $scope.files = [];
      $scope.upload = {
        title: "Gas Certificate",
        code: "CP12",
        type: "Gas Safety Cert"
      };
      $scope.gas.view = 'upload';
      return $scope.gas_upload_reset = true;
    };
    $scope.updateGasSafetyCert = function() {
      $scope.gas.view = "edit";
      $scope.gas.records = $scope.gas.records.concat($scope.files);
      return $scope.files = [];
    };
    $scope.getDocumentType = function(record) {
      var doc_tag;
      doc_tag = _.findWhere(record.tags, {
        type: 'document'
      });
      return doc_tag && doc_tag.text || record.type;
    };
    return checkItemStatus = function(item) {
      var exp_range, status;
      exp_range = moment().add(30, 'd');
      status = 'active';
      if (moment(item.expire_at).isBefore(exp_range)) {
        status = 'expiring';
      }
      return item.status = status;
    };
  }
]);