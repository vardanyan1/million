import reportWebVitals from "./reportWebVitals"

// Libraries
import React from "react"
import ReactDOM from "react-dom/client"
import { ChakraProvider } from "@chakra-ui/react"
import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  Navigate,
} from "react-router-dom"

// Styles
import "@fontsource/nunito-sans/400.css"
import "@fontsource/nunito-sans/600.css"
import "@fontsource/nunito-sans/700.css"
import "@fontsource/nunito-sans/800.css"
import "./index.css"

// Services & Configs
import enTranslations from "./translations"
import chakraTheme from "./chakraTheme"
import "./services/api"
import { AuthProvider, useAuthContext } from "./services/auth"

// Components & Pages
import Loading from "./components/Loading"
import TermsAndConditions from "./pages/TermsAndConditions"
import PrivacyPolicy from "./pages/PrivacyPolicy"
import AllAvailability from "./pages/AllAvailability"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Settings from "./pages/Settings"
import Alerts from "./pages/Alerts"
import ResetPassword from "./pages/ResetPassword"
import ResetPasswordConfirm from "./pages/ResetPasswordConfirm"
import Pricing from "./pages/Pricing"
import CheckoutResult from "./pages/CheckoutResult"
import ToFromAustralia from "./pages/ToFromAustralia"
import FlightDetail from "./components/Flights/FlightDetail"
import NotFound from "./pages/NotFound"

const resources = {
  en: {
    translation: enTranslations,
  },
}

i18n.use(initReactI18next).init({
  resources,
  lng: "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false, // not needed for react as it escapes by default
  },
})

const ProtectedRoute = ({ children }) => {
  const { user, error } = useAuthContext()

  if (!user && !error) {
    return <Loading />
  }

  return user ? children : <Navigate to="/" replace />
}

const AnonymousRoute = ({ children }) => {
  const { user, error } = useAuthContext()

  if (!user && !error) {
    return <Loading />
  }

  return user ? <Navigate to="/" /> : children
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        if (
          error.response?.data?.detail ===
          "Authentication credentials were not provided."
        ) {
          return false
        }
        if (failureCount < 2) {
          return true
        }
        return false
      },
    },
  },
})

const Layout = () => {
  return (
    <div className="App">
      <Outlet />
    </div>
  )
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <AllAvailability /> },
      {
        path: "/terms-and-conditions",
        element: <TermsAndConditions />,
      },
      {
        path: "/privacy-policy",
        element: <PrivacyPolicy />,
      },
      {
        path: "/login",
        element: (
          <AnonymousRoute>
            <Login />
          </AnonymousRoute>
        ),
      },
      {
        path: "/register",
        element: (
          <AnonymousRoute>
            <Register />
          </AnonymousRoute>
        ),
      },
      {
        path: "/settings",
        element: (
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        ),
      },
      {
        path: "/alerts",
        element: (
          <ProtectedRoute>
            <Alerts />
          </ProtectedRoute>
        ),
      },
      {
        path: "/reset-password",
        element: (
          <AnonymousRoute>
            <ResetPassword />
          </AnonymousRoute>
        ),
      },
      {
        path: "/reset-password-confirm/:uid/:token",
        element: (
          <AnonymousRoute>
            <ResetPasswordConfirm />
          </AnonymousRoute>
        ),
      },
      {
        path: "/pricing",
        element: <Pricing />,
      },
      {
        path: "/checkout_result",
        element: <CheckoutResult />,
      },
      {
        path: "/flights",
        element: <AllAvailability />,
        children: [{ path: ":route", element: <FlightDetail /> }],
      },
      {
        path: "/australian-flights",
        element: <ToFromAustralia />,
        children: [{ path: "*", element: <ToFromAustralia /> }],
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
])

const root = ReactDOM.createRoot(document.getElementById("root"))
root.render(
  <React.StrictMode>
    <ChakraProvider theme={chakraTheme}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
        {process.env.NODE_ENV === "development" && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </QueryClientProvider>
    </ChakraProvider>
  </React.StrictMode>
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
