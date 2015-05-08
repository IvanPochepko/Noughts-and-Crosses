var longURL;
var linkArray=[];
var totalPages = 0, activePage = totalPages;
var linksOnPage = 3;

$(document).ready(function(){
    //$('ul.pagination').hide();
    //renderLinks(linkArray, linksOnPage, activePage);
    $('#shortbutton').on('click', function () {
        renderLinks(linkArray, linksOnPage, activePage);
        // get input value
        var inputURL = $('input').val();
        // checking input
        if(!inputURL) {
            $('.input-group').addClass('has-error');
            $('#error_msg').text('Empty url!');
            return;
        }
        // clean input value
        $('.input-lg').val('');
        $('.input-group').removeClass('has-error');
        $('#error_msg').text('');
        // encode input url
        longURL = encodeURIComponent(inputURL);
        console.log('encode url: ' , longURL);
        var replyLink = 'https://api-ssl.bit.ly/v3/shorten?login=standrew&apiKey=R_14419a4bbe56443b86c6d81336d8bc95&longUrl='+longURL;
        // start shorting link function
        getShortenLink(replyLink, function(url){
            console.log("shorten link: ", url);
            linkArray.push(url);
            renderLinks(linkArray, linksOnPage, activePage);
            console.log('Link array: ', linkArray)
        });
    })
    // REMOVE LINKS FROM LIST
    $('#listoflinks').on('click', '.remove-icon', function(){
        var i = $(this).parent().index();
        var index = totalPages * linksOnPage + i;
        //var index = linkArray.length - i - 1;
        console.log({page: activePage, perPage: linksOnPage, i: i, index: index, el: linkArray[index]});
        linkArray.splice(i, 1);
        //if(activePage > linkArray.length)
        renderLinks(linkArray, linksOnPage, activePage);
    });
    // PAGINATION!!!
    $('#pagination').on('click', '.pages', function() {
        activePage = $(this).parent().attr('data-page');
        console.log('Total pages = ', totalPages, '; Active page = ', activePage);
        //activePage = totalPages;
        renderLinks(linkArray, linksOnPage, activePage);
    })
})

function getShortenLink(getlink, cb){
    $.get(getlink, function(response){
        var url = response.data.url;
       // console.log("url: ", url);
       // console.log(response);
        cb(url);
    });
}
function renderLinks(linkArray, linksOnPage, activePage){
    $('#listoflinks li').remove();
    totalPages = Math.floor(linkArray.length/linksOnPage)
    //console.log(totalPages)
    if(activePage > totalPages && totalPages >= 1) activePage --;
    var start = activePage * linksOnPage;
    var end = start + linksOnPage;
    for(i = start; i < end; i++){
    //for(i = Math.ceil(linkArray.length/linksOnPage); i < linksOnPage; i++){
        if(!linkArray[i]) {
            break;
        }
        /*if(!linkArray[i]){
            activePage--;
        }*/
        var li = $('<li>').attr('data-index', i),
            a = $('<a/>').attr('href', linkArray[i]).text(linkArray[i]),
            span = $('<span></span>').addClass('glyphicon glyphicon-remove-circle remove-icon pull-right');
        span.attr('title', 'Remove link from list');
        li.append(a);
        li.append(span);
        $('#listoflinks').append(li);
    }
    renderPages(linkArray, linksOnPage);
    //return  Math.ceil(linkArray.length/linksOnPage);
}
function addLink(link){
    linkArray.push(link);
}
function renderPages(linkArray, linksOnPage){
    $('#pagination').html('');
    var pages = Math.ceil(linkArray.length/linksOnPage);
    if(pages <= 1) return;
    //console.log('Pages: ', pages);
    for(j = 0; j < pages; j++) {
        var li = $('<li/>').attr('data-page', j),
            a = $('<a/>').attr('href', '#').text(j + 1);
        a.addClass('pages');
        li.append(a);
        $('#pagination').append(li);
    }
    //return totalPages;
}



/* $("input").keypress(function (e) {
 if (e.which == 13) {
 return }
 }*/