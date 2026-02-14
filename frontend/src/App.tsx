import { useState } from 'react';

import { Greet, GetAppInfo, SendTestEvent } from '../wailsjs/go/main/App';
import { EventsOn, EventsEmit } from '../wailsjs/runtime/runtime';

function App() {
    const [name, setName] = useState('');
    const [greeting, setGreeting] = useState('');
    const [appInfo, setAppInfo] = useState('');
    const [eventMessage, setEventMessage] = useState('');

    EventsOn('test:hello', (message: string) => {
        setEventMessage(message);
    });

    return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
            <h1>Ghost Chat</h1>

            <div>
                <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                />
                <button onClick={() => Greet(name).then(setGreeting)}>Greet</button>
                <p>{greeting}</p>
            </div>

            <div>
                <button onClick={() => GetAppInfo().then(setAppInfo)}>Get App Info</button>
                <p>{appInfo}</p>
            </div>

            <div>
                <button onClick={() => SendTestEvent()}>Send Event (Go → React)</button>
                <p>{eventMessage}</p>
            </div>

            <div>
                <button onClick={() => EventsEmit('test:from-frontend', 'Hello from React!')}>
                    Emit Event (React → Go)
                </button>
            </div>
        </div>
    );
}

export default App;
