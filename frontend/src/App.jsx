import { useRef, useState } from 'react';
import Gallery from './views/Gallery';
import DBManager from './views/DBManager';
import './App.css';
import backgroundUrl from './assets/images/background.jpg';

const VIEWS = {
    "MOVIES": "MOVIES",
    "SHOWS": "SHOWS",
    "DATABASE": "DATABASE",
    "PLAYER": "PLAYER",
    "MOMENTS": "MOMENTS",
    "SETTINGS": "SETTINGS"
};

function App() {
    const [appView, setAppView] = useState(VIEWS.MOVIES);
    const [directory, setDirectory] = useState("");
    const [inputValue, setInputValue] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        setDirectory(inputValue);
    };

    return (
        <div id="App" style={{ backgroundImage: `url(${backgroundUrl})` }}>
            {!directory ? (
                <form onSubmit={handleSubmit}>
                    <input onChange={e => setInputValue(e.target.value)} placeholder="Root directory path"></input>
                    <button type="submit">Scan</button>
                </form>
            ) : (
                appView === VIEWS.MOVIES ? <Gallery defaultDir={directory} /> : null
            )}
        </div>
    )
}

export default App
