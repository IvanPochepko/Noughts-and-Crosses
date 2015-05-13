/**
 * Created by andrew on 12.05.15.
 */
angular.module('my-app', ['ngRoute']).config(['$routeProvider', function($routeProvider){
}]).run([function(){
    console.log('run')
}])
angular.module('my-app').controller('myController', ['$scope', '$http', '$location'
    , function($scope, $http, $location){
        console.log('$location: ', $location.absUrl() + '/json');
        $http.get($location.absUrl() +'/json').success(function(data){
            console.log('data: ', data)
            $scope.gameData = data.chat
    })

}])