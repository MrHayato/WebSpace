var express = require('express'),
    socketIO = require('socket.io'),
    Constants = require('./js/constants'),
    Server = require('./js/server');

var servers = {};

var app = express.createServer();
app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.static(__dirname + '/public'));
var io = socketIO.listen(app);

io.configure(function () {
    io.set("transports", ["xhr-polling"]);
    io.set("polling duration", 10);
    io.disable("log");
});

/* Endpoints for the Clients */
app.get('/join', function (req, res) {
    res.render('./client/register.jade', { layout: false });
});

app.post('/join', function (req, res) {
    var name = req.param('char-name');
    var serverId = req.param('servers');
    var server = servers[serverId];

    console.log("New player '" + name + "' joined the '" + server.name + "' server.");
    res.render('./client/controller.jade', { player: { name: name, server: serverId }, layout: false });
});

/* Endpoints for the Servers */
app.get('/servers', function (req, res) {
    var s = [];

    for (var id in servers) {
        s.push({ id: id, name: servers[id].name });
    };

    console.log(s);
    res.send(s);
});

app.post('/servers', function (req, res) {
    var serverId = parseInt(req.param('servers'));
    var serverName = req.param('server-name');
    var server = {};

    if (serverId === 0) {
        server.name = serverName;
        server.id = serverId;
    } else {
        server.name = servers[serverId].name;
        server.id = servers[serverId].id;
    }

    res.render('server/game.jade', { server: server, layout: false });
});

app.get('/', function (req, res) {
    res.render('server/servers.jade', { layout: false });
});

app.listen(Constants.SERVER_PORT);

/* Server Sockets */
var serverSockets = io
    .of('/server')
    .on('connection', function(socket) {
        socket.on('join', function(settings) {
            var serverId = parseInt(settings.id);
            if (serverId === 0) {
                var server = new Server(settings.name, settings.screenSize, socket);
                server.run();

                servers[server.id] = server;
                socket.emit('onJoin', { id: server.id, name: server.name });

                var numServers = Object.keys(servers).length;
                console.log('Server Created: Total # of servers: ' + numServers);
            } else {
                var server = servers[serverId];
                server.serverJoined(socket);
                socket.emit('onJoin', { id: server.id, name: server.name });
            }
        });
    });

///* Client Sockets */
var playerSockets = io
    .of('/client')
    .on('connection', function(socket) {
        socket.on('join', function(settings) {
            var server = servers[parseInt(settings.server)];
            server.playerJoined(settings.name, socket);

            console.log("Initialized player: " + settings.name + " (" + socket.id + ")");
        });
    });