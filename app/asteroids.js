
/*
A clone of the famous asteroids game.

Copyright (C) 2011 Matthew Perpick

The JavaScript code in this page is free software: you can
redistribute it and/or modify it under the terms of the GNU
General Public License (GNU GPL) as published by the Free Software
Foundation, either version 3 of the License, or (at your option)
any later version.  The code is distributed WITHOUT ANY WARRANTY;
without even the implied warranty of MERCHANTABILITY or FITNESS
FOR A PARTICULAR PURPOSE.  See the GNU GPL for more details.

As additional permission under GNU GPL version 3 section 7, you
may distribute non-source (e.g., minimized or compacted) forms of
that code without the copy of the GNU GPL normally required by
section 4, provided you include this license notice and a URL
through which recipients can access the Corresponding Source.
*/

(function() {
  var Bullet, Controller, Engine, InputDevice, Keyboard, Plane, logger,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  logger = new wolf.Logger('asteroids');

  InputDevice = (function() {

    function InputDevice() {}

    InputDevice.THRUST = 'thrust';

    InputDevice.PORT = 'post';

    InputDevice.STARBOARD = 'starboard';

    InputDevice.FIRE = 'fire';

    return InputDevice;

  })();

  wolf.extend(InputDevice.prototype, wolf.Events);

  Keyboard = (function(_super) {

    __extends(Keyboard, _super);

    function Keyboard() {
      var _this = this;
      this.events = {
        38: InputDevice.THRUST,
        37: InputDevice.PORT,
        39: InputDevice.STARBOARD,
        32: InputDevice.FIRE
      };
      this.stop();
      $(document).bind('keydown', function(event) {
        var key;
        key = event.which || event.keyCode;
        event = _this.events[key];
        logger.debug("Pressed " + key);
        if (event) return _this.trigger(event);
      });
    }

    Keyboard.prototype.stop = function() {
      return $(document).unbind('keydown');
    };

    return Keyboard;

  })(InputDevice);

  Engine = (function(_super) {

    __extends(Engine, _super);

    function Engine() {
      Engine.__super__.constructor.call(this, 'canvas');
      this.environment.gravitationalConstant = 0;
      this.planes = {};
    }

    Engine.prototype.addPlane = function(plane) {
      logger.info("Adding plane " + plane.id);
      this.planes[plane.id] = plane;
      this.add(plane);
      return plane;
    };

    Engine.prototype.updatePlaneFromData = function(data) {
      var plane;
      plane = this.planes[data.id];
      if (!(plane != null)) return;
      plane.x = data.x;
      plane.y = data.y;
      plane.speed = data.speed;
      plane.direction = wolf.Vector.fromArray(data.direction);
      return plane.angle = data.angle;
    };

    Engine.prototype.removePlane = function(id) {
      var plane;
      logger.info("Removing plane " + id);
      plane = this.planes[id];
      if (plane) plane.destroy();
      delete this.planes[id];
      return this;
    };

    Engine.prototype.addPlaneFromData = function(data) {
      var plane;
      plane = new Plane();
      plane.id = data.id;
      plane.x = data.x;
      plane.y = data.y;
      plane.fillStyle = data.color;
      plane.speed = data.speed;
      return this.addPlane(plane);
    };

    return Engine;

  })(wolf.Engine);

  Plane = (function(_super) {

    __extends(Plane, _super);

    function Plane() {
      var a, b, opts, shape;
      shape = [[10, 0], [0, -30], [-10, 0]];
      opts = {
        vertices: (function() {
          var _i, _len, _ref, _results;
          _results = [];
          for (_i = 0, _len = shape.length; _i < _len; _i++) {
            _ref = shape[_i], a = _ref[0], b = _ref[1];
            _results.push(new wolf.Point(a, b));
          }
          return _results;
        })(),
        x: 50,
        y: 50,
        speed: 0.01,
        dragCoefficient: 0.5,
        fillStyle: 'black',
        direction: new wolf.Vector(0, -1),
        angle: 0
      };
      Plane.__super__.constructor.call(this, opts);
    }

    Plane.prototype.thrust = function() {
      var impulse;
      impulse = this.direction.scale(0.6);
      this.applyImpulse(impulse);
      return this.trigger('change');
    };

    Plane.prototype.starboard = function() {
      return this.turn(1);
    };

    Plane.prototype.port = function() {
      return this.turn(-1);
    };

    Plane.prototype.turn = function(orientation) {
      var doTurn, magnitude,
        _this = this;
      magnitude = 20;
      doTurn = function() {
        var degrees, turn;
        turn = 5;
        if (0 < magnitude) {
          degrees = turn * orientation;
          _this.rotate(degrees);
          _this.direction = _this.direction.rotate(degrees);
          setTimeout(doTurn, 40);
        }
        magnitude -= turn;
        return _this.trigger('change');
      };
      return doTurn();
    };

    Plane.prototype.fire = function() {
      var opts, position;
      position = this.direction.add(this.getCenter().add(new wolf.Point(10, 50)));
      opts = {
        x: position.x,
        y: position.y,
        direction: this.direction.copy()
      };
      return new Bullet(opts);
    };

    Plane.prototype.serialize = function() {
      return {
        x: this.x,
        y: this.y,
        id: this.id,
        radius: this.radius,
        speed: this.speed,
        fillStyle: this.fillStyle,
        direction: this.direction.toArray(),
        angle: this.angle
      };
    };

    return Plane;

  })(wolf.Polygon);

  Bullet = (function(_super) {

    __extends(Bullet, _super);

    function Bullet(opts) {
      if (opts == null) opts = {};
      opts.radius = 3;
      opts.speed = 1.5;
      opts.dragCoefficient = 0;
      opts.fillStyle = "white";
      Bullet.__super__.constructor.call(this, opts);
    }

    Bullet.prototype.serialize = function() {
      return {
        x: this.x,
        y: this.y,
        id: this.id,
        radius: this.radius,
        speed: this.speed,
        fillStyle: this.fillStyle,
        direction: this.direction.toArray()
      };
    };

    return Bullet;

  })(wolf.Circle);

  Controller = (function() {

    function Controller() {
      this.engine = new Engine();
      this.inputDevice = new Keyboard();
      this.socket = io.connect(window.location);
      this.playerPlane = null;
      this._initializeSocketHandlers();
      this._initializeUserInputHandlers();
    }

    Controller.prototype._initializeSocketHandlers = function() {
      var _this = this;
      logger.info("Initializing socket handlers");
      this.socket.on('world.update', function(data) {
        var id, plane, planeData, _ref;
        if (!_this.engine.isRunning) _this.engine.start();
        logger.info("Updating world");
        _ref = data.planes;
        for (id in _ref) {
          planeData = _ref[id];
          plane = _this.engine.addPlaneFromData(planeData);
          console.log(plane.getCenter());
        }
        _this.playerPlane = _this.engine.planes[data.playerId];
        return _this.playerPlane.bind('change', function() {
          return _this._update();
        });
      });
      this.socket.on('plane.added', function(data) {
        return _this.engine.addPlaneFromData(data);
      });
      this.socket.on('plane.update', function(data) {
        return _this.engine.updatePlaneFromData(data);
      });
      return this.socket.on('plane.removed', function(data) {
        return _this.engine.removePlane(data.id);
      });
    };

    Controller.prototype._initializeUserInputHandlers = function() {
      var _this = this;
      logger.info("Initializing user input");
      this.inputDevice.bind(InputDevice.THRUST, function() {
        return _this.playerPlane.thrust();
      });
      this.inputDevice.bind(InputDevice.PORT, function() {
        return _this.playerPlane.port();
      });
      this.inputDevice.bind(InputDevice.STARBOARD, function() {
        return _this.playerPlane.starboard();
      });
      return this.inputDevice.bind(InputDevice.FIRE, function() {
        var bullet;
        bullet = _this.playerPlane.fire();
        _this.engine.add(bullet);
        return _this.socket.emit('bullet.added', bullet);
      });
    };

    Controller.prototype._update = function() {
      if (!this.playerPlane) return;
      return this.socket.emit('plane.update', this.playerPlane.serialize());
    };

    return Controller;

  })();

  $(document).ready(function() {
    var $window, canvas, resizeCanvas;
    canvas = document.getElementById('canvas');
    $window = $(window);
    resizeCanvas = function() {
      canvas.width = $window.width();
      return canvas.height = $window.height();
    };
    resizeCanvas();
    $(window).bind("resize", resizeCanvas);
    return new Controller();
  });

}).call(this);
