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


# The engine that controls and renders the world.
class SmokeTrailEngine extends wolf.Engine

    constructor : () ->
        super('canvas')
        @environment.gravitationalConstant = 0
        @player = null
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
            dragCoefficient:0
            fillStyle: 'black'
            direction: new wolf.Vector(1, 0)
        super(opts)


# Create the engine.
engine = new SmokeTrailEngine()

# Initialize the socket connection.
socket = io.connect(window.location)
if not socket
    alert "Couldn't make websocket connection!"
    return

#
# Set-up network behaviours.
#

socket.on 'world.update', (data) ->
    logger.info("Updating world")
    for id, planeData of data.planes
        plane = engine.addPlaneFromData(planeData)
        if data.playerId == plane.id
            engine.player = plane
            setInterval((->
                data =
                    id: plane.id
                    x: plane.x
                    y: plane.y
                    speed: plane.speed
                    direction: [plane.direction.x, plane.direction.y]
                socket.emit 'plane.update', data
            ), 200)

socket.on 'plane.added', (data) ->
    engine.addPlaneFromData(data)

socket.on 'plane.update', (data) ->
    engine.updatePlaneFromData(data)

socket.on 'plane.removed', (data) ->
    engine.removePlane(data.id)

# Start 'er up!
engine.start()
