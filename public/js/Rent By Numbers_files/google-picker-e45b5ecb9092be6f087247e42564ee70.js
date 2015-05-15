/*
 * angular-google-picker
 *
 * Interact with the Google API Picker
 * More information about the Google API can be found at https://developers.google.com/picker/
 *
 * (c) 2014 Loic Kartono
 * License: MIT
 */
angular.module('lk-google-picker', []).provider('lkGoogleSettings', function() {
  this.apiKey = null;
  this.clientId = null;
  this.scopes = ['https://www.googleapis.com/auth/drive'];
  this.features = ['MULTISELECT_ENABLED'];
  this.views = ['DocsView().setIncludeFolders(true)', 'DocsUploadView().setIncludeFolders(true)'];
  this.locale = 'en';

  /**
   * Provider factory $get method
   * Return Google Picker API settings
   */
  this.$get = function() {
    return {
      apiKey: this.apiKey,
      clientId: this.clientId,
      scopes: this.scopes,
      features: this.features,
      views: this.views,
      locale: this.locale
    };
  };

  /**
   * Set the API config params using a hash
   */
  this.configure = function(config) {
    var key;
    for (key in config) {
      key = key;
      this[key] = config[key];
    }
  };
}).directive('lkGooglePicker', [
  'lkGoogleSettings', function(lkGoogleSettings) {
    return {
      restrict: 'A',
      scope: {
        pickerFiles: '='
      },
      controller: [
        "$scope", function($scope) {
          $scope.files = [];
          return $scope.$watch('files', function(old, newval) {
            $scope.pickerFiles = $scope.files;
            return console.log("QWERWDSAD", $scope.files);
          });
        }
      ],
      link: function(scope, element, attrs) {
        var accessToken, handleAuthResult, instanciate, onApiAuthLoad, openDialog, pickerResponse;
        accessToken = null;

        /*
         * Load required modules
         */
        instanciate = function() {
          gapi.load('auth', {
            'callback': onApiAuthLoad
          });
          gapi.load('picker');
        };

        /**
         * OAuth autorization
         * If user is already logged in, then open the Picker modal
         */
        onApiAuthLoad = function() {
          if (gapi.auth.getToken() && accessToken) {
            openDialog();
          } else {
            gapi.auth.authorize({
              'client_id': lkGoogleSettings.clientId,
              'scope': lkGoogleSettings.scopes,
              'immediate': false
            }, handleAuthResult);
          }
        };

        /**
         * Google API OAuth response
         */
        handleAuthResult = function(result) {
          if (result && !result.error) {
            accessToken = result.access_token;
            openDialog();
          }
        };

        /**
         * Everything is good, open the files picker
         */
        openDialog = function() {
          var picker;
          picker = (new google.picker.PickerBuilder).setLocale(lkGoogleSettings.locale).setDeveloperKey(lkGoogleSettings.apiKey).setOAuthToken(accessToken).setCallback(pickerResponse);
          if (lkGoogleSettings.features.length > 0) {
            angular.forEach(lkGoogleSettings.features, function(feature, key) {
              picker.enableFeature(google.picker.Feature[feature]);
            });
          }
          if (lkGoogleSettings.views.length > 0) {
            angular.forEach(lkGoogleSettings.views, function(view, key) {
              var view;
              view = eval('new google.picker.' + view);
              picker.addView(view);
            });
          }
          picker.build().setVisible(true);
        };

        /**
         * Callback invoked when interacting with the Picker
         * data: Object returned by the API
         */
        pickerResponse = function(data) {
          if (data.action === google.picker.Action.PICKED) {
            console.log('GOOGLE ReSPONSE', data.docs);
            return gapi.client.load('drive', 'v2', function() {
              scope.files = data.docs;
              return scope.$apply();
            });
          }
        };
        gapi.load('auth');
        gapi.load('picker');
        element.bind('click', function(e) {
          instanciate();
        });
      }
    };
  }
]);