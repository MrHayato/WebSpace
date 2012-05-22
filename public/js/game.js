$(document).ready(function() {
    var socket = io.connect('/server');
    var id = $("#serverId").val();
    var name = $("#serverName").val();

    var stage = new Kinetic.Stage({ container: "container" });
    var playerLayer = new Kinetic.Layer();
    var projectileLayer = new Kinetic.Layer();
    var playersList = {};
    var projectilesList = {};

    socket.on('connect', function(){
        var settings = {
            screenSize: {
                width: $(document).width(),
                height: $(document).height()
            },
            id: id,
            name: name
        };

        stage.setSize(settings.screenSize.width, settings.screenSize.height);
        stage.add(playerLayer);
        stage.add(projectileLayer);

        socket.emit('join', settings);
    });

    socket.on('onJoin', function(server) {
        id = server.id;
        name = server.name;
    });

    socket.on('error', function(message){
        console.log(message);
    });

    socket.on('update', function(message) {
        var players = message.players;
        var projectiles = message.projectiles;
        var removedProjectiles = message.removedProjectiles;

        for (var playerId in players) {
            var playerImage = playersList[playerId];
            var player = players[playerId];

            if (playerImage) {
                playerImage.setX(player.position.elements[0]);
                playerImage.setY(player.position.elements[1]);
                playerImage.setRotation(player.orientation);
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
                playerImage.setCenterOffset(25, 25);

                playerLayer.add(playerImage);
                playersList[playerId] = playerImage;
            }
        }

        for (var projectileId in projectiles) {
            var projectileImage = projectilesList[projectileId];
            var projectile = projectiles[projectileId];

            if (projectileImage) {
                projectileImage.setX(projectile.position.elements[0]);
                projectileImage.setY(projectile.position.elements[1]);
            } else {
                var img = new Image();
                img.src = "/images/projectile.png";

                projectileImage = new Kinetic.Image({
                    x: projectile.position.elements[0],
                    y: projectile.position.elements[1],
                    image: img,
                    width: 8,
                    height: 8
                });
                projectileImage.setCenterOffset(4, 4);

                projectileLayer.add(projectileImage);
                projectilesList[projectileId] = projectileImage;
            }
        }


        for (var i = 0; i < removedProjectiles.length; i++) {
            var projectileId = removedProjectiles[i];
            var projectileImage = projectilesList[projectileId];
            projectileLayer.remove(projectileImage);
            delete projectilesList[removedProjectiles[i]];
        }

        stage.draw();
    });
});