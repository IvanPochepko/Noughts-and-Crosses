angular.module('rbn').controller('createTenancy', [
  '$scope', '$rootScope', '$http', '$routeParams', function($scope, $rootScope, $http, $routeParams) {
    var addExistingTenant, getAssessStatus, getGuarStatus, routeName, tenancyId, zeroSet;
    routeName = $routeParams.property;
    tenancyId = $routeParams.tenancy;
    $scope.tenancyId = tenancyId;
    zeroSet = function() {
      return $scope.noob = {
        assessmentStatus: 'not required',
        guarantorStatus: 'not required',
        phone: '',
        email: ''
      };
    };
    zeroSet();
    $scope.tenantName = '';
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
      getAssessStatus($scope.tenancy);
      return getGuarStatus($scope.tenancy);
    });
    $http.get('/tenancy/get-free-tenants').success(function(data) {
      return $scope.freeTenants = data;
    });
    $scope.$watch('tenantName', function() {
      if ($scope.tenantName === '') {
        $scope.tenantInfo = true;
        $scope.tip = true;
      } else {
        $scope.tip = false;
      }
      if (!($scope.tenantName && $scope.tenantName.name)) {
        return;
      }
      $scope.tenantInfo = true;
      addExistingTenant();
      return $scope.tenantName = '';
    });
    addExistingTenant = function() {
      var data, index;
      index = $scope.freeTenants.indexOf($scope.tenantName);
      $scope.freeTenants.splice(index, 1);
      data = {
        tenancyId: tenancyId,
        contactId: $scope.tenantName._id
      };
      return $http.post('/tenancy/add-existing-tenant', data).success(function(data) {
        $scope.tenancy.tenants = $scope.tenancy.tenants.concat(data);
        getAssessStatus($scope.tenancy);
        return getGuarStatus($scope.tenancy);
      });
    };
    $scope.add = function() {
      $scope.tenantInfo = false;
      return $scope.tip = true;
    };
    $scope.save = function() {
      var tenant;
      tenant = {
        name: $scope.tenantName,
        phone: $scope.noob.phone,
        email: $scope.noob.email,
        assessmentStatus: $scope.noob.assessmentStatus,
        guarantorStatus: $scope.noob.guarantorStatus,
        tenancy: $scope.tenancy._id,
        startDate: null,
        endDate: null
      };
      return $http.post('/tenancy/new-tenant', tenant).success(function(data) {
        $scope.tenancy.tenants = $scope.tenancy.tenants.concat(data);
        $scope.tenantInfo = true;
        zeroSet();
        getAssessStatus($scope.tenancy);
        return getGuarStatus($scope.tenancy);
      });
    };
    $scope.cancel = function() {
      $scope.noob = '';
      $scope.tenantName = '';
      return zeroSet();
    };
    $scope.editAssess = function(tenant) {
      var data;
      data = {
        _id: tenant.contact._id,
        assessmentStatus: tenant.contact.assessmentStatus
      };
      return $http.post('/tenancy/edit-assess', data).success(function(data) {
        tenant.contact.assessmentStatus = data;
        return getAssessStatus($scope.tenancy);
      });
    };
    $scope.editGuarantor = function(tenant) {
      var data;
      data = {
        _id: tenant.contact._id,
        guarantorStatus: tenant.contact.guarantorStatus
      };
      return $http.post('/tenancy/edit-guarantor', data).success(function(data) {
        tenant.contact.guarantorStatus = data;
        return getGuarStatus($scope.tenancy);
      });
    };
    $scope.openAssessInfo = function(tenant) {
      $scope.assessTittle = tenant.contact.name;
      $scope.assessList = true;
      $scope.selectedAssess = tenant;
      return $http.get('/tenancy/assess-in-progress/' + tenant.contact._id).success(function(data) {
        tenant.contact.assessmentStatus = data;
        return getAssessStatus($scope.tenancy);
      });
    };
    $scope.closeAssessInfo = function() {
      $scope.assessTittle = 'Assess Tenants';
      $scope.assessList = false;
      return $scope.selectedAssess = '';
    };
    getAssessStatus = function(tenancy) {
      return _.each(tenancy.tenants, function(item) {
        if (item.contact.assessmentStatus === 'required') {
          item.assessmentStatus = false;
          item.assessmentButton = 'ASSESS TENANT';
          item.selectAssessStatus = 'Assessment Required';
          item.selectAssessHide = false;
        }
        if (item.contact.assessmentStatus === 'not required') {
          item.assessmentStatus = 'No Assessment Required';
          item.assessmentButton = 'CHANGE';
          item.selectAssessStatus = 'Assessment Required';
          item.selectAssessHide = false;
        }
        if (item.contact.assessmentStatus === 'in progress') {
          item.assessmentStatus = 'IN PROGRESS';
          item.assessmentButton = 'CONTINUE';
          item.selectAssessStatus = 'Assessment in Progress';
          item.selectAssessHide = true;
        }
        if (item.contact.assessmentStatus === 'completed') {
          item.assessmentStatus = false;
          item.assessmentButton = 'Tenant Assessed';
          item.selectAssessStatus = 'Assessment Completed';
          return item.selectAssessHide = true;
        }
      });
    };
    $scope.completeAssess = function(tenant) {
      return $http.get('/tenancy/complete-assess/' + tenant.contact._id).success(function(data) {
        tenant.contact.assessmentStatus = data;
        $scope.assessTittle = 'Assess Tenants';
        $scope.assessList = false;
        $scope.selectedAssess = '';
        return getAssessStatus($scope.tenancy);
      });
    };
    getGuarStatus = function(tenancy) {
      return _.each(tenancy.tenants, function(item) {
        if (item.contact.guarantorStatus === 'required') {
          item.guarantorStatus = false;
          item.guarButton = 'ADD GUARANTOR INFO';
          item.selectGuarStatus = 'Guarantor Required';
          item.selectGuarHide = false;
        }
        if (item.contact.guarantorStatus === 'not required') {
          item.guarantorStatus = 'Guarantor Not Required';
          item.guarButton = 'CHANGE';
          item.selectGuarStatus = 'Guarantor Required';
          item.selectGuarHide = false;
        }
        if (item.contact.guarantorStatus === 'in progress') {
          item.guarantorStatus = 'IN PROGRESS';
          item.guarButton = 'CONTINUE';
          item.selectGuarStatus = 'Guarantor in Progress';
          item.selectGuarHide = true;
        }
        if (item.contact.guarantorStatus === 'completed') {
          item.guarantorStatus = false;
          item.guarButton = 'Guarantor Details Added - ' + item.contact.guarantor[item.contact.guarantor.length - 1].name;
          item.selectGuarStatus = 'Guarantor on Record';
          return item.selectGuarHide = true;
        }
      });
    };
    $scope.closeGuarInfo = function() {
      $scope.guarList = false;
      $scope.guarTittle = 'Guarantor Details';
      return $scope.selectedGuar = '';
    };
    $scope.openGuarInfo = function(tenant) {
      $scope.guarList = true;
      $scope.guarTittle = 'Add a Guarantor for ' + tenant.contact.name;
      $scope.selectedGuar = tenant.contact.guarantor[tenant.contact.guarantor.length - 1];
      $scope.selectedGuar.tenant = tenant;
      $http.get('/tenancy/guarantor-in-progress/' + tenant.contact._id).success(function(data) {
        tenant.contact.guarantorStatus = data;
        return getGuarStatus($scope.tenancy);
      });
      if (!$scope.selectedGuar.address) {
        return;
      }
      return $scope.address = [$scope.selectedGuar.address];
    };
    $scope.saveGuarantor = function() {
      return $http.get('/tenancy/complete-guarantor/' + $scope.selectedGuar.tenant.contact._id).success(function(data) {
        $scope.selectedGuar.tenant.contact.guarantorStatus = data;
        $scope.guarList = false;
        $scope.guarTittle = 'Guarantor Details';
        $scope.selectedGuar = '';
        $scope.addressVisibility = true;
        $scope.addressLines = true;
        return getGuarStatus($scope.tenancy);
      });
    };
    $scope.editGuarantorInfo = function(field, value) {
      var data;
      data = {
        field: field,
        value: value,
        contact: $scope.selectedGuar._id
      };
      return $http.post('/tenancy/edit-guarantor-info', data).success(function(data) {
        return $scope.selectedGuar[field] = data[field];
      });
    };
    $scope.cancelGuar = function() {
      $scope.guarList = false;
      $scope.guarTittle = 'Guarantor Details';
      return $scope.selectedGuar = '';
    };
    $scope.completeGuarantorAssessment = function() {
      return $http.get('/tenancy/complete-guarantor/' + $scope.selectedGuar.tenant.contact._id).success(function(data) {
        $scope.selectedGuar.tenant.contact.guarantorStatus = data;
        $scope.guarList = false;
        $scope.guarTittle = 'Guarantor Details';
        $scope.selectedGuar = '';
        $scope.addressVisibility = true;
        $scope.addressLines = true;
        return getGuarStatus($scope.tenancy);
      });
    };
    $scope.addressVisibility = false;
    $scope.addressLines = false;
    $scope.$watch('selectedGuar', function() {
      if (!$scope.selectedGuar) {
        return;
      }
      if (!$scope.selectedGuar.address) {
        return;
      }
      $scope.addressLines = true;
      $scope.addressVisibility = false;
      $scope.guarantorSaveButton = false;
      if ($scope.selectedGuar.name && $scope.selectedGuar.phone && $scope.selectedGuar.email && $scope.selectedGuar.address && $scope.selectedGuar.postcode) {
        return $scope.guarantorSaveButton = true;
      }
    });
    $scope.findAddress = function(postcode) {
      var key;
      key = 'anFSHGhEFE6N8xwFZqS7yQ556';
      return $http.get('https://api.getaddress.io/uk/' + postcode + '?api-key=' + key).success(function(data) {
        $scope.addressVisibility = true;
        return $scope.address = data.Addresses;
      });
    };
    $scope.changeGuarantor = function() {
      return $http.get('/tenancy/new-guarantor/' + $scope.selectedGuar.tenant.contact._id).success(function(data) {
        var selectedTenant;
        $scope.selectedGuar.tenant.contact.guarantor = $scope.selectedGuar.tenant.contact.guarantor.concat(data);
        selectedTenant = $scope.selectedGuar.tenant;
        $scope.selectedGuar = data;
        $scope.selectedGuar.tenant = selectedTenant;
        $scope.addressVisibility = false;
        return $scope.guarantorSaveButton = false;
      });
    };
    $scope.saveAddress = function(selected) {
      var arr, data, i, index, reg, _i, _ref, _results;
      reg = new RegExp('[A-Z](?=[A-Z])[A-Z]+', 'g');
      arr = selected.address.split(', ');
      _results = [];
      for (i = _i = 0, _ref = arr.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
        if (arr[i].search(reg) !== -1) {
          index = i;
          data = {
            contact: selected._id,
            field: 'town',
            value: arr[i]
          };
          _results.push($http.post('/tenancy/edit-guarantor-info', data).success(function(data) {
            var _ref1;
            selected.town = data.town;
            [].splice.apply(arr, [index, index - index + 1].concat(_ref1 = [])), _ref1;
            data = {
              contact: selected._id,
              address1: arr[0],
              address2: arr[1],
              address3: arr[2]
            };
            return $http.post('/tenancy/save-address-guar', data).success(function(data) {
              selected.address1 = data.address1;
              selected.address2 = data.address2;
              selected.address3 = data.address3;
              return $scope.addressVisibility = false;
            });
          }));
        } else {
          _results.push(void 0);
        }
      }
      return _results;
    };
    $scope.openAssessUploadDialog = function(document) {
      $scope.assess_upload = {
        title: document.title,
        type: document.type,
        tag: document.tag || document.title,
        referrer: $scope.selectedAssess.contact._id,
        files: [],
        url: '/property/' + $scope.property._id + '/upload',
        onHide: function(files) {
          console.log($scope.assess_upload);
          console.log($scope.assess_upload.files);
          files = files.map(function(file) {
            var obj;
            obj = {};
            _.extend(obj, file);
            obj.type = obj.record_type;
            return obj;
          });
          $scope.selectedAssess.contact.assessment[document.type] = $scope.selectedAssess.contact.assessment[document.type].concat(files);
          $scope.assess_upload.files = [];
          return $scope.assessView = 'default';
        },
        reset: true
      };
      return $scope.assessView = 'upload';
    };
    $scope.openGuarantorUploadDialog = function(document) {
      $scope.guarantor_upload = {
        title: document.title,
        type: document.type,
        tag: document.tag || document.title,
        referrer: $scope.selectedGuar._id,
        files: [],
        url: '/property/' + $scope.property._id + '/upload',
        onHide: function(files) {
          files = files.map(function(file) {
            var obj;
            obj = {};
            _.extend(obj, file);
            obj.type = obj.record_type;
            return obj;
          });
          $scope.property.documents = $scope.property.documents.concat(files);
          $scope.guarantor_upload.files = [];
          return $scope.guarantorView = 'default';
        },
        reset: true
      };
      return $scope.guarantorView = 'upload';
    };
    $scope.assess_records = {
      backgroundReport: {
        type: 'backgroundCheck',
        title: 'Background Report',
        tag: 'background check'
      },
      landlordReference: {
        type: 'landlordReference',
        title: 'Landlord Reference',
        tag: 'landlord reference'
      },
      incomeReference: {
        type: 'confirmIncome',
        title: 'Income Reference',
        tag: 'income'
      }
    };
    return $scope.deleteUpload = function(upload) {
      return $http.get('/documents/delete-document/' + upload._id).success(function(data) {
        var index;
        if (data === 'ok') {
          index = $scope.selectedAssess.contact.assessment[upload.type].indexOf(upload);
          return $scope.selectedAssess.contact.assessment[upload.type].splice(index, 1);
        }
      });
    };
  }
]);