const log = require('./store')

exports.decode = async(data) => {
    var index = 0

    var position = {}

    position.name = data[index++]
    position.uniqueId = data[index++]
    position.type = data[index++];
    position.valid = data[index++] === "A" ? true : false

    if (position.type == "HB" || position.type == "TX") {
        let date = data[index++]
        let time = data[index++]

        let deviceTime = new Date()
        deviceTime.setFullYear(2000 + parseInt(date.substring(0, 2), 16))
        deviceTime.setMonth(parseInt(date.substring(2, 4), 16))
        deviceTime.setDate(parseInt(date.substring(4, 6), 16))
        deviceTime.setHours(parseInt(time.substring(0, 2), 16) - 3)
        deviceTime.setMinutes(parseInt(time.substring(2, 4), 16))
        deviceTime.setSeconds(parseInt(time.substring(4, 6), 16))

        position.date = deviceTime

        if (position.type == "TX") {
            log.saveLog(position, "POS")
            return
        }

        let latitude = data[index++]
        if (latitude.startsWith("8")) {
            position.latitude = (parseInt(latitude.substring(1), 16) * -1) / 600000
        } else {
            position.latitude = (parseInt(latitude, 16) * -1) / 600000
        }

        let longitude = data[index++]
        if (longitude.startsWith("8")) {
            position.longitude = (parseInt(longitude.substring(1), 16) * -1) / 600000
        } else {
            position.longitude = (parseInt(longitude, 16) * -1) / 600000
        }

        position.speed = parseInt(data[index++], 16) / 100

        position.course = parseInt(data[index++], 16) / 100

        position.status = data[index++]

        position.signal = parseInt(data[index++])

        position.power = parseInt(data[index++])

        position.fuel = data[index++]

        position.mileage = parseInt(data[index++], 16) / 10.0

        position.altitude = parseInt(data[index++])

        position.gpsData = data[index++]

        position.rfid = data[index++]

        position.temperature = data[index++]

        position.voltage = parseFloat(data[index++])

        position.satelites = parseInt(data[index++])

        position.googleMaps = `http://maps.google.com/maps?q=${position.latitude},${position.longitude}&z=16`

    }

    log.saveLog(position, "POS")
}