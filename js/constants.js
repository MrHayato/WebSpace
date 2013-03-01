var Constants = {};

module.exports = Constants;

Constants.PLAYER_MAX_VELOCITY = 15;
Constants.PLAYER_ACCELERATON = 0.7;
Constants.PLAYER_FRICTION = 0.15;
Constants.INPUT_SCALE = 0.2;
Constants.X = 1;
Constants.Y = 2;
Constants.HALF_PI = Math.PI / 2;

Constants.SERVER_FPS = 50;
Constants.SERVER_PORT = process.env.PORT || 8899;
Constants.SERVER_UPDATE_INTERVAL = 100;

Constants.TEAM_RED = "Red";
Constants.TEAM_BLUE = "Blue";