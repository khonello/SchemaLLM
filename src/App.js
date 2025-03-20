import './styles/App.css';
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Base } from './components/base';

const App = () => {
    return (
        <Routes>
            <Route path= {"/*"} element= {<Base />} />
        </Routes>
    )
}

export default App