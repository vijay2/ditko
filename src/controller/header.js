import React from 'react';


class Header extends React.Component {
  render () {


    return <header> 
                <h1>DITKO</h1>
         <a className="logo" to='/'><img src="images/22feet-logo.jpg" alt="Logo" /></a>          
        </header>
  }
}
export default Header;