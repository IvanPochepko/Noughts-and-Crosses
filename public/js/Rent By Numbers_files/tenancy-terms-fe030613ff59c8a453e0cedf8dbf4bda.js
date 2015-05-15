angular.module('rbn').controller('tenancy-terms', [
  '$scope', '$rootScope', '$http', '$routeParams', function($scope, $rootScope, $http, $routeParams) {
    var daysOfWeek, numbersOfMonth, routeName, tenancyId;
    routeName = $routeParams.property;
    tenancyId = $routeParams.tenancy;
    numbersOfMonth = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th", "11th", "12th", "13th", "14th", "15th", "16th", "17th", "18th", "19th", "20th", "21st", "22nd", "23rd", "24th", "25th", "26th", "27th", "28th", "29th", "30th", "31st"];
    daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    $scope.everyOptions = ["Month", "Week", "Fortnight"];
    $scope.tenancyTerms = ['Month', 'Week', 'Year'];
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
      console.log($scope.tenancy);
      $scope.tenancy.billsView = true;
      $scope.tenancy.startDate = moment($scope.tenancy.startDate).format('DD/MM/YYYY');
      $scope.tenancy.bills = [
        {
          name: 'Gas',
          included: false
        }, {
          name: 'Electricity',
          included: false
        }, {
          name: 'Water',
          included: false
        }, {
          name: 'Council Tax',
          included: false
        }, {
          name: 'Broadband',
          included: false
        }
      ];
      if ($scope.tenancy.payment.length === 0) {
        return;
      }
      if ($scope.tenancy.payment[0].payments[0].every === 'Week' || $scope.tenancy.payment[0].payments[0].every === 'Fortnight') {
        $scope.onOptions = daysOfWeek;
      }
      if ($scope.tenancy.payment[0].payments[0].every === 'Month') {
        return $scope.onOptions = numbersOfMonth;
      }
    });
    $scope.getOnOptions = function(every, extEvery) {
      if (every === 'Week' || every === 'Fortnight') {
        $scope.onOptions = daysOfWeek;
      }
      if (every === 'Month') {
        return $scope.onOptions = numbersOfMonth;
      }
    };
    $scope.editTenancyField = function(field, value) {
      var data;
      data = {
        id: $scope.tenancy._id,
        field: field,
        value: value
      };
      return $http.post('/tenancy/edit-tenancy-field', data).success(function(data) {
        console.log(data);
        if (field === 'startDate') {
          return $scope.tenancy[field] = moment(data).format('DD/MM/YYYY');
        } else {
          return $scope.tenancy[field] = data;
        }
      });
    };
    $scope.addPayment = function(amountDue, every, extEvery, full, part, source) {
      if (!(amountDue && every && extEvery && source)) {
        return;
      }
      return source.payments.push({
        amountDue: amountDue,
        every: every,
        extEvery: extEvery,
        full: full,
        part: part
      });
    };
    $scope.newSourceWho = ['Tenants', 'Housing Benefit', 'Other'];
    $scope.whoChanged = function() {
      return $scope.other = '';
    };
    $scope.addNewSource = function() {
      $scope.rentPaymentTitle = 'Add Payment Source';
      $scope.newPayment = {
        startPaymentDate: '',
        who: '',
        payments: []
      };
      $scope.newSource = true;
      return $scope.newPayment.startPaymentDate = $scope.tenancy.startDate;
    };
    $scope.doneNewSource = function(payment) {
      var data;
      console.log(payment);
      if (!(payment.who && payment.payments[0] && payment.startPaymentDate)) {
        return;
      }
      if (payment.who === 'Other') {
        if ($scope.other === '') {
          return;
        }
        payment.who = $scope.other;
      }
      data = {
        who: payment.who,
        startPaymentDate: payment.startPaymentDate,
        payments: payment.payments,
        id: $scope.tenancy._id
      };
      return $http.post('/tenancy/done-new-source', data).success(function(data) {
        $scope.newSource = false;
        return $scope.tenancy.payment = data;
      });
    };
    $scope.updateContract = function() {
      var data;
      data = {};
      data.length = $scope.tenancy.length;
      data.id = $scope.tenancy._id;
      return $http.post('/tenancy/update-contract', data).success(function(data) {
        return $scope.tenancy.length = data;
      });
    };
    $scope.updateRent = function() {
      var data;
      data = {};
      data.rent = $scope.tenancy.rent;
      data.id = $scope.tenancy._id;
      return $http.post('/tenancy/update-rent', data).success(function(data) {
        return $scope.tenancy.rent = data;
      });
    };
    $scope.addNewPayment = function(amountDue, every, extEvery, full, part, source) {
      var data;
      if (!(amountDue && every && extEvery && source)) {
        return;
      }
      source.payments.push({
        amountDue: amountDue,
        every: every,
        extEvery: extEvery,
        full: full,
        part: part
      });
      data = {
        payment: $scope.tenancy.payment,
        id: $scope.tenancy._id
      };
      return $http.post('/tenancy/add-payment', data).success(function(data) {
        return $scope.tenancy.payment = data;
      });
    };
    $scope.deleteNewPayment = function(obj, arr) {
      var index;
      index = _.indexOf(arr, obj);
      return arr.splice(index, 1);
    };
    $scope.updatePayment = function(obj, arr) {
      var data, index;
      index = _.indexOf(arr, obj);
      arr.splice(index, 1);
      data = {
        payment: $scope.tenancy.payment,
        id: $scope.tenancy._id
      };
      return $http.post('/tenancy/update-payment', data).success(function(data) {
        return $scope.tenancy.payment = data;
      });
    };
    return $scope.updateDeposit = function() {
      var data;
      data = {
        deposit: $scope.tenancy.deposit,
        id: $scope.tenancy._id
      };
      return $http.post('/tenancy/update-deposit', data).success(function(data) {
        return $scope.tenancy.deposit = data;
      });
    };
  }
]);