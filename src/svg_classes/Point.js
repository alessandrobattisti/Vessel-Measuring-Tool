export default class Point {

  constructor(point, canvas, x, y, zoom, selector = false) {
    this.cx = point[0]
    this.cy = point[1]
    this.fill = '#2da7cf80'
    this.stroke = 'rgb(123, 207, 225)'

    this.selector = selector
    this.canvas = canvas
    this.x = x
    this.y = y
    this.zoom = zoom

    this.el = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    this.select = this.select.bind(this)
    this.move = this.move.bind(this)
    this.stopEditing = this.stopEditing.bind(this)
    this.get_point = this.get_point.bind(this)

    this.old_cx = point[0]
    this.old_cy = point[1]

    this.base_size = 10
    this.base_stroke = 5
    this.size = this.base_size / zoom
    this.strokeWidth = this.base_stroke / zoom
  }

  draw() {
    this.el.setAttribute('cx', this.cx);
    this.el.setAttribute('cy', this.cy);
    this.el.setAttribute('r', this.size);
    this.el.style.stroke = this.stroke
    this.el.style.strokeWidth = this.strokeWidth
    this.el.style.fill = this.fill;
  }

  setSize(zoom) {
    this.size = this.base_size/zoom
    this.strokeWidth = this.base_stroke / zoom
    this.draw()
  }

  edit() {
    this.el.addEventListener('click', this.select)
  }

  clear() {
    window.removeEventListener('mousemove', this.move)
    window.removeEventListener('dblclick', this.stopEditing)
    this.fill = '#2da7cf80'
    this.cx = this.old_cx
    this.cy = this.old_cy
    this.draw()
  }

  stopEditing() {
    window.snapping_points.push([this.cx, this.cy])
    this.old_cx = this.cx
    this.old_cy = this.cy

    this.fill = '#2da7cf80'
    this.draw()
    window.removeEventListener('mousemove', this.move)
    window.removeEventListener('dblclick', this.stopEditing)
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

  get_point(e){
    const matrix = this.canvas.transform.baseVal[0].matrix
    const newPoint =  [((e.pageX-matrix.e-this.x)/matrix.a),((e.pageY-matrix.f-this.y)/matrix.a)]
    return this.snapPoint(newPoint)
  }

  move(e) {
    this.cx = this.get_point(e)[0]
    this.cy = this.get_point(e)[1]
    this.draw()
    if(!this.selector){
      window.addEventListener('dblclick', this.stopEditing)
    }
  }

  select() {
    this.old_cx = this.cx
    this.old_cy = this.cy
    this.fill = 'yellow'
    this.draw()
    window.addEventListener('mousemove', this.move)
  }

}
