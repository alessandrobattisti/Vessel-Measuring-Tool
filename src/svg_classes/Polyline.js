import Point from './Point'
import MidPoint from './MidPoint'
import {cleanedPoly} from './../calc_functions'

export default class Poly {

  constructor(obj) {
    this.points = obj.points
    this.fill = 'none'
    this.stroke = 'magenta'
    this.base_size = 5
    this.id = obj.id
    this.type = obj.type
    this.el = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    this.el.classList.add('active')
    this.canvas = obj.canvas

    this.x = obj.offsetX
    this.y = obj.offsetY

    this.zoom = obj.currentZoom
    this.setSize(this.zoom)

    this.canvas.appendChild(this.el)

    this.draw = this.draw.bind(this)
    this.stopEditing = this.stopEditing.bind(this)
    this.stopEditingPoints = this.stopEditingPoints.bind(this)
    this.get_point = this.get_point.bind(this)
    this.previewPoint = this.previewPoint.bind(this)
    this.create = this.create.bind(this)
    this.add_point = this.add_point.bind(this)

    this.canvas.addEventListener('dblclick', this.add_point)

    this.editing = false
    this.breaking_mode = false

    this.midpoints = []
  }

  setSize(zoom){
    this.strokeWidth = this.base_size/zoom
    this.draw()
  }
  draw() {
    this.el.setAttribute('points', this.pointsTo())
    this.el.id = this.id
    this.el.style.fill = this.fill
    this.el.style.stroke = this.stroke
    this.el.style.strokeWidth = this.strokeWidth
    if (this.editing) {
      this.draw_midpoints()
    }
  }

  draw_midpoints() {
    //remove from canvas
    this.midpoints.forEach(function(midpoint) {
      this.canvas.removeChild(midpoint.el)
    }.bind(this))
    this.midpoints = []
    //recreate midpoints
    let index = 0
    this.points.forEach(function(point) {
      if (index > 0 && this.points.length > index) {
        if(point.cx !== this.points[index - 1].cx && point.cy !== this.points[index - 1].cy){
          const midpoint = new MidPoint(
            [ (point.cx + this.points[index - 1].cx) / 2,
            (point.cy + this.points[index - 1].cy) / 2 ],
            index, this.zoom)
            this.midpoints.push(midpoint)
        }
      }
      index++
    }.bind(this))
    //add midpoints to canvas
    this.midpoints.forEach(function(midpoint) {
      this.canvas.appendChild(midpoint.el)
      midpoint.draw()
      midpoint.el.addEventListener('click', this.create)
    }.bind(this))
  }

  create(e) {
    const index = e.target.getAttribute('index')
    const new_point = new Point( [parseFloat(e.target.getAttribute('cx')), parseFloat(e.target.getAttribute('cy'))],
                                 this.canvas, this.x, this.y, this.zoom
                               )
    this.addPointInMiddle(index, new_point)
  }

  addPointInMiddle(index, new_point) {
    this.points.splice(index, 0, new_point)
    this.canvas.appendChild(new_point.el)
    new_point.draw()
    new_point.edit()
    new_point.select()
    this.draw()
  }

  pointsTo() {
    let str = ''
    this.points.forEach(function(point) {
      str += `${point.cx}, ${point.cy} `
    })
    return str
  }

  //add point
  add_point(e){
    let new_point = this.get_point(e)
    if(this.type==='max_fill'){
      let point = [-1000000, new_point[1]]
      this.appendPoint(point)
      point = [1000000, new_point[1]]
      this.appendPoint(point)
      return
    }
    if(this.type==='center'){
      let point = [new_point[0], -1000000]
      this.appendPoint(point)
      point = [new_point[0], 1000000]
      this.appendPoint(point)
      return
    }

    this.appendPoint(new_point)
  }

  appendPoint(array) {
    window.snapping_points.push([array[0], array[1]])
    const point = new Point([array[0], array[1]], this.canvas, this.x, this.y, this.zoom)
    this.points.push(point)
    this.draw()
    if (this.points.length === 1) {
      window.addEventListener('mousemove', this.previewPoint)
      window.addEventListener('keyup', this.stopEditing)
    }
  }

  get_point(e){
    const matrix = this.canvas.transform.baseVal[0].matrix
    const newPoint =  [((e.pageX-matrix.e-this.x)/matrix.a),((e.pageY-matrix.f-this.y)/matrix.a)]
    return this.snapPoint(newPoint)
  }

  snapPoint(new_point){
    const max_dist = 25/window.zoom
    let founds = []
    window.snapping_points.forEach(function(point){
      if(new_point[0]+max_dist > point[0] && new_point[0]-max_dist < point[0] ){
        if(new_point[1]+max_dist > point[1] && new_point[1]-max_dist < point[1] ){
          const dist = Math.sqrt(
            Math.pow((new_point[0]-point[0]), 2) + Math.pow((new_point[1]-point[1]) ,2)
          )
          founds.push({point:[point[0], point[1]], dist:dist})
        }
      }
    })
    if(founds.length>0){
      //sort array by distance
      founds.sort((a,b)=>a.dist-b.dist);
      new_point = founds[0].point
    }
    if(window.r_axis){
      if(new_point[0]+max_dist > window.r_axis && new_point[0]-window.r_axis < max_dist ){
        new_point[0] = window.r_axis
      }
    }
    return new_point

  }

  previewPoint(e) {
    const new_point = this.get_point(e)
    this.points.push(new Point([new_point[0], new_point[1]], this.canvas, this.x, this.y, this.zoom))
    this.draw()
    this.removeLastPoint()
  }

  editLine() {
    this.editing = true
    window.addEventListener('keyup', this.stopEditingPoints)
    this.points.forEach(function(point) {
      point.x = this.x
      point.y = this.y
      this.canvas.appendChild(point.el)
      point.draw()
      point.edit()
    }.bind(this))
    this.draw_midpoints()
    window.addEventListener('mousemove', this.draw)
  }

  stopEditingPoints(e) {
    this.editing = false
    if (e.code === 'Escape' || e.code === 'KeyQ') {
      this.draw()
      window.removeEventListener('mousemove', this.draw)
    }
    this.midpoints.forEach(function(midpoint) {
      this.canvas.removeChild(midpoint.el)
    }.bind(this))
    this.midpoints = []
    this.points.forEach(function(point) {
      this.canvas.removeChild(point.el)
      point.clear()
    }.bind(this))
    this.points = cleanedPoly(this.points)
    this.draw()
    window.removeEventListener('keyup', this.stopEditingPoints)
  }

  removeLastPoint() {
    this.points.pop()
  }

  stopEditing(e) {
    if (e.code === 'Escape' || e.code === 'KeyQ') {
      this.draw()
      this.canvas.removeEventListener('dblclick', this.add_point)
      window.removeEventListener('mousemove', this.previewPoint)
      window.removeEventListener('keyup', this.stopEditing)
    }
  }

}
