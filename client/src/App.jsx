// Dependencies
import { BrowserRouter, Routes, Route }   from 'react-router-dom'
// Pages
import LoginPage                          from './pages/LoginPage'
import HomePage                           from './pages/HomePage'
// Context
import { AuthProvider }                   from './context/AuthContext'
import { EntityProvider }                   from './context/EntityContext'
import { HealthProvider }                   from './context/HealtContext'
import { ProductsProvider }                   from './context/ProductsContext'
import { PurchasesProvider }                   from './context/PurchasesContext'
import { IncExpProvider }                   from './context/IncExpContext'
function App() {
  return (
    <div>
      <AuthProvider>
        <EntityProvider>
          <HealthProvider>
            <ProductsProvider>
              <PurchasesProvider>
                <IncExpProvider>
                  <BrowserRouter>
                    <Routes>
                      <Route path='/' element={<LoginPage/>}></Route>
                      <Route path='/inicio' element={<HomePage/>}></Route>
                      {/* <Route path='/login' element={<LoginPage/>}></Route> */}
                    </Routes>      
                  </BrowserRouter>
                </IncExpProvider>
              </PurchasesProvider>
            </ProductsProvider>
          </HealthProvider>
        </EntityProvider>
      </AuthProvider>
    </div>
  )
}

export default App
