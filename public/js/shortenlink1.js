var longURL;
var linkArray=[];

//var linkArray = ['abc', 'def', 'ghij', 'klmnopqr', 'jkdfhdjhf', 'tsweve7h3m', 'jd73hdnvcj']; // array of the links for pagination
console.log('Script connected');
var linksOnPage = 5;
//var firstInput = false;
var listCount = 5;
$(document).ready(function(){
    //$('ul.pagination').hide();
    renderLinks(linkArray, listCount);
    $('#shortbutton').on('click', function () {
        renderLinks(linkArray, linksOnPage);
        // checking if we already have more than 5 links in list
        /*
        if(listCount > 4) {
            addPagination(linkArray, listCount);
            return false;}
            */
        // add loader image
        //addLoaderImage();
        // get input value
        var inputURL = $('input').val();
        // checking input
        if(!$('input').val().length) {
            $('.input-group').addClass('has-error');
            return;
        }
        // clean input value
        $('.input-lg').val('');
        // encode input url
        longURL = encodeURIComponent(inputURL);
        console.log('encode url: ' , longURL);
        var replyLink = 'https://api-ssl.bit.ly/v3/shorten?login=standrew&apiKey=R_14419a4bbe56443b86c6d81336d8bc95&longUrl='+longURL;
        getShortenLink(replyLink, function(url){
            console.log("shorten link: ", url);
            if($('#loader')) {
                addLink(url)
            };
            renderLinks(linkArray, listCount);
            //listCount++;
            //firstInput = true;
            //if(firstInput){
            //    $('ul.pagination').show('200');
            //}
            // place link in link array for pagination
            //linkArray.push(url);
            //console.log('Shortened links list: ', linkArray);
            console.log('Link array: ', linkArray)
        });
    })
    $('#listoflinks').on('click', '.remove-icon', function(){
        var currentPage = 0;
        linksOnPage;
        console.log('click "Remove link"');
        var i = $(this).parent().index();
             //index = currentPage * linksOnPage + i
        var index = linkArray.length - i - 1;
        console.log({page: currentPage, perPage: linksOnPage, i: i, index: index, el: linkArray[index]});
        linkArray.splice(index, 1);
        renderLinks(linkArray, linksOnPage);

    })
})

function getShortenLink(getlink, cb){
    $.get(getlink, function(response){
        var url = response.data.url;
        console.log("url: ", url);
        console.log(response);
        cb(url);
    });
}
function renderLinks(linkArray, linksOnPage){
    $('#listoflinks li').remove();
    for(i=0; i < linksOnPage; i++){
        if(!linkArray[i]) {
            break;
        }
        var li = $('<li></li>').attr('data-index', i),
            a = $('<a/>').attr('href', linkArray[i]).text(linkArray[i]),
            span = $('<span></span>').addClass('glyphicon glyphicon-remove-circle remove-icon pull-right');
        li.append(a)
        li.append(span)
        $('#listoflinks').prepend(li)
        console.log('i = ', i);
        count = $('#listoflinks li').index();
        //$('#listoflinks').prepend('<li data-index="' + i + '"><a href="' + linkArray[i] + '">' +
        //linkArray[i] + '</a><span data-index="' + i + '" class="glyphicon glyphicon-remove-circle grey pull-right"></span></li>');
        console.log('Link: ', i , '--', linkArray[i]);
    }
}

function addLink(link){
    linkArray.push(link);
}

/*
function addLoaderImage(){
    // add image loader above all exist links (using prepend function)
    listcount = $('#listoflinks li').index();
    $('#listoflinks').prepend('<li data-index="' + listCount + '" ><img src="img/loader.gif" /></li>');
    return listCount;
}

var addLink = function (url, listcount) {
    // add link to ol tag
    linkArray.push(url);
    /*var needLink = $('[data-index='+ listcount +']');
    needLink.html('<a href="' + url + '">' + url + '</a> <span class="glyphicon glyphicon-remove-circle grey pull-right"></span>');
    *//*
    listcount = $('#listoflinks li').index();
    console.log('listcount: ', listcount);
    renderLinks(linkArray, linksOnPage, listcount);
    return listcount;

}
function addPagination(links, count){
    var pages = parseInt(links.length/5);

}
*/


/* $("input").keypress(function (e) {
 if (e.which == 13) {
 return }
 }*/