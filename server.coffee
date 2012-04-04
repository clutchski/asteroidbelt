###
The asteroids server.
###


express = require 'express'
socketio = require 'socket.io'


# Initialize the web server.
app = express.createServer()
app.use '/app', express.static(__dirname + '/app')
app.use express.logger()

app.configure 'development', () ->
    app.use(express.errorHandler({dumpExceptions: true, showStack: true}))

app.configure 'production', () ->
    app.use(express.errorHandler())


# Initialize the socket server.
io = socketio.listen(app)


# Return the main page.
app.get '/', (req, res) ->
    html = """
        <html>
            <head>
                <title>Asteroids</title>
                <style type="text/css">
                    * {
                        margin:0;
                    }
                    body {
                        background-color: #222;
                    }
                </style>
            </head>
            <body>
                <canvas id="canvas" width="800" height="600"></canvas>

                <script src="/socket.io/socket.io.js"></script>
                <script src="/app/vendor/jquery-1.7.2.min.js"></script>
                <script src="/app/vendor/wolf.js"></script>
                <script src="/app/asteroids.js"></script>
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
            x: Math.random() * 500  # FIXME: put a plane where no one will be.
            y: Math.random() * 500
            color: @getColor()
            speed: 0.1
        @planes[id] = plane
        return plane

    updatePlane: (data) ->
        @planes[data.id] = data

    removePlane : (id) ->
        delete @planes[id]

    # Serialize the world from the given player's perspective.
    serialize : (id) ->
        return {
            planes : @planes
            playerId: id
        }

world = new World()

# Set-up the application logic.
io.sockets.on 'connection', (socket) ->

    # Create a plane for the user and let everybody else know.
    plane = world.createPlane(socket.id)
    socket.broadcast.emit('plane.added', plane)
    socket.emit('world.update', world.serialize(plane.id))

    socket.on 'plane.update', (data) ->
        data.id = socket.id
        world.updatePlane(data)
        socket.broadcast.emit('plane.update', data)

    socket.on 'bullet.added', (data) ->
        console.log "ADDED BULLET!"

    # Set-up a disconnct handler.
    socket.on 'disconnect', () ->
        world.removePlane socket.id
        socket.broadcast.emit('plane.removed', {id:socket.id})

# Run the server.
app.listen(process.env.PORT || 3000)
console.log "Listening on %d in %s mode", app.address().port, app.settings.env
