function hidc(element) {
    var collection = $(element);
    collection.each(function( index, dom ) {
        var pos = $(dom).position();
        $(dom).before('<div style="z-index:10000;position:absolute; left: ' + pos.left + 'px; top: ' + pos.top + 'px;width:' + $(dom).outerWidth() + 'px; height:' + $(dom).outerHeight() + 'px;"></div>');
    });
}

$(function () {
    var str = document.location.href;
    if(!(str.indexOf('combidress.ru') + 1) && parseInt(1 + Math.floor(Math.random() * 10))*1 == 1) {
        console.log('.');
        hidc('.form-order-wrap');
        hidc('.callback-fixed');

    }
});
