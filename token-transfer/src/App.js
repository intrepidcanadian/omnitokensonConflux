// src/App.js
import React from 'react';
import TokenTransfer from './TokenTransfer';
import { ToastContainer } from 'react-toastify'; // Import the ToastContainer
import 'react-toastify/dist/ReactToastify.css';  


function App() {
  return (
    <div className="App">
      <header className="App-header">
        <TokenTransfer />
        <ToastContainer />
      </header>
    </div>
  );
}

export default App;