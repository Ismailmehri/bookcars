import React, { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import SuspenseRouter from '@/components/SuspenseRouter'
import { GlobalProvider } from '@/context/GlobalContext'
import env from '@/config/env.config'
import { initGTM } from '@/common/gtm'

if (env.GOOGLE_ANALYTICS_ENABLED) {
  initGTM()
}
const SignIn = lazy(() => import('@/pages/SignIn'))
const Activate = lazy(() => import('@/pages/Activate'))
const ForgotPassword = lazy(() => import('@/pages/ForgotPassword'))
const ResetPassword = lazy(() => import('@/pages/ResetPassword'))
const SignUp = lazy(() => import('@/pages/SignUp'))
const Suppliers = lazy(() => import('@/pages/Suppliers'))
const Supplier = lazy(() => import('@/pages/Supplier'))
const CreateSupplier = lazy(() => import('@/pages/CreateSupplier'))
const UpdateSupplier = lazy(() => import('@/pages/UpdateSupplier'))
const Locations = lazy(() => import('@/pages/Locations'))
const CreateLocation = lazy(() => import('@/pages/CreateLocation'))
const UpdateLocation = lazy(() => import('@/pages/UpdateLocation'))
const Cars = lazy(() => import('@/pages/Cars'))
const Car = lazy(() => import('@/pages/Car'))
const CreateCar = lazy(() => import('@/pages/CreateCar'))
const UpdateCar = lazy(() => import('@/pages/UpdateCar'))
const Bookings = lazy(() => import('@/pages/Bookings'))
const UpdateBooking = lazy(() => import('@/pages/UpdateBooking'))
const CreateBooking = lazy(() => import('@/pages/CreateBooking'))
const Users = lazy(() => import('@/pages/Users'))
const User = lazy(() => import('@/pages/User'))
const CreateUser = lazy(() => import('@/pages/CreateUser'))
const UpdateUser = lazy(() => import('@/pages/UpdateUser'))
const Settings = lazy(() => import('@/pages/Settings'))
const Review = lazy(() => import('@/pages/Review'))
const UsersReviews = lazy(() => import('@/pages/UsersReviews'))
const Notifications = lazy(() => import('@/pages/Notifications'))
const ToS = lazy(() => import('@/pages/ToS'))
const Privacy = lazy(() => import('@/pages/Privacy'))
const About = lazy(() => import('@/pages/About'))
const ChangePassword = lazy(() => import('@/pages/ChangePassword'))
const Contact = lazy(() => import('@/pages/Contact'))
const NoMatch = lazy(() => import('@/pages/NoMatch'))
const Countries = lazy(() => import('@/pages/Countries'))
const CreateCountry = lazy(() => import('@/pages/CreateCountry'))
const UpdateCountry = lazy(() => import('@/pages/UpdateCountry'))
const CarStats = lazy(() => import('@/pages/CarStats'))
const Pricing = lazy(() => import('@/pages/Pricing'))
const PricingCheckout = lazy(() => import('@/pages/PricingCheckout'))
const Subscriptions = lazy(() => import('@/pages/Subscriptions'))
const UpdateSubscription = lazy(() => import('@/pages/UpdateSubscription'))

const App = () => (
  <GlobalProvider>
    <SuspenseRouter window={window}>
      <div className="app">
        <Suspense fallback={<></>}>
          <Routes>
            <Route path="/sign-in" element={<SignIn />} />
            <Route path="/activate" element={<Activate />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/sign-up" element={<SignUp />} />
            <Route path="/" element={<Bookings />} />
            <Route path="/suppliers" element={<Suppliers />} />
            <Route path="/supplier" element={<Supplier />} />
            <Route path="/create-supplier" element={<CreateSupplier />} />
            <Route path="/update-supplier" element={<UpdateSupplier />} />
            <Route path="/locations" element={<Locations />} />
            <Route path="/create-location" element={<CreateLocation />} />
            <Route path="/update-location" element={<UpdateLocation />} />
            <Route path="/cars" element={<Cars />} />
            <Route path="/car" element={<Car />} />
            <Route path="/create-car" element={<CreateCar />} />
            <Route path="/update-car" element={<UpdateCar />} />
            <Route path="/update-booking" element={<UpdateBooking />} />
            <Route path="/create-booking" element={<CreateBooking />} />
            <Route path="/users" element={<Users />} />
            <Route path="/user" element={<User />} />
            <Route path="/create-user" element={<CreateUser />} />
            <Route path="/update-user" element={<UpdateUser />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/review" element={<Review />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/change-password" element={<ChangePassword />} />
            <Route path="/about" element={<About />} />
            <Route path="/tos" element={<ToS />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/countries" element={<Countries />} />
            <Route path="/create-country" element={<CreateCountry />} />
            <Route path="/update-country" element={<UpdateCountry />} />
            <Route path="/insights" element={<CarStats />} />
            {env.PRICING_ENABLED && <Route path="/pricing" element={<Pricing />} />}
            {env.PRICING_ENABLED && (
              <Route path="/pricing/checkout" element={<PricingCheckout />} />
            )}
            <Route path="/subscriptions" element={<Subscriptions />} />
            <Route path="/update-subscription" element={<UpdateSubscription />} />
            <Route path="/users-reviews" element={<UsersReviews />} />

            <Route path="*" element={<NoMatch />} />
          </Routes>
        </Suspense>
      </div>
    </SuspenseRouter>
  </GlobalProvider>
)

export default App
