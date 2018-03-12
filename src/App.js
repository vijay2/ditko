import React, { Component } from 'react';
import './App.css';
import Header from './controller/header';
import Facebook from './controller/facebook';

class App extends Component {
  render() {
    return (
      <div className="App">
        <Header />
        <Facebook />

      </div>
    );
  }
}

export default App;
