import React, { Component } from 'react';
import './App.css';
import './responsive.css';
import Polyline from './svg_classes/Polyline'
import Point from './svg_classes/Point'
import ListPoly from './components/listPoly'
import Notification from './components/Notification'
import Steps from './components/Steps'
import Measures from './components/Measures'
import { calc_vol, calcScale, join2Polylines, innerProfileToPolygon,
  create_polygon, recreate_snapping_points } from './calc_functions'
const svgPanZoom = require('svg-pan-zoom')
const download = require("downloadjs")

class Draw extends Component {
  constructor(props){
    super(props)
    this.breakLine = this.breakLine.bind(this)
    this.exitBreakLineMode = this.exitBreakLineMode.bind(this)
    this.addRotAxis = this.addRotAxis.bind(this)
    this.addMetric = this.addMetric.bind(this)
    this.addMaxFill = this.addMaxFill.bind(this)
    this.resizeSvg = this.resizeSvg.bind(this)
    this.unselect_polyline = this.unselect_polyline.bind(this)
  }
  state = {
    polylines: [],
    active_polyline: undefined,
    selectedFile: '',
    img_w: 1000,
    img_h: 1000,
    notification:{id:-1,message:''},
    toDo:{image:false, rotAxis:false, metric:false,
      int_prof:false, out_prof:false, ref_unit:false, maxFill:false}
  }
  id = 0
  not_id = 0

  componentDidMount(){
    //init canvas
    this.canvas = document.getElementById('canvas')
    //initialize x,y needed to calculate svg coordinate in get_point()
    this.x = this.svg.getBoundingClientRect().left + window.scrollX
    this.y = this.svg.getBoundingClientRect().top + window.scrollY
    this.new_point = new Point([0,0], this.canvas, this.x, this.y, 1, true)
    window.addEventListener('resize', this.resizeSvg)

    //global vars
    window.snapping_points = []
    window.zoom = 1
    window.r_axis = null
    window.addEventListener('keyup', this.unselect_polyline)

    //init zoom canvas
    this.panZoomTiger = svgPanZoom('#drawing-canvas', {
      dblClickZoomEnabled: false,
      panEnabled: true,
      zoomScaleSensitivity: 0.8,
      maxZoom: 50,
      minZoom: 0.1,

      onZoom: function(e){
        window.zoom = e
        this.state.polylines.forEach(function(poly){
          poly.zoom = e
          poly.setSize( e )

          poly.points.forEach(function(point){
            point.setSize( e )
          })
          poly.midpoints.forEach(function(point){
            point.setSize( e )
          })
        })
        if(this.metric){
          this.metric.zoom = e
          this.metric.setSize( e )
        }
        if(this.rotAxis){
          this.rotAxis.zoom = e
          this.rotAxis.setSize( e )
        }
        if(this.maxFill){
          this.maxFill.zoom = e
          this.maxFill.setSize( e )
        }
        this.new_point.zoom = e
        this.new_point.setSize( e )
      }.bind(this)
    });
  }

  componentWillUnmount(){
    window.removeEventListener('resize', this.resizeSvg)
    window.removeEventListener('keyup', this.unselect_polyline)
  }

  resizeSvg(){
    this.x = this.svg.getBoundingClientRect().left+ window.scrollX
    this.y = this.svg.getBoundingClientRect().top + window.scrollY
    this.new_point = new Point([0,0], this.canvas, this.x, this.y, 1, true)
    this.state.polylines.forEach(function(el){
      el.y = this.y
      el.x = this.x
    }.bind(this))
    if(this.state.active_polyline){
      let a_p = this.state.active_polyline
      a_p.x = this.x
      a_p.y = this.y
      this.setState({active_polyline:a_p})
      this.state.active_polyline.points.forEach(function(p){
        p.x = this.x
        p.y = this.y
      }.bind(this))
    }
  }

  //////////////////////////////////////////////////////////////////////////////
  //                     CREATE, SELECT, DESELECT POLYLINE                    //
  //////////////////////////////////////////////////////////////////////////////

  create_new_polyline(type = "other"){
    this.globalStopEditingMode()

    this.addCursorPoint()
    const new_polylines = this.state.polylines
    const polyline = new Polyline({
      points: [],
      id: this.id,
      type: type,
      selected: true,
      canvas: this.canvas,
      offsetX: this.x,
      offsetY: this.y,
      currentZoom: this.panZoomTiger.getZoom()
    })
    new_polylines.push( polyline )
    this.id++
    this.setState(
      { polylines: new_polylines,
        active_polyline: polyline
      }
    )
  }

  selectLayer(id){
    if(this.state.active_polyline){
      if(this.state.active_polyline.breaking_mode){
        this.exitBreakLineMode({code:"Escape"})
      }
    }
    this.setState({active_polyline: this.getPolylineById(id)},
      ()=> {
        this.state.polylines.forEach(function(poly){
          poly.el.classList.remove('active')
        });
        this.state.active_polyline.el.classList.toggle('active')
      }
    )
  }

  //////////////////////////////////////////////////////////////////////////////
  //                                UTILITIES                                 //
  //////////////////////////////////////////////////////////////////////////////

  unselect_polyline(e){
    console.log(e.code)
    if( e.code === 'Escape' || e.code === 'KeyQ'){
      if(this.state.active_polyline){
        this.state.active_polyline.el.classList.remove('active')
        this.state.active_polyline.stopEditing({'code':'Escape'})
        if(this.state.active_polyline.editing){
          this.state.active_polyline.stopEditingPoints({'code':'Escape'})
        }
        if(this.state.active_polyline.breaking_mode){
          this.exitBreakLineMode({code: 'Escape'})
        }
      }
      this.setState({active_polyline:undefined})
      recreate_snapping_points(this.state.polylines)

      this.checkProfile('int_prof')
      this.checkProfile('out_prof')
      if(this.new_point.added){
        this.removeCursorPoint()
      }
      //remove 0 or 1 vertex polyline
      this.state.polylines.forEach(function(polyline){
        if(polyline.points.length < 2){
          this.setState({polylines: this.state.polylines.filter(el => el.id !== polyline.id)})
          this.canvas.removeChild(polyline.el)
        }
      }.bind(this))
    }
  }

  globalStopEditingMode(){
    this.state.polylines.forEach(function(poly){
      poly.el.classList.remove('active')
    })
    if(this.state.active_polyline){
      this.state.active_polyline.stopEditing({'code':'Escape'})
    }
  }

  addNotification(message){
    this.setState({notification:{ id:this.not_id, message: message }})
    this.not_id++
  }

  getPolylineById(id){
    return this.state.polylines.filter(el => el.id === id)[0]
  }

  addCursorPoint(){
    this.canvas.appendChild(this.new_point.el)
    this.new_point.added = true
    this.new_point.select()
  }

  removeCursorPoint(){
    this.canvas.removeChild(this.new_point.el)
    this.new_point.added = false
  }

  updateToDo(type, value){
    let toDo = this.state.toDo
    toDo[type] = value
    this.setState({toDo})
  }

  checkProfile(type){
    const poly1 = this.state.polylines.filter(el => el.type===type)
    if(poly1.length===0){
      this.updateToDo(type, false)
      if(type==='int_prof'){
        if(this.inner_poly){
          this.canvas.removeChild(this.inner_poly)
          this.inner_poly = null
          this.setState({vessel_capacity:null})
        }
      }
      if(this.vessel_poly){
        this.canvas.removeChild(this.vessel_poly)
        this.vessel_poly = null
        this.setState({vessel_volume:null})
      }
    }
    else if(poly1.length===1){
      this.updateToDo(type, true)
    }
    else{
      this.updateToDo(type, false)
      let profile = type === 'int_prof' ? 'internal profile' : 'outer profile'
      this.addNotification(`There should be only one ${profile}`)
    }
  }

  //////////////////////////////////////////////////////////////////////////////
  //                             JOIN POLYLINES                               //
  //////////////////////////////////////////////////////////////////////////////

  joinIntExt(){
    const poly1 = this.state.polylines.filter(el => el.type==='int_prof')[0]
    const poly2 = this.state.polylines.filter(el => el.type==='out_prof')[0]
    if(!poly1 || !poly2){
      this.addNotification("To calculate vessel volume you need both internal and outer profiles")
      return
    }
    this.vesselVolume = join2Polylines(poly1, poly2)
    if(!this.vesselVolume){
      this.addNotification("To calculate vessel volume internal and outer profiles have to share at least one vertex")
      return
    }

    if(this.vessel_poly){
      this.canvas.removeChild(this.vessel_poly)
    }
    this.vessel_poly = create_polygon(this.vesselVolume, 'rgba(170, 170, 170, 0.6)')
    const volume = calc_vol(this.vesselVolume, this.scale)
    this.setState({vessel_volume:volume})
    this.canvas.appendChild(this.vessel_poly)
  }

  create_inner_polygon(){
    let poly = this.state.polylines.filter(el => el.type==='int_prof')
    if(poly.length===0){
      this.addNotification("To calculate vessel capacity you need an internal profile")
      return
    }
    if(this.inner_poly){
      this.canvas.removeChild(this.inner_poly)
    }
    //define inner polygon points based on inner profile and rotation axis
    this.innerPolygon = innerProfileToPolygon(poly[0].points.slice())
    //create svg polygon
    this.inner_poly = create_polygon(this.innerPolygon, 'rgba(210, 204, 78, 0.28)')

    if(this.scale){
      const volume = calc_vol(this.innerPolygon, this.scale)
      this.setState({vessel_capacity:volume})
    }else{
      this.addNotification('Can\'t measure, define scale first')
    }
    this.canvas.appendChild(this.inner_poly)
  }

  //////////////////////////////////////////////////////////////////////////////
  //              ADD REFERENCE SCALE rotation axis AND MAX FILL               //
  //////////////////////////////////////////////////////////////////////////////

  metricForm(obj){
    if(obj.ref_unit){
      this.updateToDo('ref_unit', true)
      this.setState({metric_value:obj.value, metric_unit: obj.unit}, () => {
        if(this.metric && this.metric.points.length===2){
          this.scale = calcScale(this.metric, this.state.metric_value, this.state.metric_unit)
          //update volume info when metric info are updated
          if(this.innerPolygon){
            this.setState({vessel_capacity:calc_vol(this.innerPolygon, this.scale)})
          }
          if(this.vesselVolume){
            this.setState({vessel_volume:calc_vol(this.vesselVolume, this.scale)})
          }
        }
      })
    }else{
      this.updateToDo('ref_unit', false)
      this.scale = null
    }
  }

  defineMaxFill(){
    //remove maxFill if present
    if(this.maxFill){
      this.canvas.removeChild(this.maxFill.el)
      this.updateToDo('maxFill', false)
    }
    //create new maxFill polyline
    this.maxFill = new Polyline({
      points: [],
      id: 'max_fill',
      type: 'max_fill',
      selected: false,
      canvas: this.canvas,
      offsetX: this.x,
      offsetY: this.y,
      currentZoom: this.panZoomTiger.getZoom()
    })
    //start editing
    this.addCursorPoint()
    this.canvas.addEventListener('dblclick', this.addMaxFill)
    this.maxFill.stopEditing({code:'Escape'})
  }

  addMaxFill(e){
    this.maxFill.stroke = 'rgb(0, 255, 21)'
    this.maxFill.add_point(e)
    this.canvas.appendChild(this.maxFill.el)
    this.maxFill.draw()
    //exit editing mode
    this.maxFill.el.classList.remove('active')
    this.canvas.removeEventListener('dblclick', this.addMaxFill)
    this.maxFill.stopEditing({'code':'Escape'})
    this.removeCursorPoint()
    //update global var and toDo
    window.maxFill = this.maxFill.points[0].cy
    this.updateToDo('maxFill', true)
  }

  defineMetric(){
    this.unselect_polyline({code:"Escape"})
    //remove metric if present
    if(this.metric){
      this.canvas.removeChild(this.metric.el)
      this.updateToDo('metric', false)
    }
    //create new metric polyline
    this.metric = new Polyline({
      points: [],
      id: 'metric',
      type: 'metric',
      selected: false,
      canvas: this.canvas,
      offsetX: this.x,
      offsetY: this.y,
      currentZoom: this.panZoomTiger.getZoom()
    })
    //start editing
    this.addCursorPoint()
    this.canvas.addEventListener('dblclick', this.addMetric)
    this.metric.stopEditing({code:'Escape'})
  }

  addMetric(e){
    if(this.metric.points.length === 0){
      this.metric.add_point(e)
    }
    else if(this.metric.points.length === 1){
      //this is the 2nd point, add it and exit editing
      this.metric.add_point(e)
      this.metric.stroke = 'red'
      this.metric.stopEditing({code:"Escape"})
      //set color
      this.metric.el.classList.remove('active')
      //stop editing
      this.canvas.removeEventListener('dblclick', this.addMetric)
      this.updateToDo('metric', true)
      this.removeCursorPoint()
      if(this.state.metric_value && this.state.metric_unit){
        this.scale = calcScale(this.metric, this.state.metric_value, this.state.metric_unit)
      }
      //update volume info when metric info are updated
      if(this.innerPolygon){
        this.setState({vessel_capacity:calc_vol(this.innerPolygon, this.scale)})
      }
      if(this.vesselVolume){
        this.setState({vessel_volume:calc_vol(this.vesselVolume, this.scale)})
      }

    }
  }

  definerotAxis(){
    //remove if already present
    if(this.rotAxis){
      this.canvas.removeChild(this.rotAxis.el)
      window.r_axis = null
      this.updateToDo('rotAxis', false)
    }
    //start editing
    this.addCursorPoint()
    this.canvas.addEventListener('dblclick', this.addRotAxis)
  }

  addRotAxis(e){
    //create rotation axis polyline
    this.rotAxis = new Polyline({
      points: [],
      id: this.id,
      type: 'center',
      selected: true,
      canvas: this.canvas,
      offsetX: this.x,
      offsetY: this.y,
      currentZoom: this.panZoomTiger.getZoom()
    })
    this.rotAxis.stroke = '#ff5a00'
    this.rotAxis.add_point(e)
    this.canvas.appendChild(this.rotAxis.el)
    this.rotAxis.draw()
    //exit editing mode
    this.rotAxis.el.classList.remove('active')
    this.canvas.removeEventListener('dblclick', this.addRotAxis)
    this.rotAxis.stopEditing({'code':'Escape'})
    this.removeCursorPoint()
    //update global var and toDo
    window.r_axis = this.rotAxis.points[0].cx
    this.updateToDo('rotAxis', true)
  }

  //////////////////////////////////////////////////////////////////////////////
  //                              LAYER EDITING                               //
  //////////////////////////////////////////////////////////////////////////////

  colorChange(id, color){
    const my_polyline = this.getPolylineById(id)
    my_polyline.stroke = color
    my_polyline.draw()
  }

  typeChange(id, type){
    this.setState(
      {polylines: this.state.polylines.map(el =>
        {
          if(el.id===id){
            el.type = type
            return el
          }
          return el
        })
      }, ()=> { this.checkProfile('int_prof'); this.checkProfile('out_prof') }
    )
  }

  delete_line(){
    this.globalStopEditingMode()
    if(!this.state.active_polyline){
      this.addNotification("No line selected")
      return
    }
    this.canvas.removeChild(this.state.active_polyline.el)
    this.setState({
      polylines:this.state.polylines.filter(
        el => el.id !== this.state.active_polyline.id),
        active_polyline: undefined
      }, ()=> {
        this.checkProfile('int_prof');
        this.checkProfile('out_prof');
        recreate_snapping_points(this.state.polylines)
      }
    )
  }

  edit_line(){
    this.globalStopEditingMode()
    if(!this.state.active_polyline){
      this.addNotification("No line selected")
      return
    }
    this.state.active_polyline.editLine()
  }

  //////////////////////////////////////////////////////////////////////////////
  //                             LAYER BREAKING                               //
  //////////////////////////////////////////////////////////////////////////////

  enterBreakLineMode(){
    this.globalStopEditingMode()
    //check if breaking selected line is possible
    if(!this.state.active_polyline){
      this.addNotification("No line selected")
      return
    }
    if(this.state.active_polyline.points.length <= 2){
      this.addNotification("Line has two or less vertices and can't be subdivided")
      return
    }
    //update active polyline breaking mode status
    let active_polyline = this.state.active_polyline
    active_polyline.breaking_mode = true
    this.setState({active_polyline})
    //add breaking points to canvas
    let x = 0
    this.state.active_polyline.points.forEach(function(point) {
      if(x>0 && x!==this.state.active_polyline.points.length-1){
        this.canvas.appendChild(point.el)
        point.draw()
        point.el.addEventListener('click', this.breakLine)
      }
      x++
    }.bind(this))
  }

  exitBreakLineMode(e){
    //remove breaking points from canvas
    if ((e.code === 'Escape' || e.code === 'KeyQ') && this.state.active_polyline.breaking_mode) {
      let x = 0
      this.state.active_polyline.points.forEach(function(point) {
        if(x>0 && x!== this.state.active_polyline.points.length-1){
          point.el.removeEventListener('click', this.breakLine)
          this.canvas.removeChild(point.el)
        }
        x++
      }.bind(this))
      //update active polyline breaking mode status
      let active_polyline = this.state.active_polyline
      active_polyline.breaking_mode = false
      this.setState({active_polyline})
    }
  }

  breakLine(e){
    const break_point = [e.target.getAttribute('cx'), e.target.getAttribute('cy')]
    this.exitBreakLineMode({code: 'Escape'})
    //instantiate polyline list to edit
    const new_polylines = this.state.polylines
    //create a new polyline
    let polyline = new Polyline({
      points: [],
      id: this.id,
      type: 'other',
      selected: false,
      canvas: this.canvas,
      offsetX: this.x,
      offsetY: this.y,
      currentZoom: this.panZoomTiger.getZoom()
      }
    )
    //loop over the polyine to break and add point to new polyline until you get to the breaking point
    this.state.active_polyline.points.forEach(function(point) {
      polyline.appendPoint([point.cx, point.cy])
      if(point.cx===parseFloat(break_point[0]) && point.cy===parseFloat(break_point[1])){
        //save draw and exit editing mode
        polyline.el.classList.remove('active')
        new_polylines.push( polyline )
        this.id++
        polyline.draw()
        polyline.stopEditing({'code':'Escape'})
        //create a new polyline with starting point the breaking point
        polyline = new Polyline({
          points: [],
          id: this.id,
          type: 'other',
          selected: true,
          canvas: this.canvas,
          offsetX: this.x,
          offsetY: this.y,
          currentZoom: this.panZoomTiger.getZoom()
          })
        polyline.appendPoint([point.cx, point.cy])
      }
    }.bind(this))
    //save draw and exit editing mode for sencond line
    new_polylines.push(polyline)
    this.id++
    polyline.draw()
    polyline.stopEditing({'code':'Escape'})
    //delete orignal broken line and exit editing mode
    this.state.active_polyline.stopEditing({'code':'Escape'})
    this.canvas.removeChild(this.state.active_polyline.el)
    //update the state with the two new lines without the old one
    this.setState(
      { polylines: new_polylines.filter(el=>el.id!==this.state.active_polyline.id),
        active_polyline: polyline
      }
    )
  }

  //////////////////////////////////////////////////////////////////////////////
  //                              HANDLE IMAGE                                //
  //////////////////////////////////////////////////////////////////////////////

  image_rotate(e){
    this.bck_image.style.transform = `rotate(${e.target.value}deg)`
  }

  fileChangedHandler(e){
    let img_name = e.target.value.split("\\")
    img_name = img_name[img_name.length-1]
    this.setState({img_name})
    var img = new Image();
    img.src = window.URL.createObjectURL( e.target.files[0] );
    img.onload = function() {
        var width = img.naturalWidth
        var height = img.naturalHeight
        let toDo = this.state.toDo
        toDo.image = true
        this.setState({
          img_w:width,
          img_h:height,
          selectedFile: img.src,
          toDo: toDo
         })
    }.bind(this)
  }

  //////////////////////////////////////////////////////////////////////////////
  //                                 DOWNLOAD                                 //
  //////////////////////////////////////////////////////////////////////////////

  download_svg(){
    if(this.state.polylines.length===0){
      this.addNotification('No polylines to export')
      return
    }
    let saved_path = this.state.selectedFile
    if(this.state.img_name){
      this.setState({selectedFile:this.state.img_name.replace('href':'xlink:href')}, ()=> {
        download(this.svg.outerHTML, "dlText.svg", "text/plain");
        this.setState({selectedFile:saved_path})
      })
    }else{
      download(this.svg.outerHTML, "myVessel.svg", "text/plain");
    }
  }

  download_dxf(){
    if(this.state.polylines.length===0){
      this.addNotification('No polylines to export')
      return
    }
    if(!this.scale){
      this.addNotification('You need to define a reference scale before export')
      return
    }
    var makerjs = require('makerjs');
    let models = {models:{}}
    let x = 1
    this.state.polylines.forEach(function(polyline){
      let points = polyline.el.getAttribute('points');
      let closed = false; //true for SVG polygon, false for SVG polyline
      let model = makerjs.model.mirror(new makerjs.models.ConnectTheDots(closed, points), false, true);
      model = makerjs.model.scale(model, this.scale/10)
      models.models[`my-${x}-line`] = model
      x++
    }.bind(this))
    models.units = makerjs.units.Meter;
    let file = makerjs.exporter.toDXF(models, {units:makerjs.unitType.Meter})
    download(file, "myVessel.dxf", "text/plain");
  }

  download_json(){
    let title = 'myVessel'
    let coordinates, author, description = ''

    let int_prof = this.state.polylines.filter(el=>el.type==='int_prof')
    if(int_prof.length > 0){
      int_prof = int_prof[0]
    }else{
      this.addNotification('No inner profile to export')
      return
    }
    if(!this.scale){
      this.addNotification('You need to define a reference scale before export')
      return
    }
    coordinates = []
    int_prof.points.forEach(function(point){
      // scale the point - unit will be dm - convert to cm - invert y axis
      coordinates.push( [point.cx*this.scale/10, point.cy*this.scale/10*-1] )
    }.bind(this))
    coordinates = JSON.stringify(coordinates)
    let json = `{ "type": "Feature",
                  "geometry": {
                    "type": "LineString",
                      "coordinates": ${coordinates}
                    },
                  "properties": {
                    "title": "${title}",
                    "description": "${description}",
                    "author": "${author}"
                  }
                }`
    this.addNotification('Export completed')
    download(json, `${title}.json`, "text/plain");
  }

    //////////////////////////////////////////////////////////////////////////////
    //                                  RENDER                                  //
    //////////////////////////////////////////////////////////////////////////////

    render() {
      return (
          <div id="container">

            <Notification notification={this.state.notification} />

            <h2>Draw</h2>
            <section id="drawing">
              <svg id="drawing-canvas" height="500" width="100%" ref={svg => {this.svg = svg}}>
                <g className="svg-pan-zoom_viewport" id="canvas">
                  <image ref={bck_image => {this.bck_image=bck_image}}
                    id="bck-img" href={this.state.selectedFile} x="0" y="0"
                    height={this.state.img_h} width={this.state.img_w}/>
                </g>
              </svg>
              <div className="tools">
                <div id="actions-title">Actions:</div>
                <div
                  className="interface-button"
                  onClick={this.create_new_polyline.bind(this)}
                  title="Create new line"
                  alt="Create new line"
                >
                  New
                </div>
                <div
                  className="interface-button"
                  onClick={this.enterBreakLineMode.bind(this)}
                  title="Break selected line"
                  alt="Break selected line"
                  >
                  Break
                </div>
                <div
                  className="interface-button"
                  onClick={this.delete_line.bind(this)}
                  title="Delete selected line"
                  alt="Delete selected line"
                  >
                  Delete
                </div>
                <div
                  className="interface-button"
                  onClick={this.edit_line.bind(this)}
                  title="Edit selected line"
                  alt="Edit selected line"
                  >
                  Edit
                </div>

                <div id="actions-title2">Export:</div>
                <div
                  className="interface-button"
                  onClick={this.download_svg.bind(this)}
                  title="Download SVG (no scaling)"
                  alt="Download SVG (no scaling)"
                  >
                  SVG
                </div>
                <div
                  className="interface-button"
                  onClick={this.download_dxf.bind(this)}
                  title="Download all-lines as DXF (scaled: 1 unit = 1 meter)"
                  alt="Download all-lines as DXF (scaled: 1 unit = 1 meter)"
                  >
                  DXF
                </div>
                <div
                  className="interface-button"
                  onClick={this.download_json.bind(this)}
                  title="Download inner-profile as JSON (scaled: 1 unit = 1 meter)"
                  alt="Download inner-profile as JSON (scaled: 1 unit = 1 meter)"
                >
                  JSON
                </div>
              </div>
            </section>

            <section id="polylines">
              <div id="layer-title">Layers:</div>
                {this.state.toDo.image && <div id="image-layer" className="polyline-layer">
                  <div className="slidecontainer">
                   <label htmlFor="myRange">Rotate image</label>
                   <input
                     type="number" min="0" max="360" defaultValue="0"
                     className="slider" id="myRange" step="0.01"
                     onChange={this.image_rotate.bind(this)}
                     />
                 </div>
               </div>}
                {this.state.polylines.map(el =>
                  <ListPoly
                    key={el.id}
                    name={el.name}
                    type={el.type}
                    id={el.id}
                    delete_line={this.delete_line.bind(this)}
                    edit_line={this.edit_line.bind(this)}
                    colorChange={this.colorChange.bind(this)}
                    typeChange={this.typeChange.bind(this)}
                    selectLayer={this.selectLayer.bind(this)}
                    selectedPoly={this.state.active_polyline ? this.state.active_polyline.id : ''}
                    />
                )}
            </section>
            <div className="basic-info">
              Double-left-click to draw a point, single left-click and hold to pan the view,
              single left-click to select vertices (in edit and break mode),
              mouse wheel scroll to zoom in and out. Click the listed lines in the Layer section to select a line.
              Press <code>Esc</code> or <code>q</code> to quit editing mode and deselect.
            </div>
            <Steps
              toDo={this.state.toDo}
              fileChangedHandler={this.fileChangedHandler.bind(this)}
              definerotAxis={this.definerotAxis.bind(this)}
              defineMetric={this.defineMetric.bind(this)}
              handleForm={this.metricForm.bind(this)}
              create_new_polyline={this.create_new_polyline.bind(this)}
              defineMaxFill={this.defineMaxFill.bind(this)}
              />

            <Measures
              toDo={this.state.toDo}
              vessel_volume={this.state.vessel_volume}
              content_volume={this.state.vessel_capacity}
              joinIntExt={this.joinIntExt.bind(this)}
              create_inner_polygon={this.create_inner_polygon.bind(this)}
            />

          </div>
      );
    }
  }

  export default Draw;

  //get point coordinates from event
  //get_point(e){
  //  const matrix = this.canvas.transform.baseVal[0].matrix
  //  const newPoint =  [((e.pageX-matrix.e-this.x)/matrix.a),((e.pageY-matrix.f-this.y)/matrix.a)]
  //  return newPoint
  //}
  //
  //
  //<Measures />
  //joinTwoPolylines(poly1, poly2){
  //  const new_poly = join2Polylines(poly1, poly2)
  //
  //  if(!new_poly){
  //    this.addNotification("Not joinable")
  //    return
  //  }
  //  return joined_poly
  //
  //  //const joined_poly = new Polyline({
  //  //  points: cleanedPoly(new_poly),
  //  //  id: this.id,
  //  //  type: poly1.type,
  //  //  selected: true,
  //  //  canvas: this.canvas,
  //  //  offsetX: this.x,
  //  //  offsetY: this.y,
  //  //  currentZoom: this.panZoomTiger.getZoom()
  //  //})
  //  //joined_poly.stopEditing({code:'Escape'})
  //  //this.canvas.removeChild(joined_poly.el)
  //  //this.id++
  //
  //  //this.canvas.removeChild(poly1.el)
  //  //this.canvas.removeChild(poly2.el)
  //  //this.canvas.appendChild(joined_poly.el)
  //  //joined_poly.draw()
  ////
  //  //let new_polylines = this.state.polylines.filter(el => el.id!==poly1.id && el.id !==poly2.id )
  //  //new_polylines.push(joined_poly)
  //  //this.addNotification(message)
  //  //this.setState(
  //  //  { polylines: new_polylines,
  //  //    notification:{ id:this.not_id, message: message },
  //  //    active_polyline: joined_poly
  //  //  }
  //  //)
  //  //this.not_id++
  //}
  //joinTwoLines(){
  //  //TODO
  //  this.addNotification("Select first line")
  //}
  //<div
  //  className="interface-button"
  //  onClick={this.joinTwoLines.bind(this)}>
  //  Join 2 lines
  //</div>
