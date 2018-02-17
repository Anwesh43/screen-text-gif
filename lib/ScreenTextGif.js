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
class Utils {
    static measureText(context,text,w,fontSize) {
        context.font = context.font.replace(/\d{2}/, fontSize)
        const tw = context.measureText(text).width
        if(tw > w) {
           return Utils.measureText(context, text, w, fonSize)
        }
        return fontSize
    }
}
class Screen {
    constructor(color, text) {
        this.text = text
        this.color = color
        this.t = 0
    }
    draw(context, w, h) {
        var fontSize = Math.min(w,h)/15
        if(this.t == 0) {
            fontSize = Utils.measureText(context, this.text, w, fontSize)
        }
        context.fillStyle = this.color
        context.save()
        context.translate(w/2, h/2)
        context.scale(1,1)
        context.fillRect(-w/2, -h/2 , w/2, h/2)
        context.save()
        context.translate(0, h/5)
        context.fillStyle = 'white'
        const tw = context.measureText(this.text).width
        context.beginPath()
        context.rect(-tw, -fontSize, tw, fontSize)
        context.clip()
        context.fillText(this.text, -tw/2, fontSize/4)
        context.restore()
        context.restore()
        this.t++
    }
    update(stopcb) {

    }
    startUpdating(startcb) {

    }
}
