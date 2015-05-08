var hasCross = true;
//var winCombo = [[1,2,3],[1,4,7],[1,5,9],[4,5,6],[2,5,8],[3,5,7],[7,8,9],[3,6,9]];
var nought =[];
var cross = [];
var isWin = false;
var link = location.pathname+'/addturn';

$(document).ready(function(){
    $('.deskpole').on('click', function() {

        if(hasCross){
            var figure = $(this);
            figure.addClass('full');
            console.log('Paint Cross');
            // NOTE! need to add turn in db, type turns
            var id = Number($(this).attr('id')), figureData = {id: id, type: 'cross'};
            //console.log('Cross id: ', id, 'figureData: ', figureData);
            putFigureDB(link, figureData, function(addTurn){
                var winPlayer = addTurn.winner;
                //console.log('(addTurn.winner).login: ', (addTurn.winner).login);
                if(addTurn.winner) {
                    success(winPlayer.login, 'Crosses wins!');
                    figure.html('<img src="/img/krestik.jpg">');
                    return;
                }
                cross.push(id); // push number of Id in cross array
                //console.log('Cross array: ', cross); // comment
                figure.html('<img src="/img/krestik.jpg">');
                hasCross = false;
                //success(cross, 'Cross Win!');
            });
            return;
        }
        var figure = $(this);
        figure.addClass('full');
        console.log('Paint Nought');
        var id = Number($(this).attr('id')), figureData = {id: id, type: 'nought'};
        //console.log('Nought id: ', id, 'figureData: ', figureData);
        putFigureDB(link, figureData, function(addTurn) {
            var winPlayer = addTurn.winner;
            //console.log(winPlayer.login);
            if(addTurn.winner) {
                success(winPlayer.login, 'Noughts wins!', addTurn.gstatus);
                figure.html('<img src="/img/nolik.jpg">');
                return;
            }
            figure.html('<img src="/img/nolik.jpg">');
            nought.push(id);
            //console.log('Nought array: ', nought);
            hasCross = true;
            //success(nought, 'Nought Win!');
        });
        return;
    })
});

function success(winner, message, gameStat){
    console.log('Winner -- ',winner, ', ', message);
    isWin = true;
    // show modal dialog
    $('._winner').text(winner+' is winner! Congratulations');
    $('#win_modal').modal('show');
    return isWin;
}
function putFigureDB(link, figureData, cb){
    $.get(link, figureData, function (addTurn) {
        cb(addTurn);
    })
}