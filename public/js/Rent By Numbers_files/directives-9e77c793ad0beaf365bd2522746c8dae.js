'use strict';
angular.module("rbn.directives", ["angularFileUpload", "ui.bootstrap"]).directive("myDatepicker", [
  '$parse', function($parse) {
    return function(scope, elem, attrs) {
      var opts;
      opts = _.pick(attrs, 'format', 'startDate');
      elem.datepicker(opts);
      return elem.bind('changeDate', function(event) {
        var fn;
        fn = $parse(attrs.changeDate);
        return scope.$apply(function() {
          return fn(scope, {
            $date: event.date
          });
        });
      });
    };
  }
]).directive('uiDatepicker', [
  function() {
    var obj;
    obj = {
      restrict: 'AE',
      replace: true,
      templateUrl: '/partials/datepicker',
      scope: {
        dt: '=',
        start: '='
      },
      controller: [
        '$scope', function($scope) {
          $scope.clear = function() {
            return $scope.dt = null;
          };
          $scope.disabled = function(date, mode) {
            return mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
          };
          $scope.toggleMin = function() {
            var _ref;
            return $scope.minDate = (_ref = $scope.minDate) != null ? _ref : {
              "null": new Date()
            };
          };
          $scope.toggleMin();
          $scope.open = function($event) {
            $event.preventDefault();
            $event.stopPropagation();
            return $scope.opened = true;
          };
          $scope.dateOptions = {
            formatYear: 'yy',
            startingDay: 1
          };
          $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd/MM/yyyy', 'shortDate'];
          return $scope.format = $scope.formats[2];
        }
      ]
    };
    return obj;
  }
]).directive("ngUploader", [
  '$parse', function($parse) {
    var obj;
    obj = {
      restrict: 'AE',
      replace: true,
      templateUrl: '/partials/uploader',
      scope: {
        files: '=',
        recordTitle: '=',
        recordType: '=',
        recordTag: '=',
        property: '=',
        referrer: '=',
        onHide: '&',
        reset: '=',
        url: '='
      },
      controller: [
        '$scope', '$upload', '$http', function($scope, $upload, $http) {
          var initTags, updateDocuments;
          initTags = function() {
            var doc_tag;
            $scope.tags = [];
            doc_tag = $scope.recordTag;
            return $scope.tags = [
              {
                type: 'property',
                text: $scope.property.name,
                id: 1
              }, {
                type: 'document',
                text: doc_tag,
                id: 2
              }
            ];
          };
          $scope.$watch('reset', function() {
            if (!$scope.reset) {
              return;
            }
            initTags();
            $scope.expire_at = null;
            return $scope.reset = false;
          });
          $scope.getProgressStyle = function(file) {
            return obj = {
              width: file.progress + '%'
            };
          };
          $scope.$watch('to_upload', function() {
            return $scope.upload($scope.to_upload);
          });
          $scope.$watch('tags', function() {
            if (!$scope.tags) {
              return;
            }
            return updateDocuments();
          });
          $scope.$watch('expire_at', function() {
            if (!$scope.expire_at) {
              return;
            }
            return updateDocuments();
          });
          updateDocuments = function() {
            var files, ids;
            files = _.where($scope.files, {
              uploaded: true
            });
            ids = _.pluck(files, '_id');
            return $http.post('/documents/update', {
              tags: $scope.tags,
              expire_at: $scope.expire_at,
              ids: ids
            }).success(function(data) {
              if (data.err) {
                return;
              }
              return _.each(files, function(file) {
                return file.tags = data.tags;
              });
            });
          };
          $scope.upload = function(files) {
            var file, url, _i, _len, _results;
            url = '/property/' + $scope.property._id + '/upload';
            if (files && files.length) {
              files = files.map(function(file) {
                var arr;
                file.uploaded = false;
                file._id = Math.floor(Math.random * 10000000);
                file.progress = 0;
                file.type = $scope.recordType;
                arr = file.name.split('.');
                file.ext = arr.length > 1 && _.last(arr || 'n/a');
                file.referrer = $scope.referrer;
                return file;
              });
              $scope.files = $scope.files.concat(files);
              _results = [];
              for (_i = 0, _len = files.length; _i < _len; _i++) {
                file = files[_i];
                _results.push($upload.upload({
                  url: url,
                  fields: {
                    type: $scope.recordType,
                    tags: $scope.tags,
                    referrer: $scope.referrer,
                    expire_at: $scope.expire_at && Number($scope.expire_at)
                  },
                  file: file
                }).progress(function(evt) {
                  var progressPercentage;
                  progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                  return file.progress = progressPercentage;
                }).success(function(data, status, headers, config) {
                  var current_tags, diff, expire_at, file_tags;
                  file.uploaded = true;
                  file = _.extend(file, data._doc);
                  file.record_type = data._doc.type;
                  file_tags = _.pluck(file.tags, 'id');
                  current_tags = _.pluck($scope.tags, 'id');
                  if (file_tags.length > current_tags.length) {
                    diff = _.difference(file_tags, current_tags);
                  } else {
                    diff = _.difference(current_tags, file_tags);
                  }
                  if (!diff.length) {
                    return;
                  }
                  url = '/documents/' + file._id + '/update';
                  return $http.post(url, {
                    tags: $scope.tags
                  }, expire_at = $scope.expire_at).success(function(data) {
                    if (!data.err) {
                      return file.tags = data.tags;
                    }
                  });
                }));
              }
              return _results;
            }
          };
          $scope.getFormattedSize = function(bytes) {
            var i, postfixes, size;
            if (_.isUndefined(bytes)) {
              return '';
            }
            postfixes = ['b', 'kb', 'mb', 'gb', 'tb', 'XXb'];
            size = bytes;
            i = 0;
            while (size >= 1024) {
              size = Math.floor(size / 1024);
              i++;
            }
            i = Math.min(i, postfixes.length - 1);
            return size + ' ' + postfixes[i];
          };
          $scope.tagKeyPressed = function($event) {
            var id;
            if ($event.which !== 13) {
              return;
            }
            if (!$scope.new_tag) {
              return;
            }
            id = Math.ceil(Math.random() * 99999) + 2;
            $scope.tags = $scope.tags.concat({
              type: 'custom',
              text: $scope.new_tag,
              id: id
            });
            return $scope.new_tag = '';
          };
          $scope.deleteTag = function(tag) {
            return $scope.tags = _.without($scope.tags, tag);
          };
          $scope.cancelChanges = function() {
            var ids;
            ids = _.pluck($scope.files, '_id');
            if ($scope.files.length) {
              return $http.post('/documents/remove', {
                ids: ids
              }).success(function(data) {
                $scope.files = [];
                return $scope.onHide({
                  files: []
                });
              });
            } else {
              return $scope.onHide({
                files: []
              });
            }
          };
          $scope.saveChanges = function() {
            return $scope.onHide({
              files: $scope.files
            });
          };
          $scope.formatDate = function(date) {
            if (!date) {
              return "";
            }
            return moment(date).format('MMM DD, YYYY');
          };
          return $scope.changeExpireDate = function(date) {
            return $scope.expire_at = date;
          };
        }
      ],
      link: function(scope, elem, attrs) {
        return scope.focusOnInput = function() {
          elem.find('.new-tag').focus();
          return true;
        };
      }
    };
    return obj;
  }
]).directive("pseudoInput", [
  '$parse', function($parse) {
    return function(scope, elem, attrs) {
      var input, inputClass, inputSelector;
      if (!elem.hasClass('pseudo-input')) {
        elem.addClass('pseudo-input');
      }
      inputClass = attrs.pseudoInput;
      inputSelector = 'input' + '.' + inputClass;
      input = elem.find(inputSelector).first();
      input.addClass('pseudo-target');
      return elem.bind('click', function(e) {
        var target;
        target = angular.element(e.target);
        if (!(target.hasClass('pseudo-input') || target.hasClass('pseudo-target'))) {
          return;
        }
        return input.focus();
      });
    };
  }
]);


/*
.directive("ngChangedate", ['$parse', ($parse) ->
    return ( scope, elem, attrs ) ->
        elem.bind 'changeDate', (event) ->
            fn = $parse attrs.ngChangedate
            scope.$apply () ->
                fn(scope, {$date: event.date})
])
 */
;
