const http = require("http");
var url = require('url');
const fs = require('fs')

const httpServer = http.createServer((req, res) => {
    var queryData = url.parse(req.url, true).query;
    res.writeHead(200);

    // pegando o dia para ler o arquivo
    let date = new Date()
    let str = date.toISOString()
    let dia = str.substring(0, 10)
    let filename = `E3-${dia}.txt`

    if (queryData.position) {
        filename = `POS-${dia}.txt`
    }
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

            // iterando sobre as colunas se for um array
            if (Array.isArray(e)) {
                e.forEach(e => {
                    html += `<td>${e}</td>`
                })
            } else {
                // iterando sobre as colunas se for um objeto
                for (const property in e) {
                    html += `<td>${property}: ${e[property]}</td>`
                }
            }

            html += "</tr>\n"
        })
        html += "</table>\n"

        // enviando para o navegador
        res.end(html);
    }
});


// iniciando o server na porta
exports.start = () => {
    httpServer.listen(6060, 'localhost', () => {
        console.log(`Servidor Http para ler o arquivo rodando no endereço http://localhost:6060`);
    });
}