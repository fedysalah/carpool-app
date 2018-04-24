import moment from 'moment';
import ActionTypes from '../actions/actiontypes';

const dbPromise = new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
        return null;
    }
    const open = indexedDB.open("carpoolapp", 1);
    // Create the schema
    open.onupgradeneeded = function () {
        const db = open.result;
        db.createObjectStore("users", {keyPath: "key"});
        db.createObjectStore("archive", {keyPath: "key"});
        db.createObjectStore("locationTime", {keyPath: "key"});
        resolve(db);
    };
    open.onsuccess = function () {
        // Start a new transaction
        const db = open.result;
        resolve(db);
    };
    open.onerror = function (e) {
        reject(e);
    }
});

function saveUsersLocally(users) {
    if (!('indexedDB' in window)) {
        return null;
    }
    return dbPromise.then(db => {
        const tx = db.transaction('users', 'readwrite');
        const store = tx.objectStore('users');
        const request = store.put({"key": 'users', users});
        request.onerror = function () {
            tx.abort();
            throw Error('Events were not added to the store');
        }
    });
}

function saveArchiveLocally(archive) {
    if (!('indexedDB' in window)) {
        return null;
    }
    return dbPromise.then(db => {
        const tx = db.transaction('archive', 'readwrite');
        const store = tx.objectStore('archive');
        const request = store.put({"key": 'archive', archive});
        request.onerror = function () {
            tx.abort();
            throw Error('Events were not added to the store');
        };
    });
}

function saveLocationTimeLocally(locationTime) {
    if (!('indexedDB' in window)) {
        return null;
    }
    return dbPromise.then(db => {
        const tx = db.transaction('locationTime', 'readwrite');
        const store = tx.objectStore('locationTime');

        const request = store.put({"key": 'locationTime', locationTime});
        request.onerror = function () {
            tx.abort();
            throw Error('Events were not added to the store');
        };
    });
}

function getUsersLocalData() {
    if (!('indexedDB' in window)) {
        return null;
    }
    return dbPromise.then(db => {
        const tx = db.transaction('users', 'readonly');
        const store = tx.objectStore('users');
        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = function (e) {
                resolve(e.target.result[0].users);
            };
            open.onerror = function (e) {
                reject(e);
            }
        });
    });
}

function getArchiveLocalData() {
    if (!('indexedDB' in window)) {
        return null;
    }
    return dbPromise.then(db => {
        const tx = db.transaction('archive', 'readonly');
        const store = tx.objectStore('archive');
        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = function (e) {
                resolve(e.target.result[0].archive);
            };
            open.onerror = function (e) {
                reject(e);
            }
        });
    });
}

function getLocationTimeLocalData() {
    if (!('indexedDB' in window)) {
        return null;
    }
    return dbPromise.then(db => {
        const tx = db.transaction('locationTime', 'readonly');
        const store = tx.objectStore('locationTime');
        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = function (e) {
                resolve(e.target.result[0].locationTime);
            };
            open.onerror = function (e) {
                reject(e);
            }
        });
    });
}

export default function Store() {
    let listeners = [];
    let currentUsers = {};
    let currentArchive = {};
    let currentDay = moment();
    let currentTime = {};
    let currentLocation = {};
    loadData();

    function loadData() {
        if (navigator.onLine) {
            Promise.all([
                fetch('/users', {
                    method: 'GET',
                    headers: {
                        'Content-type': 'application/json'
                    }
                }).then(response => response.json()),
                fetch('/archive', {
                    method: 'GET',
                    headers: {
                        'Content-type': 'application/json'
                    }
                }).then(response => response.json()),
                fetch('/locationTime', {
                    method: 'GET',
                    headers: {
                        'Content-type': 'application/json'
                    }
                }).then(response => response.json())
            ]).then(responses => {
                currentUsers = responses[0];
                saveUsersLocally(currentUsers);
                currentArchive = responses[1];
                saveArchiveLocally(currentArchive);
                currentTime = responses[2].time;
                currentLocation = responses[2].location;
                saveLocationTimeLocally(responses[2]);
                notifyListeners();
            }).catch(err => {
                console.log('Network requests have failed, this is expected if offline');
                Promise.all([getUsersLocalData(), getArchiveLocalData(), getLocationTimeLocalData()])
                    .then(responses => {
                        currentUsers = responses[0];
                        saveUsersLocally(currentUsers);
                        currentArchive = responses[1];
                        saveArchiveLocally(currentArchive);
                        currentTime = responses[2].time;
                        currentLocation = responses[2].location;
                        saveLocationTimeLocally(responses[2]);
                        notifyListeners();
                    });
            });
        } else {
            Promise.all([getUsersLocalData(), getArchiveLocalData(), getLocationTimeLocalData()])
                .then(responses => {
                    currentUsers = responses[0];
                    saveUsersLocally(currentUsers);
                    currentArchive = responses[1];
                    saveArchiveLocally(currentArchive);
                    currentTime = responses[2].time;
                    currentLocation = responses[2].location;
                    saveLocationTimeLocally(responses[2]);
                    notifyListeners();
                });
        }
    }

    function subscribe(listener) {
        listeners.push(listener);
        return () => {
            let index = listeners.indexOf(listener);
            listeners.splice(index, 1);
        };
    }

    function notifyListeners() {
        listeners.forEach(cb => cb());
    }

    function noDrivers(users) {
        for (let key in users) {
            const user = users[key];
            if (user === 'driver') {
                return false;
            }
        }
        return true;
    }

    function noPoolers(users) {
        for (let key in users) {
            const user = users[key];
            if (user === 'pooler') {
                return false;
            }
        }
        return true;
    }

    function dispatch(action) {
        if (action.type === ActionTypes.PreviousDay) {
            previousDay();
        } else if (action.type === ActionTypes.NextDay) {
            nextDay();
        } else if (action.type === ActionTypes.UpdateDay) {
            const formattedDate = currentDay.format('YYYYMMDD');
            if (noDrivers(action.payload.userStates)) {
                console.log('no driver');
                return;
            }
            if (noPoolers(action.payload.userStates)) {
                console.log('no poolers');
                return;
            }
            fetch('/saveUser', {
                    method: 'POST', headers: {
                        'Content-type': 'application/json'
                    },
                    body: JSON.stringify({
                        userStates: action.payload.userStates,
                        currentDay: formattedDate
                    }),
                }
            ).then(response => response.json())
                .then((response) => {
                    currentArchive = response;
                    notifyListeners();
                })
        } else if (action.type === ActionTypes.ChangeLocation) {
            fetch('/changeLocation', {
                    method: 'POST', headers: {
                        'Content-type': 'application/json'
                    },
                    body: JSON.stringify({
                        location: action.payload,
                    }),
                }
            ).then(response => response.json())
                .then(responseJs => {
                    currentTime = responseJs.time;
                    currentLocation = responseJs.location;
                    notifyListeners();
                });
        } else if (action.type === ActionTypes.ChangeTime) {
            fetch('/changeTime', {
                    method: 'POST', headers: {
                        'Content-type': 'application/json'
                    },
                    body: JSON.stringify({
                        time: action.payload,
                    }),
                }
            ).then(response => response.json())
                .then(responseJs => {
                    currentTime = responseJs.time;
                    currentLocation = responseJs.location;
                    notifyListeners();
                });
        } else {
            console.log('Unknown action', action);
        }
    }

    function previousDay() {
        const newDay = moment(currentDay).subtract(1, 'days');
        if (newDay.isBefore(moment('20180401', 'YYYYMMDD'))) {
            return;
        }
        if (newDay.weekday() == 5) {
            currentDay = newDay.subtract(1, 'days');
        } else if (newDay.weekday() == 6) {
            currentDay = newDay.subtract(2, 'days');
        } else {
            currentDay = newDay;
        }
        notifyListeners();
    }

    function nextDay() {
        const newDay = moment(currentDay).add(1, 'days');
        if (newDay.isAfter(moment().endOf('day'))) {
            return;
        }
        if (newDay.weekday() == 5) {
            currentDay = newDay.add(2, 'days');
        } else if (newDay.weekday() == 6) {
            currentDay = newDay.add(1, 'days');
        } else {
            currentDay = newDay;
        }
        notifyListeners();
    }

    return {
        loadData,
        subscribe,
        dispatch,
        isAlreadyValidated() {
            return typeof currentArchive[currentDay.format('YYYYMMDD')] !== 'undefined'
        },
        getCurrentTime() {
            return currentTime;
        },
        getCurrentLocation() {
            return currentLocation;
        },
        getCurrentDate() {
            return currentDay;
        },
        getUsers() {
            return {...currentUsers};
        },
        getArchives() {
            return {...currentArchive};
        },
        getCurrentDayFromArchive() {
            return currentArchive[currentDay.format('YYYYMMDD')];
        },
        isInPast() {
            return currentDay.isBefore(moment().startOf('day'));
        }
    };
}
