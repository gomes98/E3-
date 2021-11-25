// Função que salva o payload do equipamento
const fs = require('fs')
exports.saveLog = async(data, prefix) => {
    let date = new Date()
    let str = date.toISOString()
    let dia = str.substring(0, 10)
    let filename = `E3-${dia}.txt`

    // se tem prefixo troco nome
    if (prefix) {
        filename = `${prefix}-${dia}.txt`
    }

    // se for um array adiciono a data de chegada do evento
    if (Array.isArray(data)) {
        data.push(date)

        // se for um objeto adiciono o server time
    } else if (data.type) {
        data.serverTime = date
    }


    let existe = await fs.existsSync(filename)
    if (existe) {
        fs.appendFileSync(filename, `, \n${JSON.stringify(data)}`)
    } else {
        fs.writeFileSync(filename, `${JSON.stringify(data)}, \n`)
    }
}