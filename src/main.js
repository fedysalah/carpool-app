import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import moment from 'moment';
import Store from './stores/store';
import DayScreen from './screens/dayscreen';
import CalendarScreen from './screens/calendarscreen';
import LocationScreen from './screens/locationscreen';

import * as firebase from 'firebase'
import 'firebase/auth'
require('moment/locale/fr');

const apiKey = process.env.FIREBASE_API_KEY;
const authDomain = process.env.FIREBASE_AUTH_DOMAIN;
const databaseURL = process.env.FIREBASE_DB_URL;
const projectId = process.env.FIREBASE_PROJECT_ID;
const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;
const messagingSenderId = process.env.FIREBASE_MESSAGING_SENDER_ID;

const config = {
    apiKey,
    authDomain,
    databaseURL,
    projectId,
    storageBucket,
    messagingSenderId
};

firebase.initializeApp(config);
const messaging = firebase.messaging();

messaging.requestPermission()
    .then(() => messaging.getToken())
    .then(token =>
        fetch('/registerToken', {
            method: 'POST', headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify({token,}),
        })
    )
    .then(response => response.json())
    .catch(function (err) {
        console.log('Unable to get permission to notify.', err);
    });

messaging.onMessage(function (payload) {
    console.log('notif payload', payload)
});

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
        store: Store(),
    };

    render() {
        let screen = <h3>Not a screen ????</h3>;
        if (this.state.screen === Screens.Day) {
            screen = <DayScreen store={this.state.store}/>;
        } else if (this.state.screen === Screens.Calendar) {
            screen = <CalendarScreen store={this.state.store}/>;
        }
        else if (this.state.screen === Screens.Location) {
            screen = <LocationScreen store={this.state.store}/>;
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
                        <span/>
                        <span className="tab-label">Location</span>
                    </a>
                </nav>
            </div>
        );
    }
}

ReactDOM.render(<App />, document.getElementById('app'));

