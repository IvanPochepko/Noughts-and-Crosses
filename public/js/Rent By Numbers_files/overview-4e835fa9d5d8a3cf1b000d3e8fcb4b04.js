angular.module("rbn").controller('overview', [
  '$scope', '$rootScope', '$http', '$routeParams', '$sce', '$modal', function($scope, $rootScope, $http, $routeParams, $sce, $modal) {
    var TenancyModalController, checkComplianceItemStatus, getComplianceRecords, initializeCompliance, initializeReminders, routeName;
    routeName = $routeParams.property;
    $scope.$watch('properties', function() {
      return $scope.property = _.findWhere($scope.properties, {
        routeName: routeName
      });
    });
    $scope.$watch('property', function(actual, old) {
      if (!actual) {
        return;
      }
      $scope.setAddressUrl();
      initializeCompliance();
      return initializeReminders(actual);
    });
    $scope.$watch('property.navState', function(actual) {
      if (actual === 'collapsed') {
        return $scope.property.order = 10;
      }
    });
    $scope.property = _.findWhere($scope.properties, {
      routeName: routeName
    });
    $scope.setAddressUrl = function() {
      var addr, arr, str, url;
      url = "https://www.google.com/maps/embed/v1/place?key=AIzaSyC9OzXVR1ns1dwQq4qc46FhiRmptKza_PE&q=";
      addr = $scope.property.address;
      arr = _.compact(['United Kingdom', addr.county, addr.city, addr.address1, addr.address2]);
      str = arr.join('+');
      str = str.replace(/\s+/g, '+').replace(/,/g, '');
      return $scope.map_url = $sce.trustAsResourceUrl(url + str);
    };
    $scope.getComplianceStatus = function(item) {
      if (!item) {
        return '';
      }
      if (item.status === 'expiring' && item.supplied) {
        return 'orange colored';
      }
      if (item.status === 'expired' && item.supplied) {
        return 'red colored';
      }
      return 'normal';
    };
    $scope.getComplianceImage = function(item) {
      var postfix;
      if (!item) {
        return '';
      }
      postfix = '-active';
      if (item.supplied && item.status === 'not-assigned') {
        postfix = '-not-assigned';
      }
      if (item.supplied && (item.status === 'expired' || item.status === 'expiring')) {
        postfix = '';
      }
      if (!item.supplied) {
        postfix = '-not';
      }
      return '/img/compliance/' + item.type + postfix + '.png';
    };
    $scope.getReminderIcon = function(reminder) {
      var obj;
      obj = {
        type: reminder.referrer,
        status: 'not-assigned',
        supplied: true
      };
      return $scope.getComplianceImage(obj);
    };
    $scope.formatDate = function(date, format) {
      if (!date) {
        return '';
      }
      format = format || 'MMM DD, YYYY';
      return moment(date).format(format);
    };
    $scope.getDaysLeft = function(date) {
      var diff, postfix;
      if (!date) {
        return '';
      }
      diff = moment(date).diff(new Date(), 'days');
      if (diff > 0) {
        postfix = 'remaining';
      } else {
        diff = -diff;
        postfix = 'overdue';
      }
      return diff + ' days ' + postfix;
    };
    $scope.openDetailedView = function(item) {
      console.log(item);
      if (!item.expire_at) {
        item.expire_at = null;
      }
      $scope.activeItem = item;
      $scope.activeItem.backup = {};
      $scope.activeItem.view = 'default';
      $scope.utils.view = 'detailed';
      return item.backup = _.pick(item, 'expire_at', 'supplied', 'records', 'expenses', 'not_supplied');
    };
    $scope.saveComplianceItem = function(item) {
      var data_obj, url;
      checkComplianceItemStatus(item);
      delete item.backup;
      $scope.utils.view = 'default';
      item.view = 'default';
      url = '/property/' + $scope.property._id + '/compliance/update';
      data_obj = _.omit(item, 'documents', 'order', 'datefield', '_expenses', 'unsuppliable', 'title');
      return $http.post(url, {
        item: data_obj
      }).success(function(data) {
        var reminder;
        if (!data.reminder) {
          return;
        }
        if (data.reminder.removed) {
          return $scope.reminders = _.reject($scope.reminders, function(r) {
            return r._id === data.reminder._id;
          });
        } else {
          reminder = _.findWhere($scope.reminders, {
            _id: data.reminder._id
          });
          return reminder.due_date = data.reminder.due_date;
        }
      });
    };
    $scope.resetComplianceItem = function(item) {
      var key, value, _i, _len, _ref;
      item = _.extend(item, item.backup);
      _ref = item.backup;
      for (value = _i = 0, _len = _ref.length; _i < _len; value = ++_i) {
        key = _ref[value];
        item[key] = value;
      }
      delete item.backup;
      $scope.utils.view = 'default';
      return item.view = 'default';
    };
    $scope.changeExpireDate = function(item, date) {
      return item.expire_at = date;
    };
    $scope.closeDetailedView = function(item) {
      if (item.view === 'edit') {
        $scope.resetComplianceItem(item);
      }
      $scope.utils.view = 'default';
      return item.view = 'default';
    };
    $scope.openUploadDialog = function(document) {
      $scope.upload = {
        title: document.title,
        type: document.type,
        tag: document.tag || document.title,
        referrer: $scope.activeItem.type,
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
          $scope.upload.files = [];
          getComplianceRecords($scope.activeItem);
          return $scope.utils.view = 'detailed';
        },
        reset: true
      };
      return $scope.utils.view = 'upload';
    };
    $scope.closeUploadDialog = function() {
      return $scope.upload.onHide([]);
    };
    $scope.isDateEditable = function(item) {
      if (!item) {
        return false;
      }
      if (item.status === 'not-assigned') {
        return false;
      }
      if (item.view === 'edit') {
        return true;
      }
      return item.supplied && (item.status === 'expiring' || item.status === 'expired');
    };
    $scope.openNewTodoForm = function() {
      var defaultTags;
      $scope.sidebar_level = 'bottom';
      $scope.sidebar_header = "Add To-Do";
      $scope.reminders_mode = 'new';
      defaultTags = [
        {
          type: 'property',
          text: $scope.property.name,
          id: 1
        }
      ];
      $scope.new_reminder = {
        type: 'todo',
        property: $scope.property._id,
        tags: defaultTags
      };
      return $scope.new_tag = '';
    };
    $scope.closeNewTodoForm = function() {
      $scope.sidebar_level = 'top';
      $scope.reminders_mode = 'default';
      return $scope.new_reminder = {};
    };
    $scope.changeReminderDate = function(date) {
      return $scope.new_reminder.due_date = date;
    };
    $scope.deleteReminderTag = function(tag) {
      var tags;
      tags = $scope.new_reminder.tags;
      return $scope.new_reminder.tags = _.without(tags, tag);
    };
    $scope.reminderTagKeyPressed = function($event) {
      var id;
      if ($event.which !== 13) {
        return;
      }
      if (!$scope.new_tag) {
        return;
      }
      id = Math.ceil(Math.random() * 99999) + 2;
      $scope.new_reminder.tags = $scope.new_reminder.tags.concat({
        type: 'custom',
        text: $scope.new_tag,
        id: id
      });
      return $scope.new_tag = '';
    };
    $scope.saveNewTodoReminder = function() {
      console.log('New Reminder: ', $scope.new_reminder);
      return $http.post('/reminders/create', $scope.new_reminder).success(function(data) {
        $scope.property.reminders.push(data);
        $scope.reminders = $scope.reminders.concat(data);
        return $scope.closeNewTodoForm();
      });
    };
    $scope.validateTodoItem = function(reminder) {
      return !(reminder && reminder.due_date && reminder.title && reminder.description);
    };
    initializeCompliance = function() {
      var items, opts, utils, _ref;
      items = (_ref = $scope.property) != null ? _ref.utilities : void 0;
      if (!items) {
        return;
      }
      opts = {
        gas: {
          order: 1,
          documents: [
            {
              title: 'Gas Safety Certificate(CP12)',
              type: 'CP12',
              tag: 'Gas Safety Cert(CP12)'
            }
          ],
          datefield: {
            title: 'Expiry Date'
          },
          _expenses: {
            title: 'Gas Safety Check'
          },
          unsuppliable: 'supplied',
          title: ['Gas', 'Safety']
        },
        electrical: {
          order: 2,
          documents: [
            {
              title: "Electrical Installation Condition Report",
              type: "EICR",
              tag: "EICR"
            }, {
              title: 'PAT Certificate',
              type: 'PAT',
              tag: 'PAT Cert'
            }
          ],
          datefield: {
            title: 'Inspection Due Date'
          },
          _expenses: {
            title: 'Electrical Inspection'
          },
          unsuppliable: false,
          title: ['Electrical', 'Safety']
        },
        energy: {
          order: 3,
          documents: [
            {
              title: 'Energy Performance Certificate',
              type: "Energy Performance Cert",
              tag: "Energy Performance Cert"
            }
          ],
          datefield: {
            title: 'Expiry Date'
          },
          _expenses: {
            title: 'Energy Performance Check'
          },
          unsuppliable: false,
          title: ['Energy', 'Performance']
        },
        license: {
          order: 4,
          documents: [
            {
              title: "License Agreement",
              type: "License Agreement"
            }
          ],
          _expenses: {
            title: "License"
          },
          datefield: {
            title: 'Expiry Date'
          },
          unsuppliable: 'required',
          title: ['License']
        }
      };
      utils = {};
      _.each(items, function(item) {
        item.not_supplied = !item.supplied;
        item.view = 'default';
        item = _.extend(item, opts[item.type]);
        item.records = getComplianceRecords(item);
        checkComplianceItemStatus(item);
        return utils[item.type] = item;
      });
      $scope.utils = utils;
      return $scope.utils.view = 'default';
    };
    checkComplianceItemStatus = function(item) {
      var exp_range, status;
      exp_range = moment().add(30, 'd');
      status = 'active';
      if (!item.expire_at) {
        status = 'not-assigned';
      }
      if (item.expire_at && moment(item.expire_at).isBefore(exp_range)) {
        status = 'expiring';
      }
      if (item.expire_at && moment(item.expire_at).isBefore(moment())) {
        status = 'expired';
      }
      return item.status = status;
    };
    getComplianceRecords = function(item) {
      var no_records;
      no_records = [];
      item.documents.forEach(function(doc) {
        var records;
        records = _.where($scope.property.documents, {
          type: doc.type
        });
        records = _.sortBy(records, 'expire_at').reverse();
        doc.limit = 1;
        doc.records = records;
        if (!records.length) {
          return no_records.push(doc);
        }
      });
      return item.missing_records = no_records;
    };
    initializeReminders = function(item) {
      if (!item) {
        return;
      }
      return $scope.reminders = item.reminders;
    };
    return TenancyModalController = [
      '$scope', '$modalInstance', 'items', function($scope, $modalInstance, items) {
        return console.log('Tenancy Modal Controller');
      }
    ];
  }
]);