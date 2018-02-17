const GifEncoder = require('gifencoder')
const Canvas = require('canvas')
const fs = require('fs')
class ScreenTextGif {
    constructor(w,h) {
        this.encoder = new GifEncoder(w,h)
        this.canvas = new Canvas()
        this.canvas.width = w
        this.canvas.height = h
        this.context = this.canvas.getContext('2d')
        this.encoder.setQuality(100)
        this.encoder.setDuration(100)
        this.encoder.setRepeat(0)
    }
    addScreen(color,text) {

    }
    create(fileName) {
        this.encoder.createReadStream().pipe(fs.createWriteStream(fileName))
        this.encoder.start()
      
        this.encoder.end()
    }
}
