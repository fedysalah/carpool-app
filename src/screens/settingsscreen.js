import React, {Component} from 'react';

export default class SettingsScreen extends Component {
  state = {
      running: false
    };

  signOut = () => {
    this.props.signOut();
  };

  render() {
    const toggle = __DEV__ ? 'toggle active' : 'toggle';
    return (
      <div>
        <header className="bar bar-nav">
          <h1 className="title">Settings</h1>
        </header>
        <div className="content">
          <div style={{ textAlign: 'center' }}>
            <img src="https://i1.wp.com/www.winhelponline.com/blog/wp-content/uploads/2017/12/user.png?resize=256%2C256&quality=100"
                 style={{ margin: 20, width: 100, height: 100, borderRadius: '50%' }}/>
          </div>
          <ul className="table-view">
            <li className="table-view-cell">
              User : {this.props.auth.displayName}
            </li>
           {/* <li className="table-view-cell">
              Vibration API
              <div className={toggleVibration}>
                <div className="toggle-handle"></div>
              </div>
            </li>*/}
          </ul>
          <div style={{ margin: 20, textAlign: 'center' }}>
            <button className="btn btn-negative btn-block btn-outlined" onClick={this.signOut}>Sign out</button>
          </div>
        </div>
      </div>
    );
  }
};
