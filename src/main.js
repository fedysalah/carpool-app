import React, {Component} from 'react';
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
require('moment/locale/fr');

const apiKey = process.env.FIREBASE_API_KEY ;
const authDomain = process.env.FIREBASE_AUTH_DOMAIN;
const databaseURL = process.env.FIREBASE_DB_URL;
const projectId = process.env.FIREBASE_PROJECT_ID;
const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;
const messagingSenderId = process.env.FIREBASE_MESSAGING_SENDER_ID ;

const config = {
    apiKey,
    authDomain,
    databaseURL,
    projectId,
    storageBucket,
    messagingSenderId
};

firebase.initializeApp(config);

if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/serviceworker.js').then(function(registration) {
            // Registration was successful
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
        }, function(err) {
            // registration failed :(
            console.log('ServiceWorker registration failed: ', err);
        });
    });
}

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

class App extends Component {

    state = {
        screen: Screens.Day,
        date: moment(),
    };

    update = () => {
        this.forceUpdate();
    };

    componentDidMount() {
        this.cancelSubscription = this.props.locationStore.subscribe(this.update);
        this.update();
    }

    componentWillUnmount() {
        this.cancelSubscription();
    }

    signOut = () => {
        console.log('signing out');
        firebase.auth().signOut().then(function () {
            window.location.reload();
        });
    };

    render() {
        let screen = <h3>Not a screen ????</h3>;
        if (this.state.screen === Screens.Day) {
            screen = <DayScreen store={this.props.store}/>;
        } else if (this.state.screen === Screens.Calendar) {
            screen = <CalendarScreen store={this.props.store}/>;
        } else if (this.state.screen === Screens.Settings) {
            screen = <SettingsScreen store={this.props.store} auth={this.props.auth} signOut={this.signOut}/>;
        } else if (this.state.screen === Screens.Location) {
            screen = <LocationScreen store={this.props.locationStore}/>;
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
                       href="#" onClick={() => this.setState({screen: Screens.Day})}>
                        <span className="icon icon-home"/>
                        <span className="tab-label">Home</span>
                    </a>
                    <a className={this.state.screen === Screens.Calendar ? 'tab-item active' : 'tab-item'}
                       href="#" onClick={() => this.setState({screen: Screens.Calendar})}>
                        <span className="icon icon-list"/>
                        <span className="tab-label">Calendar</span>
                    </a>
                    <a className={this.state.screen === Screens.Location ? 'tab-item active' : 'tab-item'}
                       href="#" onClick={() => this.setState({screen: Screens.Location})}>
                        <span className="icon icon-search"/>
                        {
                            this.props.locationStore.hasChangedSinceLastTime() && this.state.screen !== Screens.Location
                                ? <span className="badge badge-negative">1</span>
                                : <span/>
                        }
                        <span className="tab-label">Location</span>
                    </a>
                    <a className={this.state.screen === Screens.Settings ? 'tab-item active' : 'tab-item'}
                       href="#" onClick={() => this.setState({screen: Screens.Settings})}>
                        <span className="icon icon-gear"/>
                        <span className="tab-label">Settings</span>
                    </a>
                </nav>
            </div>
        );
    }
}
;

if (false) {
    console.log('dev mode, no auth');
    const session = '1';
    ReactDOM.render(<App store={Store(session)}/>, document.getElementById('app'));
} else {
    const ref = firebase.database();
    firebase.auth().onAuthStateChanged(function (authData) {
        if (authData) {
            console.log("Authenticated onAuth successfully with payload: ", authData);
            console.log("authData.providerData", authData.providerData)
            ref.ref(`web/carpool/${__DEV__ ? 'dev' : ''}google/${authData.providerData[0].uuid}`).set(authData.providerData[0].displayName);
            const session = '1';
            console.log('authData.providerData[0]', authData.providerData[0])
            ReactDOM.render(<App store={Store(session)} locationStore={LocationStore(session)}
                                 auth={authData.providerData[0]}/>, document.getElementById('app'));
        }
    });

    const authData = firebase.auth().currentUser;
    if (authData) {
        console.log('already auth', authData);
    } else {
        class Login extends Component {
            login = () => {
                console.log('attemting to auth')
                const provider = new firebase.auth.GoogleAuthProvider();
                firebase.auth().signInWithRedirect(provider);
            };

            render() {
                return (
                    <div>
                        <header className="bar bar-nav">
                            <h1 className="title">Login</h1>
                        </header>
                        <div className="content" style={{paddingLeft: 10, paddingRight: 10, paddingTop: 60}}>
                            <div style={{margin: 20}}>
                                <button type="button" className="btn btn-primary btn-block btn-outlined"
                                        onClick={this.login}>
                                    Login with Google
                                </button>
                            </div>
                        </div>
                    </div>
                );
            }
        };
        ReactDOM.render(<Login />, document.getElementById('app'));
    }
}
