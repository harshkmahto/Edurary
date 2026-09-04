import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import router from './router/index.jsx'

import './index.css'
import { DarkModeProvider } from './context/DarkModeContext.jsx'
import { AuthProvider } from './context/authContext.jsx'


createRoot(document.getElementById('root')).render(
  <DarkModeProvider>
     <AuthProvider>
        <RouterProvider router={router}/>
     </AuthProvider>
  </DarkModeProvider>
  
)
