import { createBrowserRouter, createRoutesFromElements, Route, Router, RouterProvider } from 'react-router-dom';
import './App.css'
import Login from './Pages/Login.jsx';
import 'react-router-dom'
import SignUp from './Pages/SignUp.jsx';
import { RootLayout } from './Layout/RootLayout.jsx';
function App() {

  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route path='/' element={<RootLayout /> } />
        <Route path='/login' element={<Login /> } />
        <Route path='/signup' element={<SignUp />} />

      </>
    )
  )
  return(<RouterProvider router={router} />);  
}

export default App
