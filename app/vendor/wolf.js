
  /*
  Wolf - An HTML5 Canvas game engine.
  
  Copyright (c) 2011 Matthew Perpick.
  Wolf is freely distributable under the MIT license.
  
  https://github.com/clutchski/wolf
  */


;
(function() {
  var wolf;
  var __slice = Array.prototype.slice;

  wolf = {};

  this.wolf = wolf;

  wolf.VERSION = "0.0.0";

  wolf.extend = function() {
    var destination, k, source, sources, v, _i, _len;
    destination = arguments[0], sources = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
    for (_i = 0, _len = sources.length; _i < _len; _i++) {
      source = sources[_i];
      for (k in source) {
        v = source[k];
        destination[k] = v;
      }
    }
    return destination;
  };

  wolf.getUniqueId = (function() {
    var id;
    id = 0;
    return function(prefix) {
      if (prefix == null) prefix = "";
      id += 1;
      return prefix + id;
    };
  })();

  wolf.defaults = function(options, defaults) {
    return wolf.extend({}, defaults, options);
  };

}).call(this);

  wolf.Canvas = (function() {

    function Canvas(id) {
      this.id = id;
      this.canvas = document.getElementById(this.id);
      if (!this.canvas) throw new Error("No element with id: " + id);
      this.context = this.canvas.getContext("2d");
      if (!this.context) throw new Error("no context");
    }

    Canvas.prototype.render = function(elements) {
      var c, e, _i, _len;
      c = this.context;
      for (_i = 0, _len = elements.length; _i < _len; _i++) {
        e = elements[_i];
        c.save();
        e.render(c);
        c.restore();
      }
      return this;
    };

    Canvas.prototype.clear = function() {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
      return this;
    };

    return Canvas;

  })();

  wolf.Logger = (function() {

    function Logger(module) {
      this.module = module;
    }

    Logger.prototype.debug = function(message) {
      return this.log("DEBUG", message);
    };

    Logger.prototype.info = function(message) {
      return this.log("INFO", message);
    };

    Logger.prototype.log = function(level, message) {
      var fields;
      if (console) {
        fields = [level, this.module, message];
        console.log(fields.join(" | "));
      }
      return this;
    };

    return Logger;

  })();
(function() {
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  wolf.random = function(lower, upper) {
    return Math.random() * (upper - lower + 1) + lower;
  };

  wolf.randomElement = function(array) {
    var i;
    i = Math.floor(Math.random() * array.length);
    return array[i];
  };

  wolf.almostEqual = function(n1, n2, epsilon) {
    return n1 - n2 < epsilon;
  };

  wolf.intervalIntersects = function(i1, i2) {
    var i10, i11, i20, i21;
    i10 = i1[0], i11 = i1[1];
    i20 = i2[0], i21 = i2[1];
    return (i10 <= i20 && i20 <= i11) || (i10 <= i21 && i21 <= i11) || (i20 <= i10 && i10 <= i21) || (i20 <= i11 && i11 <= i21);
  };

  wolf.Point = (function() {

    function Point(x, y) {
      this.x = x;
      this.y = y;
    }

    Point.prototype.copy = function() {
      return new wolf.Point(this.x, this.y);
    };

    Point.prototype.equals = function(other) {
      return this.x === other.x && this.y === other.y;
    };

    Point.prototype.add = function(point) {
      return new wolf.Point(this.x + point.x, this.y + point.y);
    };

    Point.prototype.subtract = function(other) {
      return new wolf.Point(this.x - other.x, this.y - other.y);
    };

    Point.prototype.isOrigin = function() {
      return this.x === 0 && this.y === 0;
    };

    Point.prototype.toVector = function() {
      return new wolf.Vector(this.x, this.y);
    };

    Point.prototype.toString = function() {
      return "wolf.Point(" + this.x + ", " + this.y + ")";
    };

    return Point;

  })();

  wolf.Vector = (function() {

    __extends(Vector, wolf.Point);

    function Vector() {
      Vector.__super__.constructor.apply(this, arguments);
    }

    Vector.prototype.normalize = function() {
      var length;
      if (this.isZeroVector()) return this.copy();
      length = this.getLength();
      return new wolf.Vector(this.x / length, this.y / length);
    };

    Vector.prototype.isZeroVector = function() {
      return this.x === 0 && this.y === 0;
    };

    Vector.prototype.copy = function() {
      return new wolf.Vector(this.x, this.y);
    };

    Vector.prototype.scale = function(scalar) {
      return new wolf.Vector(this.x * scalar, this.y * scalar);
    };

    Vector.prototype.getLength = function() {
      return Math.sqrt(this.x * this.x + this.y * this.y);
    };

    Vector.prototype.add = function(other) {
      return new wolf.Vector(this.x + other.x, this.y + other.y);
    };

    Vector.prototype.subtract = function(other) {
      return new wolf.Vector(this.x - other.x, this.y - other.y);
    };

    Vector.prototype.dotProduct = function(other) {
      var pairs;
      pairs = [[this.x, other.x], [this.y, other.y]];
      return pairs.reduce(function(sum, coords) {
        return sum + coords[0] * coords[1];
      }, 0);
    };

    Vector.prototype.project = function(other) {
      var b;
      b = other.normalize();
      return b.scale(this.dotProduct(b));
    };

    Vector.prototype.rotate = function(degrees) {
      var cosr, r, sinr;
      r = degrees * Math.PI / 180;
      cosr = Math.cos(r);
      sinr = Math.sin(r);
      return new wolf.Vector(this.x * cosr - this.y * sinr, this.x * sinr + this.y * cosr);
    };

    Vector.prototype.angle = function(other) {
      var ct;
      ct = this.normalize().dotProduct(other.normalize());
      return Math.acos(ct);
    };

    Vector.prototype.getRotation = function() {
      var angle;
      angle = this.angle(new wolf.Vector(1, 0));
      if (this.y < 0) {
        return Math.PI * 2 - angle;
      } else {
        return angle;
      }
    };

    Vector.prototype.getEndPoint = function() {
      return new wolf.Point(this.x, this.y);
    };

    Vector.prototype.toString = function() {
      return "wolf.Vector(" + this.x + ", " + this.y + ")";
    };

    Vector.prototype.toArray = function() {
      return [this.x, this.y];
    };

    return Vector;

  })();

  wolf.Vector.fromArray = function(arr) {
    return new wolf.Vector(arr[0], arr[1]);
  };

}).call(this);

  wolf.Collision = (function() {

    function Collision(element1, element2) {
      this.element1 = element1;
      this.element2 = element2;
      this.resolved = false;
    }

    Collision.prototype.getElements = function() {
      return [this.element1, this.element2];
    };

    Collision.prototype.getContactNormal = function() {
      if (this.element2.isStatic()) {
        return this.element1.direction;
      } else {
        return this.getRelativeVelocity().normalize();
      }
    };

    Collision.prototype.getSeperatingVelocity = function() {
      return this.getRelativeVelocity().dotProduct(this.getContactNormal());
    };

    Collision.prototype.getRelativeVelocity = function() {
      return this.element1.getVelocity().subtract(this.element2.getVelocity());
    };

    Collision.prototype.getRestitutionCoefficient = function() {
      return this.element1.restitution * this.element2.restitution;
    };

    Collision.prototype.getMass = function() {
      return this.getElements().reduce(function(mass, e) {
        if (!e.isStatic()) mass += e.mass;
        return mass;
      }, 0);
    };

    Collision.prototype.applyForces = function() {
      var impulse, impulse1, impulse2, magnitude, seperatingVelocity, velocity;
      seperatingVelocity = this.getSeperatingVelocity();
      if (0 > seperatingVelocity) return;
      velocity = -seperatingVelocity * this.getRestitutionCoefficient();
      magnitude = velocity * this.getMass();
      impulse = this.getContactNormal().scale(magnitude);
      impulse1 = impulse.scale(this.element1.getInverseMass());
      this.element1.setVelocity(impulse1);
      if (!this.element2.isStatic()) {
        impulse2 = impulse.scale(-1 * this.element2.getInverseMass());
        return this.element2.setVelocity(impulse2);
      }
    };

    Collision.prototype.resolve = function() {
      return this.resolved = true;
    };

    Collision.prototype.isResolved = function() {
      return this.resolved;
    };

    return Collision;

  })();

  wolf.CollisionHandler = (function() {

    function CollisionHandler() {}

    CollisionHandler.prototype.elapse = function(elements, milliseconds) {
      var c, collisions, _i, _len, _results;
      collisions = this.detectCollisions(elements);
      _results = [];
      for (_i = 0, _len = collisions.length; _i < _len; _i++) {
        c = collisions[_i];
        _results.push(this.resolveCollision(c));
      }
      return _results;
    };

    CollisionHandler.prototype.detectCollisions = function(elements) {
      var c, collisions, element, i, other, _i, _len, _len2, _ref;
      collisions = [];
      for (i = 0, _len = elements.length; i < _len; i++) {
        element = elements[i];
        _ref = elements.slice(i + 1, elements.length + 1 || 9e9);
        for (_i = 0, _len2 = _ref.length; _i < _len2; _i++) {
          other = _ref[_i];
          c = this.detectCollision(element, other);
          if (c) collisions.push(c);
        }
      }
      return collisions;
    };

    CollisionHandler.prototype.detectCollision = function(e1, e2) {
      var first, second, _ref;
      if ((e1.isStatic() && e2.isStatic()) || !e1.intersects(e2)) return null;
      _ref = e1.isStatic() ? [e2, e1] : [e1, e2], first = _ref[0], second = _ref[1];
      return new wolf.Collision(first, second);
    };

    CollisionHandler.prototype.resolveCollision = function(collision) {
      var e1, e2;
      e1 = collision.element1;
      e2 = collision.element2;
      e1.trigger('collided', collision, e2);
      e2.trigger('collided', collision, e1);
      if (!collision.isResolved()) return collision.applyForces();
    };

    return CollisionHandler;

  })();

  wolf.Events = {
    bind: function(event, callback) {
      var _base, _ref, _ref2;
      if ((_ref = this._callbacks) == null) this._callbacks = {};
      if ((_ref2 = (_base = this._callbacks)[event]) == null) _base[event] = [];
      this._callbacks[event].push(callback);
      return this;
    },
    unbind: function(event, callback) {
      var c, callbacks, i, _len, _ref;
      if (event == null) event = null;
      if (callback == null) callback = null;
      if ((_ref = this._callbacks) == null) this._callbacks = {};
      if (!(event != null)) {
        this._callbacks = {};
      } else if (!(callback != null)) {
        this._callbacks[event] = [];
      } else {
        callbacks = this._callbacks[event] || [];
        for (i = 0, _len = callbacks.length; i < _len; i++) {
          c = callbacks[i];
          if (c === callback) callbacks[i] = null;
        }
      }
      return this;
    },
    trigger: function(event) {
      var args, c, callbacks, _i, _len, _ref;
      callbacks = ((_ref = this._callbacks) != null ? _ref[event] : void 0) || [];
      args = Array.prototype.slice.call(arguments, 1);
      for (_i = 0, _len = callbacks.length; _i < _len; _i++) {
        c = callbacks[_i];
        if (c != null) c.apply(this, args);
      }
      return this;
    }
  };
(function() {
  var __slice = Array.prototype.slice;

  wolf.Element = (function() {

    function Element(opts) {
      var defaults, k, v, _ref;
      if (opts == null) opts = {};
      defaults = {
        x: 0,
        y: 0,
        speed: 0,
        mass: 1000,
        direction: new wolf.Vector(0, 0),
        dragCoefficient: 0.7,
        restitution: 0.5,
        static: false,
        angle: 0
      };
      _ref = wolf.defaults(opts, defaults);
      for (k in _ref) {
        v = _ref[k];
        this[k] = v;
      }
      this.forces = [];
    }

    Element.prototype.getPosition = function() {
      return new wolf.Point(this.x, this.y);
    };

    Element.prototype.setPosition = function(point) {
      this.x = point.x;
      this.y = point.y;
      return this;
    };

    Element.prototype.getVelocity = function() {
      return this.direction.normalize().scale(this.speed);
    };

    Element.prototype.setVelocity = function(velocity) {
      this.speed = velocity.getLength();
      if (!velocity.isZeroVector()) return this.direction = velocity.normalize();
    };

    Element.prototype.applyImpulse = function(impulse) {
      var velocity;
      if (this.isStatic()) return this;
      velocity = this.getVelocity().add(impulse);
      this.setVelocity(velocity);
      return this;
    };

    Element.prototype.applyForce = function(force, milliseconds) {
      var acceleration, displacement, position, velocity;
      if (this.isStatic()) return this;
      acceleration = force.scale(this.getInverseMass());
      velocity = this.getVelocity().add(acceleration.scale(milliseconds));
      displacement = velocity.scale(milliseconds);
      position = this.getPosition().add(displacement);
      this.setPosition(position);
      this.setVelocity(velocity);
      return this;
    };

    Element.prototype.addForces = function() {
      var f, forces, _i, _len;
      forces = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      for (_i = 0, _len = forces.length; _i < _len; _i++) {
        f = forces[_i];
        this.forces.push(f);
      }
      return this;
    };

    Element.prototype.elapse = function(milliseconds, iteration) {
      var resultant;
      resultant = this.forces.reduce(function(t, s) {
        return t.add(s);
      });
      this.applyForce(resultant, milliseconds);
      this.forces = [];
      return this;
    };

    Element.prototype.intersects = function(other) {
      var ii, ox, oy, tx, ty, _ref, _ref2;
      _ref = this.getAxisProjections(), tx = _ref[0], ty = _ref[1];
      _ref2 = other.getAxisProjections(), ox = _ref2[0], oy = _ref2[1];
      ii = wolf.intervalIntersects;
      return ii(ty, oy) && ii(ox, tx);
    };

    Element.prototype.getAxisProjections = function() {
      var bb, first, maxx, maxy, minx, miny, p, _i, _len, _ref;
      bb = this.getBoundingBox();
      first = bb[0];
      maxx = minx = first.x;
      maxy = miny = first.y;
      _ref = bb.slice(1, bb.length + 1 || 9e9);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        p = _ref[_i];
        maxx = Math.max(maxx, p.x);
        minx = Math.min(minx, p.x);
        maxy = Math.max(maxy, p.y);
        miny = Math.min(miny, p.y);
      }
      return [[minx, maxx], [miny, maxy]];
    };

    Element.prototype.getInverseMass = function() {
      return 1 / this.mass;
    };

    Element.prototype.destroy = function() {
      this.trigger('destroyed', this);
      this.unbind();
      return this;
    };

    Element.prototype.isStatic = function() {
      return this.static;
    };

    Element.prototype.rotate = function(degrees) {
      this.angle = (this.angle + degrees) % 360;
      return this;
    };

    Element.prototype.render = function(context) {
      throw new Error("Not Implemented error");
    };

    Element.prototype.getCenter = function(context) {
      throw new Error("Not Implemented error");
    };

    Element.prototype.getBoundingBox = function() {
      throw new Error("Not Implemented error");
    };

    return Element;

  })();

  wolf.extend(wolf.Element.prototype, wolf.Events);

}).call(this);

  wolf.Environment = (function() {

    function Environment(opts) {
      var defaults, k, v, _ref;
      defaults = {
        density: 10,
        gravitationalConstant: 3,
        width: 800,
        height: 600
      };
      _ref = wolf.defaults(opts, defaults);
      for (k in _ref) {
        v = _ref[k];
        this[k] = v;
      }
    }

    Environment.prototype.contains = function(element) {
      var _ref, _ref2;
      return (0 <= (_ref = element.x) && _ref <= this.width) && (0 <= (_ref2 = element.y) && _ref2 <= this.height);
    };

    Environment.prototype.elapse = function(elements, milliseconds) {
      var e, _i, _len;
      for (_i = 0, _len = elements.length; _i < _len; _i++) {
        e = elements[_i];
        if (e) this.elapseElement(e, milliseconds);
      }
      return this;
    };

    Environment.prototype.elapseElement = function(element, milliseconds) {
      var drag, gravity;
      drag = this.getDragForce(element);
      gravity = this.getGravitationalForce();
      element.addForces(drag, gravity);
      return element.elapse(milliseconds);
    };

    Environment.prototype.getDragForce = function(element) {
      var m, s;
      s = element.speed;
      s = s > 1 ? s * s : s;
      m = 0.5 * this.density * s * element.dragCoefficient;
      return element.direction.scale(-m);
    };

    Environment.prototype.getGravitationalForce = function(element) {
      return new wolf.Vector(0, this.gravitationalConstant);
    };

    return Environment;

  })();
(function() {
  var __slice = Array.prototype.slice;

  wolf.Engine = (function() {

    function Engine(canvasId) {
      this.logger = new wolf.Logger("wolf.Engine");
      this.canvas = new wolf.Canvas(canvasId);
      this.environment = new wolf.Environment();
      this.collisionHandler = new wolf.CollisionHandler();
      this.elements = [];
      this.timestamp = null;
      this.isRunning = false;
      this.interval = 5;
      this.iteration = 0;
    }

    Engine.prototype.start = function() {
      this.logger.info("Starting engine.");
      this.isRunning = true;
      this.timestamp = new Date();
      this.step();
      return this;
    };

    Engine.prototype.stop = function() {
      this.logger.info("Stopping engine.");
      this.isRunning = false;
      this.timestamp = null;
      return this;
    };

    Engine.prototype.toggle = function() {
      if (this.isRunning) {
        this.stop();
      } else {
        this.start();
      }
      return this;
    };

    Engine.prototype.add = function() {
      var element, elements, _i, _len;
      var _this = this;
      elements = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      for (_i = 0, _len = elements.length; _i < _len; _i++) {
        element = elements[_i];
        this.elements.push(element);
        element.bind('destroyed', function(e) {
          return _this.remove(e);
        });
      }
      return this;
    };

    Engine.prototype.remove = function() {
      var element, elements, index, _i, _len;
      elements = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      for (_i = 0, _len = elements.length; _i < _len; _i++) {
        element = elements[_i];
        index = this.elements.indexOf(element);
        if (index >= 0) this.elements.splice(index, 1);
      }
      return this;
    };

    Engine.prototype.step = function() {
      var elapsed, now;
      var _this = this;
      if (!this.isRunning) return;
      now = new Date();
      elapsed = now - this.timestamp;
      this.collisionHandler.elapse(this.elements, elapsed);
      this.environment.elapse(this.elements, elapsed);
      this.canvas.clear().render(this.elements);
      this.iteration += 1;
      this.timestamp = now;
      return setTimeout(function() {
        return _this.step();
      }, this.interval);
    };

    Engine.prototype.destroy = function() {
      var e, _i, _len, _ref;
      this.stop();
      this.canvas.clear();
      _ref = this.elements;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        e = _ref[_i];
        if (e) e.destroy();
      }
      return this.elements = [];
    };

    Engine.prototype.logStatusReport = function() {
      var m, messages, _i, _len;
      messages = ["Status Report", "Is running: " + this.isRunning, "Iteration: " + this.iteration, "Num Elements: " + this.elements.length];
      for (_i = 0, _len = messages.length; _i < _len; _i++) {
        m = messages[_i];
        this.logger.info(m);
      }
      return this;
    };

    return Engine;

  })();

}).call(this);
(function() {
  var __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; }, __slice = Array.prototype.slice;

  wolf.Polygon = (function() {

    __extends(Polygon, wolf.Element);

    function Polygon(opts) {
      var defaults;
      if (opts == null) opts = {};
      defaults = {
        fillStyle: "#000",
        vertices: []
      };
      Polygon.__super__.constructor.call(this, wolf.defaults(opts, defaults));
    }

    Polygon.prototype.render = function(context) {
      var first, rest, v, _i, _len, _ref;
      context.fillStyle = this.fillStyle;
      _ref = this.getAbsoluteVertices(), first = _ref[0], rest = 2 <= _ref.length ? __slice.call(_ref, 1) : [];
      context.beginPath();
      context.moveTo(first.x, first.y);
      for (_i = 0, _len = rest.length; _i < _len; _i++) {
        v = rest[_i];
        context.lineTo(v.x, v.y);
      }
      context.lineTo(first.x, first.y);
      context.fill();
      return this;
    };

    Polygon.prototype.setVertices = function(vertices) {
      this.vertices = vertices;
      return this;
    };

    Polygon.prototype.getVertices = function() {
      return this.vertices;
    };

    Polygon.prototype.getAbsoluteVertices = function() {
      var position, v, _i, _len, _ref, _results;
      position = this.getPosition();
      _ref = this.vertices;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        v = _ref[_i];
        _results.push(v.toVector().rotate(this.angle).getEndPoint().add(position));
      }
      return _results;
    };

    Polygon.prototype.getCenter = function() {
      var c;
      c = this.getAbsoluteVertices().reduce(function(p, v) {
        return p.add(v);
      }, new wolf.Point(0, 0));
      c.x = c.x / this.vertices.length;
      c.y = c.y / this.vertices.length;
      return c;
    };

    Polygon.prototype.getBoundingBox = function() {
      return this.getAbsoluteVertices();
    };

    return Polygon;

  })();

  wolf.Rectangle = (function() {

    __extends(Rectangle, wolf.Polygon);

    function Rectangle(opts) {
      var halfHeight, halfWidth;
      if (opts == null) opts = {};
      this.height = opts.height;
      this.width = opts.width;
      this.x = opts.x;
      this.y = opts.y;
      halfWidth = this.width / 2;
      halfHeight = this.height / 2;
      opts.vertices = [new wolf.Point(-halfWidth, halfHeight), new wolf.Point(halfWidth, halfHeight), new wolf.Point(halfWidth, -halfHeight), new wolf.Point(-halfWidth, -halfHeight)];
      Rectangle.__super__.constructor.call(this, opts);
    }

    return Rectangle;

  })();

  wolf.Circle = (function() {

    __extends(Circle, wolf.Element);

    function Circle(opts) {
      var defaults;
      defaults = {
        fillStyle: "#000"
      };
      Circle.__super__.constructor.call(this, opts);
      this.radius = opts.radius;
    }

    Circle.prototype.render = function(context) {
      context.beginPath();
      context.fillStyle = this.fillStyle;
      context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      return context.fill();
    };

    Circle.prototype.getBoundingBox = function() {
      var xl, xr, yb, yt;
      yt = this.y - this.radius;
      yb = this.y + this.radius;
      xl = this.x - this.radius;
      xr = this.x + this.radius;
      return [new wolf.Point(xl, yt), new wolf.Point(xr, yt), new wolf.Point(xr, yb), new wolf.Point(xl, yb)];
    };

    return Circle;

  })();

}).call(this);
