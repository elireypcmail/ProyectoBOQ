// Dependencies
import { BrowserRouter, Routes, Route } from "react-router-dom"
// Pages
import LoginPage from "./pages/LoginPage"
import HomePage from "./pages/HomePage"
// Context
import { AuthProvider } from "./context/AuthContext"
import { SettingsProvider } from "./context/SettingsContext"
import { EntityProvider } from "./context/EntityContext"
import { HealthProvider } from "./context/HealtContext"
import { ProductsProvider } from "./context/ProductsContext"
import { PurchasesProvider } from "./context/PurchasesContext"
import { IncExpProvider } from "./context/IncExpContext"
import { SalesProvider } from "./context/SalesContext"
import { ClinicsProvider } from "./context/ClinicsContext"
function App() {
  return (
    <div>
      <AuthProvider>
        <SettingsProvider>
          <EntityProvider>
            <HealthProvider>
              <ProductsProvider>
                <PurchasesProvider>
                  <IncExpProvider>
                    <SalesProvider>
                      <ClinicsProvider>
                        <BrowserRouter>
                          <Routes>
                            <Route path="/" element={<LoginPage />}></Route>
                            <Route
                              path="/inicio"
                              element={<HomePage />}
                            ></Route>
                            {/* <Route path='/login' element={<LoginPage/>}></Route> */}
                          </Routes>
                        </BrowserRouter>
                      </ClinicsProvider>
                    </SalesProvider>
                  </IncExpProvider>
                </PurchasesProvider>
              </ProductsProvider>
            </HealthProvider>
          </EntityProvider>
        </SettingsProvider>
      </AuthProvider>
    </div>
  )
}

export default App
