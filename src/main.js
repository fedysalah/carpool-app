import React from 'react';
import ReactDOM from 'react-dom';
import moment from 'moment';
import Store from './stores/store';
import LocationStore from './stores/locationstore';
import DayScreen from './screens/dayscreen';
import CalendarScreen from './screens/calendarscreen';
import SettingsScreen from './screens/settingsscreen';
import LocationScreen from './screens/locationscreen';

import * as firebase from 'firebase'
import 'firebase/auth'

const config = {
  apiKey: "AIzaSyAtcsQKYqEoFQE35gsrLf7C7I8bczJaufI",
  authDomain: "carpoolapptest.firebaseapp.com",
  databaseURL: "https://carpoolapptest.firebaseio.com",
  projectId: "carpoolapptest",
  storageBucket: "carpoolapptest.appspot.com",
  messagingSenderId: "143803579783"
};
firebase.initializeApp(config);

require('babel-polyfill');
require('moment/locale/fr');

navigator.vibrate = navigator.vibrate ||
  navigator.webkitVibrate ||
  navigator.mozVibrate ||
  navigator.msVibrate;

const Screens = Object.freeze({
  Day: Symbol('Day'),
  Calendar: Symbol('Calendar'),
  Settings: Symbol('Settings'),
  Location: Symbol('Location'),
});

const App = React.createClass({
  getInitialState() {
    return {
      screen: Screens.Day,
      date: moment(),
    };
  },
  update() {
    this.forceUpdate();
  },
  componentDidMount() {
    this.cancelSubscription = this.props.locationStore.subscribe(this.update);
    this.update();
  },
  componentWillUnmount() {
    this.cancelSubscription();
  },

  signOut(){
    console.log('signing out');
    firebase.auth().signOut().then(function() {
      window.location.reload();
    });
  },

  render() {
    let screen = <h3>Not a screen ????</h3>;
    if (this.state.screen === Screens.Day) {
      screen = <DayScreen store={this.props.store} />;
    } else if (this.state.screen === Screens.Calendar) {
      screen = <CalendarScreen store={this.props.store} />;
    } else if (this.state.screen === Screens.Settings) {
      screen = <SettingsScreen store={this.props.store} auth={this.props.auth} signOut={this.signOut} />;
    } else if (this.state.screen === Screens.Location) {
      screen = <LocationScreen store={this.props.locationStore} />;
    }
    if (this.props.locationStore.hasChangedSinceLastTime()) {
      if (window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(200);
      }
    }


    return (
      <div>
        {screen}
        <nav className="bar bar-tab">
          <a className={this.state.screen === Screens.Day ? 'tab-item active' : 'tab-item'}
              href="#" onClick={() => this.setState({ screen: Screens.Day })}>
            <span className="icon icon-home"></span>
            <span className="tab-label">Home</span>
          </a>
          <a className={this.state.screen === Screens.Calendar ? 'tab-item active' : 'tab-item'}
              href="#" onClick={() => this.setState({ screen: Screens.Calendar })}>
            <span className="icon icon-list"></span>
            <span className="tab-label">Calendar</span>
          </a>
          <a className={this.state.screen === Screens.Location ? 'tab-item active' : 'tab-item'}
              href="#" onClick={() => this.setState({ screen: Screens.Location })}>
            <span className="icon icon-search"></span>
            {
              this.props.locationStore.hasChangedSinceLastTime() && this.state.screen !== Screens.Location
              ? <span className="badge badge-negative">1</span>
              : <span></span>
            }
            <span className="tab-label">Location</span>
          </a>
          <a className={this.state.screen === Screens.Settings ? 'tab-item active' : 'tab-item'}
              href="#" onClick={() => this.setState({ screen: Screens.Settings })}>
            <span className="icon icon-gear"></span>
            <span className="tab-label">Settings</span>
          </a>
        </nav>
      </div>
    );
  }
});

if (false) {
  console.log('dev mode, no auth');
  const session = '1';
  ReactDOM.render(<App store={Store(session)} />, document.getElementById('app'));
} else {
  const ref = firebase.database();
  firebase.auth().onAuthStateChanged(function(authData) {
    if (authData) {
      console.log("Authenticated onAuth successfully with payload: ", authData);
      console.log("authData.providerData", authData.providerData)
      ref.ref(`web/carpool/${__DEV__ ? 'dev' : ''}google/${authData.providerData[0].uuid}`).set(authData.providerData[0].displayName);
      const session = '1';
      console.log('authData.providerData[0]', authData.providerData[0])
      ReactDOM.render(<App store={Store(session)} locationStore={LocationStore(session)} auth={authData.providerData[0]} />, document.getElementById('app'));
    } 
  });

  var authData = firebase.auth().currentUser;
  if (authData) {
    console.log('already auth', authData);
  } else {
    const Login = React.createClass({
      login() {
        console.log('attemting to auth')
        const provider = new firebase.auth.GoogleAuthProvider();
        firebase.auth().signInWithRedirect(provider);
        /*ref.authWithOAuthRedirect("google", (error, authData) => {
          if (error) {
            console.log("Authentication Failed!", error);
          }
        });*/
      },
      render() {
        return (
          <div>
            <header className="bar bar-nav">
              <h1 className="title">Login</h1>
            </header>
            <div className="content" style={{ paddingLeft: 10, paddingRight: 10, paddingTop: 60 }}>
              <div style={{ margin: 20 }}>
                <button type="button" className="btn btn-primary btn-block btn-outlined" onClick={this.login}>
                  Login with Google
                </button>
              </div>
            </div>
          </div>
        );
      }
    });
    ReactDOM.render(<Login /> ,document.getElementById('app'));
  }
}
