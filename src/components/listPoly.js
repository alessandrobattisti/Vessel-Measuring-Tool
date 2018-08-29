import React, { Component } from 'react';

export default class ListPoly extends Component {
  state = {
    types : [
      {val: 'other', text: 'Other'},
      {val: 'int_prof', text: 'Inner profile'},
      {val: 'out_prof', text: 'Outer profile'},
      {val: '2_int_prof', text: '2nd Inner profile'},
      {val: '2_out_prof', text: '2nd Outer profile'},
      {val: 'handle_length', text: 'Handle length'},
      {val: 'handle_sec', text: 'Handle section'},
      {val: 'handle_pro', text: 'Handle profile'},
      {val: 'decoration', text: 'Decoration'},
    ],
    colors : [
      {val: 'magenta', text: 'Magenta'},
      {val: '#1d47ff', text: 'Blue'},
      {val: '#ff3b30', text: 'Red'},
      {val: '#4bea4b', text: 'Green'},
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
        >
        <div>
          <select id="select-type" defaultValue={this.props.type} onClick={(e)=>e.stopPropagation()} onChange={this.typeChange.bind(this)} ref={type => this.type = type}>
            {this.state.types.map(el =>
              <option value={el.val} key={el.val}>{el.text}</option>
            )}
          </select>
        </div>
        <div>
          <select id="select-color" onClick={(e)=>e.stopPropagation()} onChange={this.colorChange.bind(this)} ref={color => this.color = color}>
            {this.state.colors.map(el =>
              <option value={el.val} key={el.val}>{el.text}</option>
            )}
          </select>
        </div>
        <div><span></span></div>
      </div>
    )
  }
}
