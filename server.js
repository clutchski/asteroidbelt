
/*
The asteroids server.
*/

(function() {
  var World, app, express, io, socketio, world;

  express = require('express');

  socketio = require('socket.io');

  app = express.createServer();

  app.use('/app', express.static(__dirname + '/app'));

  app.use(express.logger());

  io = socketio.listen(app);

  app.configure('development', function() {
    return app.use(express.errorHandler({
      dumpExceptions: true,
      showStack: true
    }));
  });

  app.configure('production', function() {
    app.use(express.errorHandler());
    io.set("transports", ["xhr-polling"]);
    return io.set("polling duration", 10);
  });

  app.get('/', function(req, res) {
    var html;
    html = "<html>\n    <head>\n        <title>Asteroids</title>\n        <style type=\"text/css\">\n            * {\n                margin:0;\n            }\n            body {\n                background-color: #222;\n            }\n        </style>\n    </head>\n    <body>\n        <canvas id=\"canvas\" width=\"800\" height=\"600\"></canvas>\n\n        <script src=\"/socket.io/socket.io.js\"></script>\n        <script src=\"/app/vendor/jquery-1.7.2.min.js\"></script>\n        <script src=\"/app/vendor/wolf.js\"></script>\n        <script src=\"/app/asteroids.js\"></script>\n    </body>\n</html>";
    return res.send(html);
  });

  World = (function() {

    function World() {
      this.planes = {};
      this.colors = ['blue', 'green', 'yellow', 'black', 'red', 'orange', 'pink'];
      this.colorIndex = 0;
    }

    World.prototype.getColor = function() {
      this.colorIndex = (this.colorIndex + 1) % this.colors.length;
      return this.colors[this.colorIndex];
    };

    World.prototype.createPlane = function(id) {
      var plane;
      console.log("Creating plane " + id);
      plane = {
        id: id,
        x: Math.random() * 500,
        y: Math.random() * 500,
        color: this.getColor(),
        speed: 0.1
      };
      this.planes[id] = plane;
      return plane;
    };

    World.prototype.updatePlane = function(data) {
      return this.planes[data.id] = data;
    };

    World.prototype.removePlane = function(id) {
      return delete this.planes[id];
    };

    World.prototype.serialize = function(id) {
      return {
        planes: this.planes,
        playerId: id
      };
    };

    return World;

  })();

  world = new World();

  io.sockets.on('connection', function(socket) {
    var plane;
    plane = world.createPlane(socket.id);
    socket.broadcast.emit('plane.added', plane);
    socket.emit('world.update', world.serialize(plane.id));
    socket.on('plane.update', function(data) {
      data.id = socket.id;
      world.updatePlane(data);
      return socket.broadcast.emit('plane.update', data);
    });
    socket.on('bullet.added', function(data) {
      return console.log("ADDED BULLET!");
    });
    return socket.on('disconnect', function() {
      world.removePlane(socket.id);
      return socket.broadcast.emit('plane.removed', {
        id: socket.id
      });
    });
  });

  app.listen(process.env.PORT || 3000);

  console.log("Listening on %d in %s mode", app.address().port, app.settings.env);

}).call(this);
