/**
 * Created by andrew on 21.04.15.
 */
var game = {};
var userRole = "guest";
var yourTurn = false;
var winner = '';

$(document).ready(function(){
    socket = io.connect('http://localhost:3000')
    init(function(game){
        socket.emit('subscribe', {game: game._id})
    })

    $('.deskpole').on('click', function(){
        //console.log('click')
        winnerCheck(winner)
        if(userRole == 'guest') return;
        var id = $(this).attr('id');
        if(!yourTurn) return;
        //console.log('yourTurn in cross turn: ', yourTurn);
        var figureData = {id: id};
        doTurn(figureData, function(turn){
            //console.log('doTurn function callback "turn": ', turn);
            winnerCheck(winner)
        });
    })

    socket.on('gameTurn', function(data){
        //console.log('make turn: ', data)
        //yourTurn = data.yourTurn;
        //console.log (yourTurn)
        game.turns = game.turns.concat(data.turn);
        //console.log('game turns: ', game.turns)
        var figure = data.turn
        yourTurn = data.whoseTurn == userRole
        //console.log('figure: ', figure)
        renderTurn(figure);
        winnerCheck(data.winner);
    })
});

function init(cb){
    $.get(location.pathname+'/json', function(data){
        //console.log(data)
        game = data.game;
        yourTurn = data.yourTurn;
        winner = data.winner;
        //console.log(winner);
        //console.log(yourTurn);
        if (game.player1._id == data.user._id) userRole = 'player1';
        if (game.player2._id == data.user._id) userRole = 'player2';
        render();
        winnerCheck(winner)
        game.initialized = true;
        cb && cb(game);
    })
}
// render figures
function render () {
    var deskpoles = $('.deskpole'); // get all deskpole jquery collection
    game.turns.forEach(function(turn) {
        if(turn.type == 'undefined') turn.type = 'cross';
        var deskpole = deskpoles.eq(turn.id - 1),
            img = $('<img>').attr({src: "/img/" + turn.type + '.jpg'});
        deskpole.html(img);
    })

}
// render one turn after page render
function renderTurn (turn) {
    console.log('renderTurn "turn"= ', turn)
    var deskpoles = $('.deskpole'); // get all deskpole jquery collection
    var deskpole = deskpoles.eq(turn.id - 1),
        img = $('<img>').attr({src: "/img/" + turn.type + '.jpg'});
    deskpole.html(img);
}
function doTurn(figureData, cb){
    // add turn in db
    $.get(location.pathname+'/addturn', figureData, function (data){
        //console.log(addTurn);
        var newTurn = data.turn;
        yourTurn = false;
        winner = data.winner;
        //console.log('Last Turns: ', newTurn);
        cb(newTurn);
    })
}

function winnerCheck(winner){
    if(!winner) return;
    if(!winner.login && game.turns.length >= 9) {
        $('._winner').text('Draw!');
        $('#win_modal').modal('show');
        return;
    };
    var text = winner.login + ' won!'
    if (userRole != 'guest' &&  winner.login == game[userRole].login )
        text = "You won! Congratulations!"
    if (userRole != 'guest' &&  winner.login != game[userRole].login )
        text = "You lost! Unfortunately..."
    $('._winner').text(text);
    $('#win_modal').modal('show');
}