import {Polyline, Dimension} from './svg_classes/Polyline'
const d3 = require('d3-polygon')

//http://paulbourke.net/geometry/pointlineplane/javascript.txt
// line intercept math by Paul Bourke http://paulbourke.net/geometry/pointlineplane/
// Determine the intersection point of two line segments
// Return FALSE if the lines don't intersect
function intersect(x1, y1, x2, y2, x3, y3, x4, y4) {
  // Check if none of the lines are of length 0
	if ((x1 === x2 && y1 === y2) || (x3 === x4 && y3 === y4)) {
		return false
	}
	let denominator = ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1))
  // Lines are parallel
	if (denominator === 0) {
		return false
	}
	let ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator
	let ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denominator
  // is the intersection along the segments
	if (ua < 0 || ua > 1 || ub < 0 || ub > 1) {
		return false
	}
  // Return a object with the x and y coordinates of the intersection
	let x = x1 + ua * (x2 - x1)
	let y = y1 + ua * (y2 - y1)

	return {x, y}
}

function calc_vol(poly, scale) {
  let measures = toD3(poly)
  let dist = (measures.centroid[0] - window.r_axis) * 2 * Math.PI
  let vol = dist * measures.area * Math.pow(scale, 3)
  return Math.abs(vol)
}

function distance(p1, p2) {
  return Math.sqrt(Math.pow((p1[0] - p2[0]), 2) + Math.pow((p1[1] - p2[1]), 2))
}

function calcScale(poly, value, unit) {
  if (!poly) {
    return null
  }
  const v1 = [
    poly.points[0].cx,
    poly.points[0].cy
  ]
  const v2 = [
    poly.points[1].cx,
    poly.points[1].cy
  ]
  const d = distance(v1, v2)
  let new_value
  if (unit === 'inch') {
    new_value = value * 2.54
  } else {
    new_value = value
  }
  const pro = (new_value / d) / 10
  return pro
}

function toD3(poly) {
  let points_array = []
  poly.forEach(function(point) {
    points_array.push([point.cx, point.cy])
  })
  return {centroid: d3.polygonCentroid(points_array), area: d3.polygonArea(points_array)}
}

function cleanedPoly(array) {
  let points = []
  let x = 0
  array.forEach(function(el) {
    if (x < array.length - 1) {
      if (el.cx !== array[x + 1].cx && el.cy !== array[x + 1].cy) {
        points.push(el)
      }
      x++
    } else {
      points.push(el)
    }
  })
  return points
}

function getCommonPoints(poly1, poly2) {
  let start1 = poly1[0]
  let end1 = poly1[poly1.length - 1]
  let start2 = poly2[0]
  let end2 = poly2[poly2.length - 1]
  let commons = []
  if (start1.cx === start2.cx && start1.cy === start2.cy) {
    commons.push('start-start')
  }
  if (start1.cx === end2.cx && start1.cy === end2.cy) {
    commons.push('start-end')
  }
  if (end1.cx === start2.cx && end1.cy === start2.cy) {
    commons.push('end-start')
  }
  if (end1.cx === end2.cx && end1.cy === end2.cy) {
    commons.push('end-end')
  }
  return commons
}

function innerProfileToPolygon(old_poly) {
  let poly = [];
  old_poly.forEach(function(point){
    poly.push(Object.assign({}, point))
  })
  let start = poly[0]
  let end = poly[poly.length - 1]
  //start polyline from bottom to top Y values are inverted topY < bottomY
  if (start.cy < end.cy) {
    poly.reverse()
    start = poly[0]
    end = poly[poly.length - 1]
  }
  let new_end = Object.assign({}, end);

  //set max fill
  if(window.maxFill && window.maxFill > end.cy && window.maxFill < start.cy){
    //recreate poly excluding vetices above maxFill
    let temp_poly = []
    let first_time = true
    poly.forEach(function(point){
      if(point.cy < window.maxFill){
				//this vertex is above maxFill skip
				//if this is the first vertex above add it otherwise ignore it
				if(first_time){
          temp_poly.push(point)
          first_time = false
        }
      }else{
				//this vertex is under maxFill
				//add vertex that is under maxFill limit
        temp_poly.push(point)
      }
    })

    poly = temp_poly

    start = poly[0]
    end = poly[poly.length - 1]
    end.cx = intersect(
      end.cx, end.cy, poly[poly.length-2].cx, poly[poly.length-2].cy,
      -100000, window.maxFill, 1000000, window.maxFill
    ).x
    end.cy = window.maxFill
    new_end.cy = window.maxFill
  }


  //if not caxis use start x as center axis else use the defined center axis
  if (!window.r_axis || window.r_axis === start.cx) {
    window.r_axis = start.cx
    new_end.cx = start.cx
    poly.push(new_end)
    poly.push(start) //duplicated to close polygon
  } else {
    let new_start = Object.assign({}, start);
    new_start.cx = window.r_axis
    new_end.cx = window.r_axis
    poly.push(new_end)
    poly.push(new_start)
    poly.push(start) //duplicated to close polygon
  }
  return poly
}

function create_polygon(poly, color) {
  let str = ''
  poly.forEach(function(point) {
    str += `${point.cx}, ${point.cy} `
  })
  let new_poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
  new_poly.setAttribute('points', str)
  new_poly.style.fill = color
	new_poly.style.fillOpacity = 0.25
  new_poly.style.strokeWidth = '0'
  return new_poly
}

function recreate_snapping_points(polylines) {
  window.snapping_points = []
  polylines.forEach(function(poly) {
    poly.points.forEach(function(point) {
      window.snapping_points.push([point.cx, point.cy])
    })
  })
}

function join2Polylines(poly1, poly2) {
  const points = getCommonPoints(poly1.points.slice(), poly2.points.slice())
  let new_poly = []

  if (points.length >= 1) {
    //message = "Simple join"
    if (points[0] === 'start-start') {
      new_poly = poly1.points.reverse().concat(poly2.points)
    } else if (points[0] === 'end-end') {
      new_poly = poly1.points.concat(poly2.points.reverse())
    } else if (points[0] === 'start-end') {
      new_poly = poly2.points.concat(poly1.points)
    } else if (points[0] === 'end-start') {
      new_poly = poly1.points.concat(poly2.points)
    }
    if (points.length === 2) {
      //message = "closed line"
    }
    return new_poly
  } else {
    return
  }
}

function polyPointsToPathData(points_string){
	return 'M'+points_string.replace(/, /g, ',').replace(/ $/, '').replace(/ /g, 'L')
}

function mirrorY(line, canvas, id, x, y){
	let mirrored = new Polyline({
		points: [],
		id: line.id + '-mirrored-' + id,
		type: 'other',
		selected: true,
		canvas: canvas,
		offsetX: x,
		offsetY: y,
		currentZoom: window.zoom
	})
	mirrored.el.setAttribute('type', 'other')
	line.points.forEach(function(point){
		let new_x = point.cx - window.r_axis
		if(new_x <= 0){
			new_x = Math.abs(new_x) + window.r_axis
		}else{
			new_x = window.r_axis - new_x
		}
		mirrored.appendPoint([new_x, point.cy])
	})
	return mirrored
}

/* convert a polyline points string to an array of points */
function pointsToArray(points_string){
	points_string = points_string.replace(/\s+$/g, '').replace(/, /g, ',')
	let arr = points_string.split(' ')
	let new_arr = []
	arr.forEach(function(point){
		let p = point.split(',')
		new_arr.push([parseFloat(p[0]), parseFloat(p[1])])
	})
	return new_arr
}

function importSvg(lines, canvas, id, x, y){
	lines = Array.from(lines)

	let new_lines = []
	let img_transform = false
	let img_name = ''
	let img_info
	lines.forEach(function(line){
		if(line.localName === 'polyline'){
			let obj = {
				points: [],
				id: String(id),
				type: line.getAttribute('type'),
				selected: true,
				canvas: canvas,
				offsetX: x,
				offsetY: y,
				currentZoom: window.zoom
			}
			let new_line
			if(line.getAttribute('type')==='dimension'){
				new_line = new Dimension(obj)
			}else{
				new_line = new Polyline(obj)
			}
			let stroke = line.dataset.stroke ? line.dataset.stroke : 'black'
			new_line.stroke = stroke
			new_line.el.style.stroke = stroke
			new_line.el.dataset.stroke = stroke
			new_line.el.style.fill = line.style.fill
			new_line.fill = line.style.fill
			new_line.el.setAttribute('type', line.getAttribute('type'))
			if(line.getAttribute('type')==='metric'){
				new_line.el.dataset.metric_value = line.dataset.metric_value
				new_line.el.dataset.metric_unit = line.dataset.metric_unit
			}
			if(line.getAttribute('type')==='handle_length'){
				new_line.el.dataset.handle_n = line.dataset.handle_n
			}
			if(line.getAttribute('type')==='dimension'){
				new_line.distance = parseFloat(line.dataset.distance)
				new_line.el.dataset.distance = parseFloat(line.dataset.distance)
				new_line.quotation_type = line.dataset.quotation_type
				new_line.el.dataset.quotation_type = line.dataset.quotation_type
				if(line.dataset.dimension_definition){
					new_line.el.dataset.dimension_definition = line.dataset.dimension_definition
					new_line.dimension_definition = line.dataset.dimension_definition
				}
			}
			id++

			let new_arr = pointsToArray(line.getAttribute('points'))
			new_arr.forEach(function(point){
				new_line.appendPoint(point)
			})
			new_line.stopEditing({code:'Escape'})
			new_lines.push(new_line)
		}else if(line.localName === 'image'){
			img_name = line.href.baseVal
			img_transform = line.dataset.rotation
			img_info = {x:line.x.baseVal.value, y:line.y.baseVal.value, height:line.height.baseVal.value, width:line.width.baseVal.value}
		}
	})

	return [new_lines, id, img_transform, img_name, img_info]
}

function degreeToMatrix(deg){
	//http://www.boogdesign.com/examples/transforms/matrix-calculator.html
	const deg2radians = Math.PI * 2 / 360;
	const rad = deg * deg2radians ;
	const costheta = Math.cos(rad);
	const sintheta = Math.sin(rad);

	const a = parseFloat(costheta).toFixed(8);
	const c = parseFloat(-sintheta).toFixed(8);
	const b = parseFloat(sintheta).toFixed(8);
	const d = parseFloat(costheta).toFixed(8);

	return "matrix(" + a + ", " + b + ", " + c + ", " + d + ", 0, 0)"
}

//function pathToPolylinePoints(mypath){
//	//https://stackoverflow.com/a/39405746
//	var pathLength = mypath.getTotalLength();
//	var polygonPoints= [];
//	var numPoints = 32
//	for (var i=0; i<numPoints; i++) {
//		var p = mypath.getPointAtLength(i * pathLength / numPoints)
//		polygonPoints.push([p.x, p.y])
//	}
//	return polygonPoints
//}

export {
  calc_vol,
  distance,
  calcScale,
  toD3,
  cleanedPoly,
  getCommonPoints,
  create_polygon,
  recreate_snapping_points,
  join2Polylines,
  innerProfileToPolygon,
	polyPointsToPathData,
	mirrorY,
	importSvg,
	degreeToMatrix,
}
