$(document).ready(function () {
    $('#create-form').bind('submit', function () {
        $.ajax({
            url: '/join',
            data: { CharName: $('#CharName').val() },
            type: 'POST',
            success: function (response) {
                window.location.href = '/user/' + response.id;
            }
        });
        return false;
    });
});