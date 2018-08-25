import React, { Component } from 'react';

export default class Notification extends Component {
  state = {
    id: -1
  }
  componentWillReceiveProps(nextProps){
    if(nextProps.notification.id!==this.state.id){
      this.setState({id:nextProps.notification.id})
      this.notification.innerHTML = nextProps.notification.message
      this.notification.style.display = "block"
      setTimeout(()=>this.notification.style.display="none", 1500)
    }
  }
  render(){
    return (
      <section id="notification" ref={notification=>this.notification=notification}></section>
    )
  }
}
