const app = require('express')()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const next = require('next')

const port = parseInt(process.env.PORT, 10) || 3000
const dev = process.env.NODE_ENV !== 'production'
const nextApp = next({ dev })
const nextHandler = nextApp.getRequestHandler()

io.on('connection', socket => {
  console.log('socket connected');

  // Keep track of the room for this connection
  let room;

  socket.on('disconnect', () => {
    console.log('socket disconnected');
  });

  socket.on('join', id => {
    // TODO: Leave room if this is already set
    room = id;
    socket.join(room, () => {
      console.log('join', room);

      socket.broadcast.to(room).emit('joined', { socketID: socket.id })
    });
  });

  socket.on('signal', signal => {
    console.log('signal', signal);
    // Capture destination socketID
    const id = signal.socketID;

    // Update socketID to sender
    signal.socketID = socket.id;

    socket.broadcast.to(id).emit('signal', signal);
  });
})

nextApp.prepare().then(() => {
  app.get('*', (req, res) => {
    return nextHandler(req, res)
  })

  server.listen(port, err => {
    if (err) throw err
    console.log(`> Server Ready on http://localhost:${port}`)
  })
})
