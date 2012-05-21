var socket = io.connect('/server');

var stage = new Kinetic.Stage({ container: "container" });
var playerLayer = new Kinetic.Layer();
var projectileLayer = new Kinetic.Layer();
var playersList = {};

socket.on('connect', function(){
    var settings = {
        screenSize: {
            width: $(document).width(),
            height: $(document).height()
        }
    };

    stage.setSize(settings.screenSize.width, settings.screenSize.height);
    stage.add(playerLayer);
    stage.add(projectileLayer);

    socket.emit('init', settings);
});

socket.on('error', function(message){
    console.log(message);
});

socket.on('update', function(message) {
    var players = message.players;

    for (var playerId in players) {
        var playerImage = playersList[playerId];
        var player = players[playerId];

        if (playerImage) {
            playerImage.setX(player.position.elements[0]);
            playerImage.setY(player.position.elements[1]);
            playerImage.setRotation(player.orientation);
            playerImage.setCenterOffset(25, 25);
        } else {
            var img = new Image();
            img.src = "/images/spaceship.png";

            playerImage = new Kinetic.Image({
                x: player.position.elements[0],
                y: player.position.elements[1],
                rotation: player.orientation,
                image: img,
                width: 50,
                height: 50
            });

            playerLayer.add(playerImage);
            playersList[playerId] = playerImage;
        }
    }

    stage.draw();
});