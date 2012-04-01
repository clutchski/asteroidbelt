"""
SmokeTrail.
"""


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
