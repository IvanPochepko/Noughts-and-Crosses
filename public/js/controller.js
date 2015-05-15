/**
 * Created by andrew on 12.05.15.
 */
angular.module('my-app', ['ngRoute']).config(['$routeProvider', function($routeProvider){
}]).run([function(){
    //console.log('run')
}])
angular.module('my-app').controller('myController', ['$scope', '$http', '$location'
, function($scope, $http, $location){
    //console.log(socket)
    //console.log('$location: ', location.pathname + '/json');
    $http.get(location.pathname +'/json').success(function(data){
        //console.log('data: ', data)
        $scope.chat = data.game.chat
    })
    socket.on('chatMessage', function(message){
        //console.log('socket.io: new message', message)
        //console.log($scope.chat)
        $scope.$apply(function(){
            $scope.chat.push(message)
        })
        $scope.flag = true
    })
    $scope.sendMessage = function(){
        //console.log($scope.newMessage)
        if(!$scope.newMessage) return
        var url = location.pathname + '/addmessage'
        $http.post(url, {message: $scope.newMessage})
        $scope.newMessage = ''

    }
}]).directive('chatScroll', function(){
    return function(scope, element, attrs){
        scope.$watch(attrs.flag, function(newval, oldval){
            console.log(newval, oldval)
            if (newval) {
                scope[attrs.flag] = false
                element.scrollTop(element.height())
            }
        })
    }
})