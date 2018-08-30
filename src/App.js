import React, { Component } from 'react';
import './App.css';
import './responsive.css';
import { Route, Switch, Link} from 'react-router-dom'
import Draw from './Draw'
class App extends Component {

  render() {
    return (
      <div className="App">
        <header>
          <h1 className="App-header">
            <Link to="/">VMT <span className="subtitle">Vessel Measuring Tool</span></Link>
          </h1>

          <Link className="about-link" to="/about">About</Link>
        </header>

        <Route exact path='/' component={Draw} />

        <Route path='/about' component={About}/>

        {/* This switch handle 404 pages */}
        <Switch>
          <Route exact path='/' />
          <Route exact path='/about' />
          <Route component={NoMatch} />
        </Switch>

      </div>
    );
  }
}

class About extends Component{
  render(){
    return (
      <div id="container" className="not-found about">
        <h2>About</h2>
        <h4>What is this?</h4>
        <p>This is a simple webapp written in javascript using ReactJs Framework.
          It can be used to digitize archeological drawings of vessels in order to calculate their capacity and weight.
        </p>
        <h4>How does it work?</h4>
        <p>You can watch this youtube video that show how to use this app. If you have problems you can contact me or open an issue on github.</p>
          <p><iframe width="560" height="315" title="tutorial" src="https://www.youtube.com/embed/5gUycvQceKA"
            frameBorder="0" allow="encrypted-media" allowFullScreen></iframe>
        </p>
        <h4>Saving</h4>
        <p>After you have digitized your drawing you can download your file in three differents formats:</p>
        <ul>
          <li><b>SVG</b>: the complete drawing as is, without scaling, you can open it with Inkscape or Illustrator.</li>
          <li><b>DXF</b>: all the lines will be scaled so that 1 drawing unit will be equal to 1 m.</li>
          <li><b>JSON</b>: only the inner profile will be downloaded in a format that can be used with this alternative
            project <a target="_blank" rel="noopener noreferrer" href="https://kotyle.readthedocs.io/en/latest/intro.html">link1</a>
            , <a target="_blank" rel="noopener noreferrer" href="https://bitbucket.org/iosa/kotyle/src/default/">link2</a>.
          </li>
        </ul>

        <h4>Source code</h4>
        <p>This is an open source project you can find the source code at this link
          on <a target="_blank" rel="noopener noreferrer" href="https://github.com/alessandrobattisti/Vessel-Measuring-Tool">Github</a>.
          You can download and use this webapp even without an internet connection, after you've downloded the source code
          you can open the <code>index.html</code> file in the <code>build</code> folder with any modern browser and start measuring
          your vessels.
        </p>

        <h4>Alternatives</h4>
        <p>
        There are many other projects that calculate vessel capacity, it this projects doesn't work for you you should
          check them out. You can find a list at
          this <a target="_blank" rel="noopener noreferrer" href="https://kotyle.readthedocs.io/en/latest/other.html">link</a>.
        </p>

        <h4>Limitations</h4>
        <p>
        Although this webapp displays nicely on different devices, drawing capacity is currently available only using a mouse.
        </p>

        <h4>Dependencies</h4>
        <p>This app has been built using these javascript libraries:</p>
        <ul>
          <li><a target="_blank" rel="noopener noreferrer" href="https://reactjs.org/"> ReactJs </a></li>
          <li><a target="_blank" rel="noopener noreferrer" href="https://github.com/facebook/create-react-app/"> Create react app </a></li>
          <li><a target="_blank" rel="noopener noreferrer" href="https://reacttraining.com/react-router/"> React Router </a></li>
          <li><a target="_blank" rel="noopener noreferrer" href="https://github.com/ariutta/svg-pan-zoom"> SvgPanZomm </a></li>
          <li><a target="_blank" rel="noopener noreferrer" href="https://maker.js.org"> MarkerJs </a></li>
          <li><a target="_blank" rel="noopener noreferrer" href="https://github.com/d3/d3-polygon"> D3Polygon </a></li>
          <li><a target="_blank" rel="noopener noreferrer" href="https://github.com/rndme/download"> DowloadJs </a></li>
        </ul>
        <Link className="go-back-link" to="/"><p className="go-back">Back to main page</p></Link>
      </div>
    )
  }
}

class NoMatch extends Component{
  render(){
    return (
      <div id="container" className="not-found">
        <h2>404 - Not found</h2>
        <p>Page not found</p>

        <Link className="go-back-link" to="/"><p className="go-back">Back to main page</p></Link>
      </div>
    )
  }
}
export default App;
