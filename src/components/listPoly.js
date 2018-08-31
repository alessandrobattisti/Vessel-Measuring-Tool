import React, { Component } from 'react';
import SimpleLineIcon from 'react-simple-line-icons';


export default class ListPoly extends Component {
  state = {
    types : [
      {val: 'other', text: 'Other'},
      {val: 'int_prof', text: 'Inner profile'},
      {val: 'out_prof', text: 'Outer profile'},
      {val: 'int_prof2', text: '2nd Inner profile'},
      {val: 'out_prof2', text: '2nd Outer profile'},
      {val: 'handle_length', text: 'Handle length'},
      {val: 'handle_sec', text: 'Handle section'},
      {val: 'handle_pro', text: 'Handle profile'},
      {val: 'decoration', text: 'Decoration'},
    ],
    colors : [
      {val: '', text: 'Set color'},
      {val: 'magenta', text: 'Magenta'},
      {val: '#1d47ff', text: 'Blue'},
      {val: '#ff3b30', text: 'Red'},
      /*{val: '#4bea4b', text: 'Green'},*/
      {val: 'black', text: 'Black'},
      {val: 'white', text: 'White'},
    ]
  }

  colorChange(e){
    this.props.colorChange(this.props.id, e.target.value)
    this.color.value = e.target.value
  }

  typeChange(e){
    this.props.typeChange(this.props.id, e.target.value)
    this.type.value = e.target.value
  }

  render(){
    return (
      <div
        className={(this.props.selectedPoly === this.props.id) ? "polyline-layer polyline-active" : "polyline-layer"}
        onClick={()=>this.props.selectLayer(this.props.id)}
        onMouseOver={()=>this.props.lightSelectLayer(this.props.id)}
        onMouseOut={()=>this.props.lightSelectActive()}
        >
        <div>
          <select id="select-type" value={this.props.type}
            onClick={(e)=>e.stopPropagation()}
            onChange={this.typeChange.bind(this)}
            ref={type => this.type = type}>
            {this.state.types.map(el =>
              <option value={el.val} key={el.val}>{el.text}</option>
            )}
          </select>
        </div>
        <div>
          <select id="select-color" defaultValue={this.props.color} onClick={(e)=>e.stopPropagation()}
            onChange={this.colorChange.bind(this)} ref={color => this.color = color}>
            {this.state.colors.map(el =>
              <option value={el.val} key={el.val}>{el.text}</option>
            )}
          </select>
        </div>
      {/*   <div className="icon-edit-layer"><SimpleLineIcon size="Small" name="arrow-up" onClick={()=>this.props.layerMove('up', this.props.id)}/></div>
        <div className="icon-edit-layer"><SimpleLineIcon size="Small" name="arrow-down" onClick={()=>this.props.layerMove('down', this.props.id)}/></div>*/}
        <div className="edit-delete">
          <div className="icon-edit-layer"
            onClick={(e)=>{
              e.stopPropagation();
              this.props.edit_line(this.props.id)
            }}>
            <SimpleLineIcon size="Small" name="pencil"/>
          </div>
          <div className="icon-edit-layer"
            onClick={(e)=>{
              e.stopPropagation();
              this.props.delete_line(this.props.id)
            }}>
            <SimpleLineIcon size="Small" name="trash"/>
          </div>
        </div>
      </div>
    )
  }
}
