$(document).ready(function() {
    var socket = io.connect('/client');
    var serverId = $("#serverId").val();
    var name = $("#clientName").val();

    var publish = function(action, message) {
        var obj = {
            message: message
        };

        socket.emit(action, obj);
    };

    var leftJoystickDown = function (evt) { publish("move", "down"); };
    var leftJoystickMove = function (evt) { publish("move", evt); };
    var leftJoystickUp = function (evt) { publish("move", "up"); };
    var rightJoystickDown = function (evt) { publish("fire", "down"); };
    var rightJoystickMove = function (evt) { publish("fire", evt); };
    var rightJoystickUp = function (evt) { publish("fire", "up"); };

    var leftJoystick = new VirtualJoystick({
        container: $("#left-analog")[0],
        mouseSupport: true,
        range: 20,
        inputDown: leftJoystickDown,
        inputMove: leftJoystickMove,
        inputUp: leftJoystickUp
    });

    var rightJoystick = new VirtualJoystick({
        container: $("#right-analog")[0],
        mouseSupport: true,
        range: 20,
        inputDown: rightJoystickDown,
        inputMove: rightJoystickMove,
        inputUp: rightJoystickUp
    });

    socket.on('connect', function () {
        socket.emit('join', { name: name, server: serverId });
    });
});