var Constants = {};

module.exports = Constants;

Constants.PLAYER_MAX_SPEED = 15;
Constants.PLAYER_FRICTION = 0.92;
Constants.INPUT_SCALE = 0.2;
Constants.X = 1;
Constants.Y = 2;
Constants.HALF_PI = Math.PI / 2;

Constants.SERVER_FPS = 50;
Constants.SERVER_PORT = process.env.PORT || 8899;
Constants.SERVER_UPDATE = 50;