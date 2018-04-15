import React, {Component} from 'react';
import 'firebase/auth'

export default class SettingsScreen extends Component {
  state = {
      running: false
    };
  processArchives = () => {
    this.setState({ running: true }, () => {
      this.props.store.computeFromBeginning(() => this.setState({ running: false }));
    });
  };

  signOut = () => {
    this.props.signOut();
  };

  render() {
    const buttonClass = this.state.running ? 'btn' : 'btn btn-negative';
    const buttonTitle = this.state.running ? 'Running ...' : 'Run';
    const toggle = __DEV__ ? 'toggle active' : 'toggle';
    const toggleVibration = (window.navigator && window.navigator.vibrate) ? 'toggle active' : 'toggle';
    return (
      <div>
        <header className="bar bar-nav">
          <h1 className="title">Settings</h1>
        </header>
        <div className="content">
          <div style={{ textAlign: 'center' }}>
            <img src={this.props.auth.photoURL} style={{ margin: 20, width: 100, height: 100, borderRadius: '50%' }}/>
          </div>
          <ul className="table-view">
            <li className="table-view-cell">
              User : {this.props.auth.displayName}
            </li>
            <li className="table-view-cell">
              UID : {this.props.auth.uuid}
            </li>
            <li className="table-view-cell">
              Re-process archives
              <button className={buttonClass} onClick={this.processArchives}>
                {buttonTitle}
              </button>
            </li>
            <li className="table-view-cell">
              DEV Build
              <div className={toggle}>
                <div className="toggle-handle"></div>
              </div>
            </li>
            <li className="table-view-cell">
              Vibration API
              <div className={toggleVibration}>
                <div className="toggle-handle"></div>
              </div>
            </li>
          </ul>
          <div style={{ margin: 20, textAlign: 'center' }}>
            <button className="btn btn-negative btn-block btn-outlined" onClick={this.signOut}>Sign out</button>
          </div>
          <div style={{ margin: 20, textAlign: 'center' }}>
            <button className="btn btn-positive btn-block btn-outlined" onClick={() => window.location.reload()}>Reload</button>
          </div>
        </div>
      </div>
    );
  }
};
