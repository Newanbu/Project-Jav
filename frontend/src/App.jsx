import './App.css'
import {BrowserRouter as Router,Routes, Route} from 'react-router-dom'
import Login from './pages/Login'
import Menu from './components/Menu'

function App() {

  return (
    <>
          <Router>
            <Routes>
              <Route path='/' element={<Login/>}/>
              <Route path='/menu' element={<Menu/>}/>
            </Routes>
          </Router>
    </>
  )
}

export default App
