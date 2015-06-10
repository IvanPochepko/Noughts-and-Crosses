/**
 * Created by andrew on 12.05.15.
 */
angular.module('my-app', ['ngRoute']).config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider){
    $routeProvider
    .when('/', {
        controller: 'home',
        templateUrl: '/partials/home'
    })
    .when('/games/:gameId', {
        controller: 'game',
        templateUrl: '/partials/game'
    })
    $locationProvider.html5Mode(true)
}]).run(['$rootScope', '$http', function($rootScope, $http){
    $http.get('/users/vcard').success(function(data){
        $rootScope.user = data.user
        $rootScope.players = data.users
        $rootScope.games = data.games
    })
}])

angular.module('my-app').controller('game', ['$scope', '$http', '$location', 'socket', function($scope, $http, $location, socket){
    $scope.gameFields = [{id: 1},{id: 2},{id: 3},{id: 4},{id: 5},{id: 6},{id: 7},{id: 8}, {id: 9}]
    $scope.showWinner = false
    // get game data
    $http.get(location.pathname +'/json').success(function(data){
        $scope.chat = data.game.chat
        $scope.game = data.game
        $scope.yourTurn = data.yourTurn
        var userRole = 'guest'
        if (data.game.player1._id == $scope.user._id)
            userRole = 'player1'
        if (data.game.player2._id == $scope.user._id)
            userRole = 'player2'
        $scope.userRole = userRole
        var turns = data.game.turns || []
        socket.emit('subscribe', {game: data.game._id})
        turns.forEach(function(turn){
            var field = _.findWhere($scope.gameFields, {id:  Number(turn.id)})
            field.type = turn.type
        })
        if (data.winner) {
            $scope.winText = getWinText(data.winner)
            $scope.showWinner = true
        }
    })
    // making turn handler
    $scope.makeTurn = function(field){
        if (!$scope.yourTurn) return
        if (field.type) return
        $http.post(location.pathname + '/addturn', field).success(function (data){
            $scope.yourTurn = false;
            var winner = data.winner;
        })
    }
    socket.on('chatMessage', function(message){
        $scope.$apply(function(){
            $scope.chat.push(message)
        })
        $scope.flag = true
    })
    socket.on('gameTurn', function(data){
        var field = _.findWhere($scope.gameFields, {id: data.turn.id})
        $scope.$apply(function(){
            field.type = data.turn.type
            if (data.winner) {
                $scope.winText = getWinText(data.winner)
                $scope.showWinner = true
            }
        })
        $scope.yourTurn = data.whoseTurn == $scope.userRole
    })
    $scope.sendMessage = function(event){
        if (event && event.which != 13) return
        if(!$scope.newMessage) return
        var url = location.pathname + '/addmessage'
        $http.post(url, {message: $scope.newMessage})
        $scope.newMessage = ''
    }
    function getWinText (winner) {
        var text = winner.login + ' won the game!'
        if ($scope.userRole != 'guest' && $scope.user._id == winner._id)
            text = 'Congratulations! You won!'
        if ($scope.userRole != 'guest' && $scope.user._id != winner._id)
            text = 'Sorry! You lost!'
        return text
    }
}])

.controller('home', ['$scope', '$http', '$location', function($scope, $http, $location){
    $scope.newGame = {}
    $scope.createGame = function(){
        if (!$scope.newGame.player2) return
        $http.post('/games/create', $scope.newGame).success(function(game){
            $location.path('/games/' + game._id)
        })
        return false
    }
}])
.directive('chatScroll', function(){
    return function(scope, element, attrs){
        scope.$watch(attrs.flag, function(newval, oldval){
            if (newval) {
                scope[attrs.flag] = false
                element.scrollTop(element.height())
            }
        })
    }
})
.directive('myModal', function(){
    return function (scope, el, attr) {
        show = attr.show
        scope.$watch(show, function(val){
            if (!val) return
            el.modal()
            scope[show] = false
        })
    }
})
.factory('socket', [function(){
    var socket = io.connect(location.origin)
    return socket
}])
