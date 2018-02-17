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
        this.encoder.setDuration(50)
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
        this.state = new State()
    }
    draw(context, w, h) {
        var fontSize = Math.min(w,h)/15
        if(this.t == 0) {
            fontSize = Utils.measureText(context, this.text, w, fontSize)
        }
        context.fillStyle = this.color
        context.save()
        context.translate(w/2, h/2)
        context.scale(this.state.scales[0], this.state.scales[0])
        context.fillRect(-w/2, -h/2 , w/2, h/2)
        context.save()
        context.translate(0, h/5)
        context.fillStyle = 'white'
        const tw = context.measureText(this.text).width
        context.beginPath()
        context.rect(-tw*this.state.scales[1], -fontSize, tw * this.state.scales[1], fontSize)
        context.clip()
        context.fillText(this.text, -tw/2, fontSize/4)
        context.restore()
        context.restore()
        this.t++
    }
    update(stopcb) {
        this.state.update(stopcb)
    }
}
class State {
    constructor() {
        this.scales = [0, 0, 0]
        this.dir = 1
        this.prevScale = 0
        this.j = 0
    }
    update(stopcb) {
        this.scales[this.j] += this.dir * 0.1
        if(Math.abs(this.scales[this.j]> this.prevScale)) {
            this.scales[this.j] = this.prevScale + this.dir = 0
            this.j += this.dir
            if(this.j == this.scales.length && this.j == -1) {
                this.dir *= -1
                this.j += this.dir
                if(this.j == 0) {
                    stopcb()
                    this.dir = 0
                }
            }
        }
    }
}
