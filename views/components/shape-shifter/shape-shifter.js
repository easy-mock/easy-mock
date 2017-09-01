/*
 * Shape Shifter
 * http://www.kennethcachia.com/shape-shifter
 * A canvas experiment
 */
'use strict'

let S = module.exports = {
  init: function (ele, text) {
    S.Drawing.init(ele)
    S.ShapeBuilder.init()
    S.UI.init()
    // Shape|Shifter|Type|to start|#icon thumbs-up|#countdown 3||
    S.UI.simulate(text)
    S.Drawing.loop(function () {
      S.Shape.render()
    })
  }
}

S.Drawing = (function () {
  let canvas
  let context
  let renderFn
  let requestFrame = window.requestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      window.oRequestAnimationFrame ||
      window.msRequestAnimationFrame ||
      function (callback) {
        window.setTimeout(callback, 1000 / 60)
      }

  return {
    init: function (el) {
      canvas = el
      context = canvas.getContext('2d')
      this.adjustCanvas()

      window.addEventListener('resize', function () {
        S.Drawing.adjustCanvas()
      })
    },

    loop: function (fn) {
      renderFn = !renderFn ? fn : renderFn
      this.clearFrame()
      renderFn()
      requestFrame.call(window, this.loop.bind(this))
    },

    adjustCanvas: function () {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    },

    clearFrame: function () {
      context.clearRect(0, 0, canvas.width, canvas.height)
    },

    getArea: function () {
      return { w: canvas.width, h: canvas.height }
    },

    drawCircle: function (p, c) {
      context.fillStyle = c.render()
      context.beginPath()
      context.arc(p.x, p.y, p.z, 0, 2 * Math.PI, true)
      context.closePath()
      context.fill()
    }
  }
}())

S.Point = function (args) {
  this.x = args.x
  this.y = args.y
  this.z = args.z
  this.a = args.a
  this.h = args.h
}

S.Color = function (r, g, b, a) {
  this.r = r
  this.g = g
  this.b = b
  this.a = a
}

S.Color.prototype = {
  render: function () {
    return 'rgba(' + this.r + ',' + this.g + ',' + this.b + ',' + this.a + ')'
  }
}

S.UI = (function () {
  let interval
  let currentAction
  let resizeTimer
  let time
  let maxShapeSize = 30
  let sequence = []
  let cmd = '#'

  function formatTime (date) {
    let h = date.getHours()
    let m = date.getMinutes()

    m = m < 10 ? '0' + m : m
    return h + ':' + m
  }

  function getValue (value) {
    return value && value.split(' ')[1]
  }

  function getAction (value) {
    value = value && value.split(' ')[0]
    return value && value[0] === cmd && value.substring(1)
  }

  function timedAction (fn, delay, max, reverse) {
    clearInterval(interval)
    currentAction = reverse ? max : 1
    fn(currentAction)

    if (!max || (!reverse && currentAction < max) || (reverse && currentAction > 0)) {
      interval = setInterval(function () {
        currentAction = reverse ? currentAction - 1 : currentAction + 1
        fn(currentAction)

        if ((!reverse && max && currentAction === max) || (reverse && currentAction === 0)) {
          clearInterval(interval)
        }
      }, delay)
    }
  }

  function reset (destroy) {
    clearInterval(interval)
    sequence = []
    time = null

    if (destroy) {
      S.Shape.switchShape(S.ShapeBuilder.letter(''))
    }
  }

  function performAction (value) {
    let action
    let current

    sequence = (typeof value) === 'object' ? value : sequence.concat(value.split('|'))

    timedAction(function () {
      current = sequence.shift()
      action = getAction(current)
      value = getValue(current)

      switch (action) {
        case 'countdown':
          value = parseInt(value, 10) || 10
          value = value > 0 ? value : 10

          timedAction(function (index) {
            if (index === 0) {
              if (sequence.length === 0) {
                S.Shape.switchShape(S.ShapeBuilder.letter(''))
              } else {
                performAction(sequence)
              }
            } else {
              S.Shape.switchShape(S.ShapeBuilder.letter(index), true)
            }
          }, 1000, value, true)
          break

        case 'rectangle':
          value = value && value.split('x')
          value = (value && value.length === 2) ? value : [maxShapeSize, maxShapeSize / 2]

          S.Shape.switchShape(S.ShapeBuilder.rectangle(Math.min(maxShapeSize, parseInt(value[0], 10)), Math.min(maxShapeSize, parseInt(value[1], 10))))
          break

        case 'circle':
          value = parseInt(value, 10) || maxShapeSize
          value = Math.min(value, maxShapeSize)
          S.Shape.switchShape(S.ShapeBuilder.circle(value))
          break

        case 'time':
          let t = formatTime(new Date())

          if (sequence.length > 0) {
            S.Shape.switchShape(S.ShapeBuilder.letter(t))
          } else {
            timedAction(function () {
              t = formatTime(new Date())
              if (t !== time) {
                time = t
                S.Shape.switchShape(S.ShapeBuilder.letter(time))
              }
            }, 1000)
          }
          break

        case 'icon':
          S.ShapeBuilder.imageFile(value, function (obj) {
            S.Shape.switchShape(obj)
          })
          break

        default:
          S.Shape.switchShape(S.ShapeBuilder.letter(current[0] === cmd ? 'What?' : current))
      }
    }, 2000, sequence.length)
  }

  function bindEvents () {
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(function () {
        S.Shape.shuffleIdle()
        reset(true)
      }, 500)
    })
  }

  return {
    init: function () {
      bindEvents()
    },

    reset: function () {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(function () {
        S.Shape.shuffleIdle()
        reset(true)
      }, 500)
    },

    simulate: function (action) {
      performAction(action)
    }
  }
}())

S.Dot = function (x, y) {
  this.p = new S.Point({
    x: x,
    y: y,
    z: 5,
    a: 1,
    h: 0
  })

  this.e = 0.07
  this.s = true

  this.c = new S.Color(255, 255, 255, this.p.a)

  this.t = this.clone()
  this.q = []
}

S.Dot.prototype = {
  clone: function () {
    return new S.Point({
      x: this.x,
      y: this.y,
      z: this.z,
      a: this.a,
      h: this.h
    })
  },

  _draw: function () {
    this.c.a = this.p.a
    S.Drawing.drawCircle(this.p, this.c)
  },

  _moveTowards: function (n) {
    let details = this.distanceTo(n, true)
    let dx = details[0]
    let dy = details[1]
    let d = details[2]
    let e = this.e * d

    if (this.p.h === -1) {
      this.p.x = n.x
      this.p.y = n.y
      return true
    }

    if (d > 1) {
      this.p.x -= ((dx / d) * e)
      this.p.y -= ((dy / d) * e)
    } else {
      if (this.p.h > 0) {
        this.p.h--
      } else {
        return true
      }
    }

    return false
  },

  _update: function () {
    let p
    let d

    if (this._moveTowards(this.t)) {
      p = this.q.shift()

      if (p) {
        this.t.x = p.x || this.p.x
        this.t.y = p.y || this.p.y
        this.t.z = p.z || this.p.z
        this.t.a = p.a || this.p.a
        this.p.h = p.h || 0
      } else {
        if (this.s) {
          this.p.x -= Math.sin(Math.random() * 3.142)
          this.p.y -= Math.sin(Math.random() * 3.142)
        } else {
          this.move(new S.Point({
            x: this.p.x + (Math.random() * 50) - 25,
            y: this.p.y + (Math.random() * 50) - 25
          }))
        }
      }
    }

    d = this.p.a - this.t.a
    this.p.a = Math.max(0.1, this.p.a - (d * 0.05))
    d = this.p.z - this.t.z
    this.p.z = Math.max(1, this.p.z - (d * 0.05))
  },

  distanceTo: function (n, details) {
    let dx = this.p.x - n.x
    let dy = this.p.y - n.y
    let d = Math.sqrt(dx * dx + dy * dy)

    return details ? [dx, dy, d] : d
  },

  move: function (p, avoidStatic) {
    if (!avoidStatic || (avoidStatic && this.distanceTo(p) > 1)) {
      this.q.push(p)
    }
  },

  render: function () {
    this._update()
    this._draw()
  }
}

S.ShapeBuilder = (function () {
  let gap = 13
  let shapeCanvas = document.createElement('canvas')
  let shapeContext = shapeCanvas.getContext('2d')
  let fontSize = 500
  let fontFamily = 'Avenir, Helvetica Neue, Helvetica, Arial, sans-serif'

  function fit () {
    shapeCanvas.width = Math.floor(window.innerWidth / gap) * gap
    shapeCanvas.height = Math.floor(window.innerHeight / gap) * gap
    shapeContext.fillStyle = 'red'
    shapeContext.textBaseline = 'middle'
    shapeContext.textAlign = 'center'
  }

  function processCanvas () {
    let pixels = shapeContext.getImageData(0, 0, shapeCanvas.width, shapeCanvas.height).data
    let dots = []
    let x = 0
    let y = 0
    let fx = shapeCanvas.width
    let fy = shapeCanvas.height
    let w = 0
    let h = 0

    for (let p = 0; p < pixels.length; p += (4 * gap)) {
      if (pixels[p + 3] > 0) {
        dots.push(new S.Point({
          x: x,
          y: y
        }))

        w = x > w ? x : w
        h = y > h ? y : h
        fx = x < fx ? x : fx
        fy = y < fy ? y : fy
      }

      x += gap

      if (x >= shapeCanvas.width) {
        x = 0
        y += gap
        p += gap * 4 * shapeCanvas.width
      }
    }

    return { dots: dots, w: w + fx, h: h + fy }
  }

  function setFontSize (s) {
    shapeContext.font = 'bold ' + s + 'px ' + fontFamily
  }

  function isNumber (n) {
    return !isNaN(parseFloat(n)) && isFinite(n)
  }

  return {
    init: function () {
      fit()
      window.addEventListener('resize', fit)
    },

    imageFile: function (url, callback) {
      let image = new Image()
      let a = S.Drawing.getArea()

      image.onload = function () {
        shapeContext.clearRect(0, 0, shapeCanvas.width, shapeCanvas.height)
        shapeContext.drawImage(this, 0, 0, a.h * 0.6, a.h * 0.6)
        callback(processCanvas())
      }

      image.onerror = function () {
        callback(S.ShapeBuilder.letter('What?'))
      }

      image.src = url
    },

    circle: function (d) {
      let r = Math.max(0, d) / 2
      shapeContext.clearRect(0, 0, shapeCanvas.width, shapeCanvas.height)
      shapeContext.beginPath()
      shapeContext.arc(r * gap, r * gap, r * gap, 0, 2 * Math.PI, false)
      shapeContext.fill()
      shapeContext.closePath()

      return processCanvas()
    },

    letter: function (l) {
      let s = 0

      setFontSize(fontSize)
      s = Math.min(fontSize,
        (shapeCanvas.width / shapeContext.measureText(l).width) * 0.8 * fontSize,
        (shapeCanvas.height / fontSize) * (isNumber(l) ? 1 : 0.45) * fontSize)
      setFontSize(s)

      shapeContext.clearRect(0, 0, shapeCanvas.width, shapeCanvas.height)
      shapeContext.fillText(l, shapeCanvas.width / 2, shapeCanvas.height / 2)

      return processCanvas()
    },

    rectangle: function (w, h) {
      let dots = []
      let width = gap * w
      let height = gap * h

      for (let y = 0; y < height; y += gap) {
        for (let x = 0; x < width; x += gap) {
          dots.push(new S.Point({
            x: x,
            y: y
          }))
        }
      }

      return { dots: dots, w: width, h: height }
    }
  }
}())

S.Shape = (function () {
  let dots = []
  let width = 0
  let height = 0
  let cx = 0
  let cy = 0

  function compensate () {
    let a = S.Drawing.getArea()

    cx = a.w / 2 - width / 2
    cy = a.h / 2 - height / 2
  }

  return {
    shuffleIdle: function () {
      let a = S.Drawing.getArea()

      for (let d = 0; d < dots.length; d++) {
        if (!dots[d].s) {
          dots[d].move({
            x: Math.random() * a.w,
            y: Math.random() * a.h
          })
        }
      }
    },

    switchShape: function (n, fast) {
      let size
      let a = S.Drawing.getArea()
      let d = 0
      let i = 0

      width = n.w
      height = n.h

      compensate()

      if (n.dots.length > dots.length) {
        size = n.dots.length - dots.length
        for (d = 1; d <= size; d++) {
          dots.push(new S.Dot(a.w / 2, a.h / 2))
        }
      }

      d = 0

      while (n.dots.length > 0) {
        i = Math.floor(Math.random() * n.dots.length)
        dots[d].e = fast ? 0.25 : (dots[d].s ? 0.14 : 0.11)

        if (dots[d].s) {
          dots[d].move(new S.Point({
            z: Math.random() * 20 + 10,
            a: Math.random(),
            h: 18
          }))
        } else {
          dots[d].move(new S.Point({
            z: Math.random() * 5 + 5,
            h: fast ? 18 : 30
          }))
        }

        dots[d].s = true
        dots[d].move(new S.Point({
          x: n.dots[i].x + cx,
          y: n.dots[i].y + cy,
          a: 1,
          z: 5,
          h: 0
        }))

        n.dots = n.dots.slice(0, i).concat(n.dots.slice(i + 1))
        d++
      }

      for (i = d; i < dots.length; i++) {
        if (dots[i].s) {
          dots[i].move(new S.Point({
            z: Math.random() * 20 + 10,
            a: Math.random(),
            h: 20
          }))

          dots[i].s = false
          dots[i].e = 0.04
          dots[i].move(new S.Point({
            x: Math.random() * a.w,
            y: Math.random() * a.h,
            a: 0.3, // .4
            z: Math.random() * 4,
            h: 0
          }))
        }
      }
    },

    render: function () {
      for (let d = 0; d < dots.length; d++) {
        dots[d].render()
      }
    }
  }
}())
