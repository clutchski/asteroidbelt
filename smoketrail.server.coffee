"""
Smoketrail!
"""


express = require 'express'
socketio = require 'socket.io'


# Initialize the web server.
app = express.createServer()
app.use '/static', express.static(__dirname + '/static')
app.use express.logger()

# Initialize the socket server.
io = socketio.listen(app)


# Return the main page.
app.get '/', (req, res) ->
    html = """
        <html>
            <head>
                <title>Smoketrail</title>
                <style type="text/css">
                    body {
                        background-color: #222;
                    }

                </style>
            </head>
            <body>
                <canvas id="canvas" width="600" height="600"></canvas>

                <script src="/socket.io/socket.io.js"></script>
                <script src="/static/wolf.js"></script>

                <script src="/static/smoketrail.client.js"></script>
            </body>
        </html>
    """
    res.send(html)


class World

    constructor : () ->
        @planes = {}
        @colors = ['blue', 'green', 'yellow', 'black', 'red', 'orange', 'pink']
        @colorIndex = 0

    getColor : () ->
        @colorIndex = (@colorIndex + 1) % @colors.length
        return @colors[@colorIndex]


    createPlane : (id) ->
        console.log ("Creating plane #{id}")
        plane =
            id: id
            x: Math.round(Math.random() * 100)
            y: Math.round(Math.random() * 100)
            color: @getColor()
            speed: 0.1
            direction: [Math.random(), Math.random()]
        @planes[id] = plane
        return plane

    updatePlane: (data) ->
        @planes[data.id] = data

    removePlane : (id) ->
        delete @planes[id]

world = new World()

# Set-up the application logic.
io.sockets.on 'connection', (socket) ->

    # Create a plane for the user and let everybody else know.
    plane = world.createPlane(socket.id)
    socket.broadcast.emit('plane.added', plane)
    socket.emit('world.update', {planes:world.planes, playerId:plane.id})

    socket.on 'plane.update', (data) ->

        socket.broadcast.emit('plane.update', data)

    # Set-up a disconnct handler.
    socket.on 'disconnect', () ->
        world.removePlane socket.id
        socket.broadcast.emit('plane.removed', {id:socket.id})

# Run the server.
app.listen(8008)
