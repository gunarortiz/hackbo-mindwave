
const path = require('path');
const express = require('express');
const http = require('http');
const SocketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = SocketIo.listen(server);

// settings

// routes
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/user', (req, res) => {
  res.sendFile(__dirname + '/user.html');
});

// static files
app.use(express.static(path.join(__dirname, 'public')));

const SerialPort = require('serialport');
const Readline = SerialPort.parsers.Readline;
const parser = new Readline();

const mySerial = new SerialPort('COM3', {
  baudRate: 57600
});

mySerial.pipe(parser);

mySerial.on('open', function () {
  console.log('Opened Port.');
});

mySerial.on('data', function (data) {
  console.log(data.toString());

  if (data.substring(0, 1) == 'U' || data.substring(0, 1) == 'D' || data.substring(0, 1) == 'N') {
    io.emit('arduino:data', {
      value: data.toString()
    });
  }
  else {
    io.emit('arduino:barra', {
      value: data.toString().substring(2, data.toString().length - 1)
    });
  }

});

io.on('connection', function (socket) {
  socket.on('arduino:check', function (msg) {
    console.log('message: ' + msg);
    sendMessage(msg)
  });
});


/*mySerial.on('data', function (data) {
  console.log(data.toString());
  io.emit('arduino:barra', {
    value: data.toString()
  });
});*/


mySerial.on('err', function (data) {
  console.log(err.message);
});


server.listen(3000, () => {
  console.log('Server on port 3000');
});



function sendMessage(a) {
  mySerial.on('data', function (data) {
    io.emit('arduino:message', {
      value: a.toString()
    })
  }
  )
}