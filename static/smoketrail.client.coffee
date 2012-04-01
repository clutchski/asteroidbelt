###
SmokeTrail

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
###


logger = new wolf.Logger('SmokeTrail')


# An abstract class that will fire game command events based
# on user input.
class InputDevice

    @THRUST    : 'thrust'
    @PORT      : 'post'
    @STARBOARD : 'starboard'
    @FIRE      : 'fire'

wolf.extend(InputDevice::, wolf.Events)

# A class to handle user keyboard input.
class Keyboard extends InputDevice

    constructor : () ->
        # A mapping of keys to game events.
        @events =
            38 : InputDevice.THRUST     # Up
            37 : InputDevice.PORT       # Left
            39 : InputDevice.STARBOARD  # Right
            83 : InputDevice.PORT       # Space

        # Listen for keypresses.
        @stop()
        $(document).bind 'keydown', (event) =>
            key = event.which or event.keyCode
            event = @events[key]
            @trigger(event) if event

    stop : () ->
        $(document).unbind('keydown')


class Engine extends wolf.Engine

    constructor : () ->
        super('canvas')
        @environment.gravitationalConstant = 0
        @planes = {}

    addPlane : (plane) ->
        logger.info("Adding plane #{plane.id}")
        @planes[plane.id] = plane
        @add(plane)
        return plane

    updatePlaneFromData : (data) ->
        plane = @planes[data.id]
        return if not plane?
        plane.x = data.x
        plane.y = data.y
        plane.speed = data.speed
        plane.direction = wolf.Vector.fromArray(data.direction)

    removePlane : (id) ->
        logger.info("Removing plane #{id}")
        plane = @planes[id]
        plane.destroy() if plane
        delete @planes[id]
        this

    addPlaneFromData : (data) ->
        plane = new Plane()
        plane.id = data.id
        plane.x = data.x
        plane.y = data.y
        plane.fillStyle = data.color
        plane.speed = data.speed
        plane.direction = wolf.Vector.fromArray(data.direction)
        @addPlane(plane)


class Plane extends wolf.Circle

    constructor : () ->
        opts =
            x: 50
            y: 50
            radius: 10
            speed: 0.01
            dragCoefficient: 0.5
            fillStyle: 'black'
            direction: new wolf.Vector(1, 0)
        super(opts)

    thrust : () ->
        impulse = @direction.scale(0.6)
        @applyImpulse(impulse)

    # Turn the ship to the starboard side.
    starboard : () ->
        @turn(-1)

    # Turn the ship to the port side.
    port : () ->
        @turn(1)

    # Turn the ship in the given direction.
    turn : (orientation) ->
        # HACK! Do rotational forces!
        magnitude = 20

        doTurn = () =>
            turn = 5
            if 0 < magnitude
                degrees = turn * orientation
                @rotate(degrees)
                @direction = @direction.rotate(degrees)
                setTimeout(doTurn, 40)
            magnitude -= turn

        doTurn()



# The controller performs co-ordination between the user, the engine
# and the network.
class Controller

    constructor : () ->
        @engine = new Engine()
        @inputDevice = new Keyboard()
        @socket = io.connect(window.location)
        @playerPlane = null

        # Initialize event handlers.
        @_initializeSocketHandlers()
        @_initializeUserInputHandlers()
        @_initializeUpdates()

    _initializeSocketHandlers : () ->
        logger.info("Initializing socket handlers")
        @socket.on 'world.update', (data) =>
            @engine.start() if not @engine.isRunning
            logger.info("Updating world")
            for id, planeData of data.planes
                plane = @engine.addPlaneFromData(planeData)
            @playerPlane = @engine.planes[data.playerId]

        @socket.on 'plane.added', (data) =>
            @engine.addPlaneFromData(data)

        @socket.on 'plane.update', (data) =>
            @engine.updatePlaneFromData(data)

        @socket.on 'plane.removed', (data) =>
            @engine.removePlane(data.id)

    _initializeUserInputHandlers : () ->
        logger.info("Initializing user input")

        @inputDevice.bind InputDevice.THRUST, =>
            @playerPlane.thrust()
            @_update()

        @inputDevice.bind InputDevice.PORT, =>
            @playerPlane.port()
            @_update()

        @inputDevice.bind InputDevice.STARBOARD, =>
            @playerPlane.starboard()
            @_update()

    _update : () ->
        return if not @playerPlane
        data =
            id: @playerPlane.id
            x: @playerPlane.x
            y: @playerPlane.y
            speed: @playerPlane.speed
            direction: [@playerPlane.direction.x, @playerPlane.direction.y]
            color: @playerPlane.fillStyle
        @socket.emit 'plane.update', data


# Start 'er up!
new Controller()
