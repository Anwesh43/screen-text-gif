const GifEncoder = require('gifencoder')
const Canvas = require('canvas')
const fs = require('fs')
const MOVEMENT_MODES = {
    LEFT_TO_RIGHT(context, w, h, scale) {
        context.fillRect(0, 0, w * scale, h)
    },
    RIGHT_TO_LEFT(context, w, h,scale) {
        context.fillRect(w * (1 - scale), 0, w * scale, h)
    },
    UP_TO_DOWN(context, w, h, scale) {
        context.fillRect(0, 0, w, h*scale)
    },
    DOWN_TO_LEFT(context, w, h, scale) {
        context.fillRect(0, h * (1 - scale), w, h * scale)
    }
}
const MODE_KEYS = ["LEFT_TO_RIGHT", "RIGHT_TO_LEFT", "UP_TO_DOWN", "DOWN_TO_LEFT"]
class ScreenTextGif {
    constructor(w,h) {
        this.encoder = new GifEncoder(w,h)
        this.canvas = new Canvas()
        this.canvas.width = w
        this.canvas.height = h
        this.context = this.canvas.getContext('2d')
        this.encoder.setQuality(100)
        this.encoder.setDelay(50)
        this.encoder.setRepeat(0)
        this.screenContainer = new ScreenContainer(w,h)
    }
    addScreen(color,text) {
        this.screenContainer.addScreen(new Screen(color,text))
    }
    create(fileName) {
        this.encoder.createReadStream().pipe(fs.createWriteStream(fileName))
        this.encoder.start()
        var running = true
        while(running) {
            this.screenContainer.draw(this.context)
            this.screenContainer.update(() => {
                running = false
            })
            this.encoder.addFrame(this.context)
        }
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
        this.i = 0
    }
    setI(i) {
        this.i = i
    }
    draw(context, w, h) {
        var fontSize = Math.min(w,h)/12
        if(this.t == 0) {
            fontSize = Utils.measureText(context, this.text, w, fontSize)
        }
        context.fillStyle = '#212121'
        context.fillRect(0,0,w,h)
        //console.log(context.fillStyle)
        context.fillStyle = this.color
        //console.log(context.fillStyle)
        context.save()
        const scale = this.state.scales[0]
        MOVEMENT_MODES[MODE_KEYS[this.i % MODE_KEYS.length]](context, w, h, scale)
        context.save()
        context.translate(w/2, h/2)
        context.fillStyle = 'white'
        const tw = context.measureText(this.text).width
        context.beginPath()
        context.rect(-tw*this.state.scales[1], -fontSize, 2*tw * this.state.scales[1], 2*fontSize)
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
        //console.log(this.scales)
        if(Math.abs(this.scales[this.j]- this.prevScale) > 1) {
            //console.log(this.scales)
            this.scales[this.j] = this.prevScale + this.dir
            this.j += this.dir
            if(this.j == this.scales.length || this.j == -1) {
                this.dir *= -1
                this.j += this.dir
                this.prevScale = this.scales[this.j]
                if(this.j == 0) {
                    stopcb()
                    this.dir = 0
                }
            }
        }
    }
}
class ScreenContainer {
    constructor(w,h) {
        this.screens = []
        this.w = w
        this.h = h
    }
    addScreen(screen) {
        screen.setI(this.screens.length)
        this.screens.push(screen)
    }
    update(stopcb) {
        if(this.screens.length > 0) {
            this.screens[0].update(() => {
                this.screens.splice(0,1)
                if(this.screens.length == 0) {
                    stopcb()
                }
            })
        }
    }
    draw(context) {
        if(this.screens.length > 0) {
            this.screens[0].draw(context, this.w, this.h)
        }
    }
}
const createScreenTextGif = (w,h,colors,texts,fileName) => {
    const gif = new ScreenTextGif(w, h)
    colors.forEach((color, index) => {
        gif.addScreen(color, texts[index])
    })
    gif.create(fileName)
}
module.exports = createScreenTextGif
