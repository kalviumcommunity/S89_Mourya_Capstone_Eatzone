
import Sidebar from './components/Sidebar/Sidebar'
import Navbar from './components/Navbar/Navbar'
import { Routes,Route } from 'react-router-dom'
import Add from './pages/Add/Add'
import List from './pages/List/List'
import Orders from './pages/Orders/Orders'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const App = () => {

  // Use full server URL for admin API calls
  const url = "http://localhost:4000"

  return (
    <div>
        {/* Debug info */}
        <div style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          background: '#007bff',
          color: 'white',
          padding: '10px',
          borderRadius: '5px',
          zIndex: 1000,
          fontSize: '12px'
        }}>
          ADMIN APP - Port: {window.location.port || '5174'}
        </div>

        <ToastContainer/>
        <Navbar/>
        <hr />
        <div className="app-content">
            <Sidebar/>
            <Routes>
                <Route path="/add" element={<Add url={url}/>}/>
                <Route path="/list" element={<List url={url}/>}/>
                <Route path="/orders" element={<Orders url={url}/>}/>
            </Routes>
        </div>
    </div>
  )
}

export default App