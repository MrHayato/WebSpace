$(document).ready(function() {
    var socket = io.connect('/server');
    var id = $("#serverId").val();
    var name = $("#serverName").val();
    var zeroVector = $([0,0]);
    var _lastServerTick = 0;
    var _currentServerTick = 0;
    var fps = 1000/60;
    var framesElapsed = 0;

    var screenWidth = $(document).width();
    var screenHeight = $(document).height();

    var stage = new Kinetic.Stage({ container: "container" });
    var entityLayer = new Kinetic.Layer();
    var entities = {};

    var draw = function() {
        var elapsedTicks = _currentServerTick - _lastServerTick;
        var frames = Math.floor(elapsedTicks / fps);

        for (var entityId in entities) {
            var entity = entities[entityId];
            var lastFrame = entity.attrs.data.lastFrame;
            var currentFrame = entity.attrs.data.currentFrame;
            var t = framesElapsed / frames;

            if (t <= 1) {
                var pos = catmullrom(entity.attrs.data.spline, t);

                if (pos.x > screenWidth)
                    pos.x = screenWidth;
                else if (pos.x < 0)
                    pos.x = 0;
                if (pos.y > screenHeight)
                    pos.y = screenHeight;
                else if (pos.y < 0)
                    pos.y = 0;

                entity.setX(pos[0]);
                entity.setY(pos[1]);
                entity.setRotation(lastFrame.orientation);
            }
        }

        framesElapsed++;
        entityLayer.draw();
    };

    socket.on('connect', function(){
        var settings = {
            screenSize: {
                width: screenWidth,
                height: screenHeight
            },
            id: id,
            name: name
        };

        stage.setSize(settings.screenSize.width, settings.screenSize.height);
        stage.add(entityLayer);

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
        //message = BISON.decode(message);
        framesElapsed = 0;
        _lastServerTick = _currentServerTick;
        _currentServerTick = message[0];
        var updateEntities = message[1];
        var removeEntities = message[2];

        var elapsedTicks = _currentServerTick - _lastServerTick;
        var frames = Math.floor(elapsedTicks / fps);

        for (var i = 0; i < updateEntities.length; i++) {
            var entityData = updateEntities[i];
            var entity = entities[entityData.id];

            if (entity) {
                var lastFrame = entity.attrs.data.currentFrame;
                var currentFrame = entityData;
                //Interoplate from the current position for smoothness
                lastFrame.position.elements[0] = entity.getX();
                lastFrame.position.elements[1] = entity.getY();
                var spline = getSpline(lastFrame, currentFrame, 1 / frames);

                entity.attrs.data = {
                    lastFrame: lastFrame,
                    currentFrame: currentFrame,
                    spline: spline
                };
            } else {
                var img = new Image();
                var width = 50;
                var height = 50;

                switch (entityData.type) {
                    case 'player':
                        img.src = "/images/spaceship.png";
                        break;
                    case 'projectile':
                        img.src = "/images/projectile.png";
                        width = 8;
                        height = 8;
                        break;
                }

                entity = new Kinetic.Image({
                    x: entityData.position.elements[0],
                    y: entityData.position.elements[1],
                    rotation: entityData.orientation,
                    image: img,
                    width: width,
                    height: height,
                    data: {
                        lastFrame: entityData,
                        currentFrame: entityData,
                        spline: [
                            entityData.position.elements,
                            entityData.position.elements,
                            entityData.position.elements,
                            entityData.position.elements
                        ]
                    }
                });

                entity.setCenterOffset(width / 2, height / 2);
                entityLayer.add(entity);
                entities[entityData.id] = entity;
            }
        }

        for (var i = 0; i < removeEntities.length; i++) {
            var entityId = removeEntities[i];
            var entity = entities[entityId];
            entityLayer.remove(entity);
            delete entities[entityId];
        }
    });

    setInterval(draw, fps);
});
