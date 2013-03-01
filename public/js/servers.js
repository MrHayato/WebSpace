$(document).ready(function () {
    var timestamp = escape(new Date().getTime());
    var setNameEdit = function() {
        if ($("#servers").val() === "0") {
            $('#server-name').removeAttr('disabled');
        } else {
            $('#server-name').attr('disabled', 'disabled');
        }
    };

    $.get('/servers?timestamp=' + timestamp, function (response){
        var first = "";
        $.each(response, function(i, obj) {
            if (first === "")
                first = obj.id;

            $('#servers').append("<option value='" + obj.id + "'>" + obj.name + " (" + obj.population + " players) </option>");
        });
        $('#servers').val(first);
        setNameEdit();
    });

    $('#servers').change(setNameEdit);
});