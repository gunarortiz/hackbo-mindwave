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

const mySerial = new SerialPort('COM80', {
  baudRate: 57600
});

mySerial.pipe(parser);

mySerial.on('open', function () {
  console.log('Opened Port.');
});

mySerial.on('data', function (data) {
  console.log(data.toString().substring(data.toString().length - 3, data.toString().length - 2));

  var letra = data.toString().substring(data.toString().length - 3, data.toString().length - 2);
  if (letra == 'u' || letra == 'd' || letra == 'n') {
    io.emit('arduino:data', {
      value: letra
    });
    io.emit('arduino:barra', {
      value: parseInt(data.toString())
    });
  }

});

io.on('connection', function (socket) {
  socket.on('arduino:check', function (msg) {
    console.log('message: ' + msg);
    sendMessage(msg)
  });

  socket.on('arduino:chat', function (msg) {
    console.log('message: ' + msg);
    io.emit('arduino:chat-response', msg);
  });
});


mySerial.on('err', function (data) {
  console.log(err.message);
});


server.listen(3000, () => {
  console.log('Server on port 3000');
});



function sendMessage(a) {
  var message = "";
  if (parseInt(a) == 0) {
    message = "Tengo hambre"
  } else if (parseInt(a) == 1) {
    message = "Quiero ir al baño"
  } else if (parseInt(a) == 2) {
    message = "Tengo frio"
  } else if (parseInt(a) == 3) {
    message = "Puedes venir"
  } else {
    message = "no va a funcionar";
  }

    io.emit('arduino:message', {
      value: message
  })
}

