"""
SmokeTrail.
"""


logger = new wolf.Logger('smoketrail')


class SmokeTrailEngine extends wolf.Engine

    constructor : () ->
        super('canvas')
        @environment.gravitationalConstant = 0


class Plane extends wolf.Circle

    constructor : () ->
        opts =
            x: 50
            y: 50
            radius: 10
            speed: 0.1
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

socket.on 'plane.added', (data) ->
    logger.info("Adding plane")
    plane = new Plane()
    plane.id = data.id
    plane.x = data.x
    plane.y = data.y
    plane.fillStyle = data.color
    plane.speed = data.speed
    plane.direction = wolf.Vector.fromArray(data.direction)
    engine.add(plane)


# Initialize the player's plane.
player = new Plane()
engine.add(player)

# Start 'er up!
engine.start()
