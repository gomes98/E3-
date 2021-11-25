var net = require('net');
const fs = require('fs')
const http = require("http");
var url = require('url');

let sockets = []

// server que ouve o equipamento
var server = net.createServer(function(socket) {
    socket.on('data', data => {
        console.log(data.toString());
        let dataStr = data.toString().split(',')
        dataStr.push(socket.remoteAddress)
        logReceived(dataStr)
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


// Função que salva o payload do equipamento
const logReceived = async(data) => {
    let date = new Date()
    let str = date.toISOString()
    let dia = str.substring(0, 10)
    let filename = `E3-${dia}.txt`
    data.push(str)
    let existe = await fs.existsSync(filename)
    if (existe) {
        fs.appendFileSync(filename, `, \n${JSON.stringify(data)}`)
    } else {
        fs.writeFileSync(filename, `${JSON.stringify(data)}, \n`)
    }
}

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

const httpServer = http.createServer((req, res) => {
    var queryData = url.parse(req.url, true).query;
    res.writeHead(200);

    // pegando o dia para ler o arquivo
    let date = new Date()
    let str = date.toISOString()
    let dia = str.substring(0, 10)
    let filename = `E3-${dia}.txt`

    // conversão do arquivo
    let contentFile = "[\n"
    contentFile += fs.readFileSync(filename).toString()
    contentFile += "\n]"

    if (queryData.json) {
        // enviando json
        res.end(contentFile);
    } else {
        // gerando json
        let json = JSON.parse(contentFile)

        // gerando html
        let html = ""
        html += "<table>\n"

        // iterando sobre as linhas
        json.forEach(e => {
            html += "<tr>\n"

            // iterando sobre as colunas
            e.forEach(e => {
                html += `<td>${e}</td>`
            })
            html += "</tr>\n"
        })
        html += "</table>\n"

        // enviando para o navegador
        res.end(html);
    }
});

// iniciando o server na porta
httpServer.listen(6060, 'localhost', () => {
    console.log(`Servidor Http para ler o arquivo rodando no endereço http://localhost:6060`);
});