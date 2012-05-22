$(document).ready(function () {
    var timestamp = escape(new Date().getTime());
    $.get('/servers?timestamp=' + timestamp, function (response){
        $.each(response, function(i, obj) {
            $('#servers').append("<option value='" + obj.id + "'>" + obj.name + "</option>");
        });
    });
});