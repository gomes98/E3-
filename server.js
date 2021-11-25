var net = require('net');
const decoder = require('./decode')
const log = require('./store')
const http = require('./http')

http.start()

let sockets = []

// server que ouve o equipamento
var server = net.createServer(function(socket) {
    socket.on('data', data => {
        console.log(data.toString());
        let dataStr = data.toString().split(',')
        decoder.decode(dataStr)
        dataStr.push(socket.remoteAddress)
        log.saveLog(dataStr)
        if (`${dataStr[2]}`.includes('TX') || `${dataStr[2]}`.includes('MQ')) {
            socket.write(data)
        }
    })

    socket.on('connection', (data) => {
        console.log(`connection`);
    })

    socket.on('error', (data) => {
        console.log("error", data);
    })

    socket.on('close', (data) => {
        console.log("close", data);
    })
})




server.on('connection', (data) => {
    sockets.push(data)
})

// inicia o server na porta 6081
server.listen(6081, '0.0.0.0');

// server para enviar dados para o equipamento
var channel = net.createServer(function(socket) {
    socket.on('data', data => {
        console.log(data.toString());
        sockets.forEach((skt, index) => {
            try {
                skt.write(data);
            } catch (error) {
                sockets.splice(index, 1)
                console.log("Erro no socket", error);
            }
        })
    })

    socket.on('error', (data) => {
        console.log("error", data);
    })

    socket.on('close', (data) => {
        console.log("close", data);
    })
})

channel.on('connection', data => {
    console.log('connection', data.remoteAddress);
})

// inciando na porta 21
channel.listen(21, '0.0.0.0');