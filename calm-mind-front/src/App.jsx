import { useState } from 'react'
import './App.css'
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom'
import LoginScreen from './pages/LoginScreen'
import SignupScreen from './pages/SignupScreen'
import Homepage from './pages/Homepage'

function App() {

return (
  <Router>
    <Routes>
      <Route path='/' element={<LoginScreen/>}/>
       <Route path='/signup' element={<SignupScreen/>}/>
       <Route path='/home' element={<Homepage/>}/>

    </Routes>
  </Router>
)
}

export default App
