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
            <head>Smoketrail</head>
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

    createPlane : (id) ->
        console.log ("Creating plane #{id}")
        plane =
            id: id
            x: Math.round(Math.random() * 100)
            y: Math.round(Math.random() * 100)
            color: 'blue'
            speed: Math.random()
            direction: [Math.random(), Math.random()]
        @planes[id] = plane
        return plane

world = new World()

# Set-up the application logic.
io.sockets.on 'connection', (socket) ->
    plane = world.createPlane(socket.id)
    socket.broadcast.emit('plane.added', plane)


# Run the server.
app.listen(8008)
