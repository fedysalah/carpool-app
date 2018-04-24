import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import moment from 'moment';
import Store from './stores/store';
import DayScreen from './screens/dayscreen';
import CalendarScreen from './screens/calendarscreen';
import LocationScreen from './screens/locationscreen';

require('moment/locale/fr');

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
                    <a id="new-version-alert" className='tab-item' style ={{display: 'none'}}
                       href="#" onClick={() => location.reload(true)}>
                        <span className="icon icon-refresh"/>
                        <span className="badge badge-negative">1</span>
                        <span className="tab-label">Nouvelle version</span>
                    </a>
                </nav>
            </div>
        );
    }
}

ReactDOM.render(<App />, document.getElementById('app'));

