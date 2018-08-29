import React, { Component } from 'react';

export default class Steps extends Component {
  metricForm(){
    const value = this.ref_val.value
    const unit = this.reference_unit.value
    if(value&&unit){
      this.props.handleForm({ref_unit: true, value:value, unit:unit})
    }else{
      this.props.handleForm({ref_unit: false, value:value, unit:unit})
    }
  }
  nHandleForm(){
    const value = this.handle_n.value
    if(value){
      this.props.nHandleForm({handle_n: true, value:value})
    }else{
      this.props.nHandleForm({handle_n: false, value:0})
    }
  }
  render(){
    return (
      <section id="steps">
        <h2>Steps:</h2>
        <ul>
          <li>
            <div className={this.props.toDo.image ? "done" : "to-do"}>
            </div>
            <div className="to-do-list">
              1. Select image
            </div>
            <div className="do-it">
              <input
                className="hidden"
                type="file"
                accept=".jpg, .jpeg, .png"
                id="file-uploader"
                onChange={this.props.fileChangedHandler}>
              </input>
              <label htmlFor="file-uploader">Select file</label>
            </div>
          </li>
          <li>
            <div className={this.props.toDo.rotAxis ? "done" : "to-do"}>
            </div>
            <div className="to-do-list">
              2. Draw rotation axis
            </div>
            <div className="do-it">
              <button onClick={this.props.definerotAxis}>Draw rotation axis</button>
            </div>
          </li>
          <li>
            <div className={this.props.toDo.metric ? "done" : "to-do"}>
            </div>
            <div className="to-do-list">
              3. Draw reference scale
            </div>
            <div className="do-it">
              <button onClick={this.props.defineMetric}>Draw reference scale</button>
            </div>
          </li>
          <li>
            <div className={this.props.toDo.ref_unit ? "done" : "to-do"}>
            </div>
            <div className="to-do-list">
              4. Define reference scale length
            </div>
            <div className="do-it">
                <input type="number" id="ref-scale" min="0" step="0.01"
                  value={this.props.metric_value}
                  onChange={this.metricForm.bind(this)} ref={ref_val => {this.ref_val = ref_val}}>
                </input>
                <select
                  value={this.props.metric_unit}
                  ref={reference_unit => {this.reference_unit = reference_unit}}
                  onChange={this.metricForm.bind(this)}
                >
                  <option value="cm">Cm</option>
                  <option value="inch">Inches</option>
                </select>
            </div>
          </li>
          <li>
            <div className={this.props.toDo.int_prof ? "done" : "to-do"}>
            </div>
            <div className="to-do-list">
              5. Draw inner profile
            </div>
            <div className="do-it">
              <button onClick={()=>this.props.create_new_polyline('int_prof')}>Draw line</button>
            </div>
          </li>
          <li>
            <div className={this.props.toDo.out_prof ? "done" : "to-do-optional"}>
            </div>
            <div className="to-do-list">
              6. Draw outer profile
            </div>
            <div className="do-it">
              <button onClick={()=>this.props.create_new_polyline('out_prof')}>Draw line</button>
            </div>
          </li>
          <li>
            <div className={this.props.toDo.maxFill ? "done" : "to-do-optional"}>
            </div>
            <div className="to-do-list">
              7- Draw max fill limit
            </div>
            <div className="do-it">
              <button onClick={this.props.defineMaxFill}>Draw max fill limit</button>
            </div>
          </li>
          <li>
            <div className={this.props.toDo.handle_length ? "done" : "to-do-optional"}>
            </div>
            <div className="to-do-list">
              8- Draw handle length
            </div>
            <div className="do-it">
              <button onClick={()=>this.props.create_new_polyline('handle_length')}>Draw handle length</button>
            </div>
          </li>
          <li>
            <div className={this.props.toDo.handle_sec ? "done" : "to-do-optional"}>
            </div>
            <div className="to-do-list">
              9- Draw handle section
            </div>
            <div className="do-it">
              <button onClick={()=>this.props.create_new_polyline('handle_sec')}>Draw handle section</button>
            </div>
          </li>
          <li>
            <div className={this.props.toDo.handle_n ? "done" : "to-do-optional"}>
            </div>
            <div className="to-do-list">
              10- Number of handles
            </div>
            <div className="do-it">
              <input type="number" id="ref-scale" step="1" min="0"
                onChange={this.nHandleForm.bind(this)}
                value={this.props.handle_n}
                ref={handle_n => {this.handle_n = handle_n}}></input>
            </div>
          </li>

        </ul>
      </section>
    )
  }
}
