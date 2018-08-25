export default class MidPoint {

  constructor(points, index, zoom) {
    this.cx = points[0]
    this.cy = points[1]
    this.fill = '#2da7cf80'
    this.stroke = 'rgb(123, 207, 225)'
    this.strokeWidth = '2'
    this.index = index
    this.el = document.createElementNS('http://www.w3.org/2000/svg', 'rect');

    this.zoom = zoom

    this.base_size = 17
    this.size = this.base_size / zoom
    this.base_stroke = 5
    this.strokeWidth = this.base_stroke / zoom

  }

  setSize(zoom) {
    this.zoom = zoom
    this.strokeWidth = this.base_stroke / zoom
    this.size = this.base_size / zoom
    this.draw()
  }

  draw() {
    this.el.setAttribute('x', this.cx - (this.size/2))
    this.el.setAttribute('y', this.cy - (this.size/2))
    this.el.setAttribute('cx', this.cx)
    this.el.setAttribute('cy', this.cy)
    this.el.setAttribute('height', this.size)
    this.el.setAttribute('width', this.size)
    this.el.setAttribute('index', this.index)
    this.el.style.fill = this.fill
    this.el.style.strokeWidth = this.strokeWidth
    this.el.style.stroke = this.stroke
  }
}
