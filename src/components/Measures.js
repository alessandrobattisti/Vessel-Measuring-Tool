import React, { Component } from 'react';

export default class Measures extends Component {
  state = {
    vessel_weight: 0,
    vessel_weight2: 0,
    total_weight: 0,

    vessel_volume: 0,
    vessel_unit: 1,
    vessel_specific_weight: 2,

    content_specific_weight: 1,
    content_volume: 0,

    handle_volume:0,
    handle_weight:0
  }

  componentWillReceiveProps(nProp){
    //console.log(this.state.content_volume, this.state.handle_volume)
    this.setState({
      content_volume:nProp.content_volume,
      content_volume2:nProp.content_volume2,
      vessel_volume:nProp.vessel_volume,
      vessel_volume2:nProp.vessel_volume2,
      handle_volume:nProp.handle_volume,
      handle_weight:nProp.handle_volume * this.state.vessel_unit * this.state.vessel_specific_weight
    }, () => this.vesselWeightCalc())
  }

  vesselWeightCalc(){
    this.setState({
        vessel_weight: (this.state.vessel_unit *
                        this.state.vessel_specific_weight *
                        this.state.vessel_volume ) + this.state.handle_weight,
        vessel_weight2: (this.state.vessel_unit *
                         this.state.vessel_specific_weight *
                         this.state.vessel_volume2 ) + this.state.handle_weight

      }, () => {
      this.contentWeightCalc()
    })
  }

  contentWeightCalc(){
    this.setState(
      { total_weight: this.state.vessel_weight + this.state.handle_weight + (this.state.content_volume * this.state.content_specific_weight),
        total_weight2: this.state.vessel_weight2 + this.state.handle_weight + (this.state.content_volume2 * this.state.content_specific_weight),
      }
     )
  }

  contentWeightSetter(e){
    this.setState({content_specific_weight:parseFloat(e.target.value)}, () => {
      this.vesselWeightCalc()
    })
  }

  VesselUnitSetter(e){
    this.setState({vessel_unit:parseFloat(e.target.value)}, () => {
      this.vesselWeightCalc()
    })
  }

  VesselSpecWeightSetter(e){
    this.setState({vessel_specific_weight:parseFloat(e.target.value)}, () => {
      this.vesselWeightCalc()
    })
  }

  render(){
    return (
      <section id="measures">
        <h2>Measures:</h2>
          { this.props.toDo.int_prof && this.props.toDo.ref_unit
             && this.props.toDo.metric &&
            <h3>Volume</h3>
          }
        <div className="calc-buttons">
          { this.props.toDo.int_prof && this.props.toDo.ref_unit
             && this.props.toDo.metric &&
             <div className="calc-column">
               <div
                 className="interface-button2"
                 onClick={this.props.create_inner_polygon}>
                 Calc. capacity
               </div>

              { this.props.content_volume &&
               <div className="measures">
                 Volume: {this.props.content_volume.toFixed(2)} <span className="unit">dm<sup>3</sup> (liters)</span>
                 {this.props.content_volume2 &&
                  <div> 2nd Volume: {this.props.content_volume2.toFixed(2)} <span className="unit">dm<sup>3</sup> (liters)</span> </div>
                 }
               </div>
               }
             </div>
          }

          { this.props.toDo.out_prof && this.props.toDo.int_prof
            && this.props.toDo.ref_unit && this.props.toDo.metric &&
             <div className="calc-column">
              <div
                className="interface-button2"
                onClick={this.props.joinIntExt}>
                Calc. vessel body volume
              </div>

              { this.props.vessel_volume &&
               <div className="measures">
                 Volume: {this.props.vessel_volume.toFixed(2)} <span className="unit">dm<sup>3</sup> (liters)</span>
                 { this.props.vessel_volume2 &&
                  <div>
                    2nd Volume: {this.props.vessel_volume2.toFixed(2)} <span className="unit">dm<sup>3</sup> (liters)</span>
                  </div>
                 }
               </div>
               }

            </div>
        }

          { this.props.toDo.out_prof && this.props.toDo.int_prof
            && this.props.toDo.ref_unit && this.props.toDo.metric &&
            this.props.toDo.handle_sec && this.props.toDo.handle_length &&
            this.props.toDo.handle_n &&
             <div className="calc-column">
              <div
                className="interface-button2"
                onClick={this.props.handleVolume}>
                Calc. handle(s) volume
              </div>

              { this.props.vessel_volume &&
               <div className="measures">
                 Volume: {this.state.handle_volume.toFixed(2)} <span className="unit">dm<sup>3</sup> (liters)</span>
               </div>
               }

            </div>
        }

        </div>
        { this.props.toDo.out_prof && this.props.toDo.int_prof
          && this.props.toDo.ref_unit && this.props.toDo.metric &&
          this.props.vessel_volume &&  this.props.content_volume &&
        <div id="other-calc">
          <h3>Weight</h3>
          <div className="furtherCalc">
            <p>Insert specfic weight of vessel's material to calculate vessel weight:</p>
            <input id="specific-weight" type="number" defaultValue="2" min='0' step="0.01"
              onChange={this.VesselSpecWeightSetter.bind(this)}/>
            <select onChange={this.VesselUnitSetter.bind(this)}>
              <option value="1">kg/dm3</option>
              <option value="1.729994">oz/in3</option>
            </select>
            <div className="calc-results">Vessel tot. weight:
              <span id="vessel-weight"> {this.state.vessel_weight.toFixed(2)}</span>
              <span id="weight-unit"> Kg</span>
            </div>
            { this.state.vessel_volume2 &&
            <div className="calc-results">2nd Vessel tot. weight:
              <span id="vessel-weight"> {this.state.vessel_weight2.toFixed(2)}</span>
              <span id="weight-unit"> Kg</span>
            </div>
            }
            { this.state.vessel_volume2 &&
            <div className="calc-results">Vessel tot. weight mean:
              <span id="vessel-weight"> {((this.state.vessel_weight+this.state.vessel_weight2)/2).toFixed(2)}</span>
              <span id="weight-unit"> Kg</span>
            </div>
            }
          </div>
          <div className="furtherCalc">
            <p>Insert type of content to calculate full weight:</p>
            <select onChange={this.contentWeightSetter.bind(this)}>
              <option value="1">Water: (s.w. 1 kg/dm3) </option>
              <option value="0.91">Olive Oil: (s.w 0.91 kg/dm3)</option>
              <option value="0.95">Wine: (s.w. 0.95 kg/dm3)</option>
            </select>
            <div className="calc-results">Full weight:
              <span id="total-weight"> {this.state.total_weight.toFixed(2)}</span>
              <span id="weight-unit"> Kg</span>
            </div>
            { this.state.content_volume2 && this.state.vessel_volume2 &&
            <div className="calc-results">2nd Full weight:
              <span id="total-weight"> {this.state.total_weight2.toFixed(2)}</span>
              <span id="weight-unit"> Kg</span>
            </div>
            }
            { this.state.content_volume2 && this.state.vessel_volume2 &&
            <div className="calc-results">Full weight mean:
              <span id="total-weight"> {((this.state.total_weight+this.state.total_weight2)/2).toFixed(2)}</span>
              <span id="weight-unit"> Kg</span>
            </div>
            }
          </div>

        </div>
        }
        { (!this.props.toDo.int_prof || !this.props.toDo.ref_unit
          || !this.props.toDo.metric) &&
        <div id="no-calc">
          <p>No calculations available, follow the steps listed on the left</p>
        </div>
        }
      </section>
    )
  }
}
