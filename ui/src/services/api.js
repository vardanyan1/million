import axios from "axios"

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL

export const API = axios.create({ baseURL: BACKEND_URL })

const publicOnlyURLS = [
  "/api/users/",
  "/api/jwt/create",
  "/api/users/reset_password/",
  "/api/users/reset_password_confirm/",
]

API.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("accessToken")
    if (
      accessToken &&
      !publicOnlyURLS.some((url) => config.url.endsWith(url))
    ) {
      config.headers["Authorization"] = `JWT ${accessToken}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

API.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config
    const errMessage = error.response?.data?.code
    if (errMessage === "token_not_valid" && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        await refreshToken()
      } catch (err) {
        // if refresh error do not retry
        if (err.response?.data?.code === "token_not_valid") {
          localStorage.removeItem("accessToken")
          localStorage.removeItem("refreshToken")
        }
        return Promise.reject(err)
      }
      return API(originalRequest)
    }
    return Promise.reject(error)
  }
)

export const login = async (values) => {
  const response = await API.post("/api/jwt/create", values)
  localStorage.setItem("accessToken", response.data.access)
  localStorage.setItem("refreshToken", response.data.refresh)
  return response.data
}

export const logout = () => {
  localStorage.removeItem("accessToken")
  localStorage.removeItem("refreshToken")
}

export const signup = async (values) => {
  const response = await API.post("/api/users/", values)
  return response.data
}

export const refreshToken = async () => {
  const token = localStorage.getItem("refreshToken")
  if (token) {
    const response = await axios.post(`${BACKEND_URL}/api/jwt/refresh`, {
      refresh: token,
    })
    localStorage.setItem("accessToken", response.data.access)
  }
  throw new Error("NO_REFRESH_TOKEN")
}

export const me = async () => {
  const response = await API.get("/api/users/me/")
  return response.data
}

export const updateUser = async (values) => {
  const response = await API.put("/api/users/me/", values)
  return response.data
}

export const getFlights = async ({ queryKey }) => {
  const [_, params] = queryKey
  const urlParams = new URLSearchParams(params)
  const response = await axios.get(`${BACKEND_URL}/api/flights?${urlParams}`)
  return response.data
}

export const getOriginAirports = async () => {
  const response = await axios.get(`${BACKEND_URL}/api/origins`)
  return response.data
}

export const getDestinationAirports = async ({ queryKey }) => {
  const [_, origin] = queryKey
  const urlParams = origin ? `origin=${origin}` : ""
  const response = await axios.get(
    `${BACKEND_URL}/api/destinations?${urlParams}`
  )

  return response.data
}

export const getFlightDates = async ({ queryKey }) => {
  const [_, params] = queryKey
  const urlParams = new URLSearchParams(params)
  const response = await axios.get(
    `${BACKEND_URL}/api/flight-dates?${urlParams}`
  )
  return response.data
}

export const createAlert = async (data) => {
  const response = await API.post(`${BACKEND_URL}/api/alerts`, data)
  return response.data
}

export const updateAlert = async ({ id, ...data }) => {
  const response = await API.put(`${BACKEND_URL}/api/alerts/${id}`, data)
  return response.data
}

export const getAlerts = async (data) => {
  const response = await API.get(`${BACKEND_URL}/api/alerts`)
  return response.data
}

export const deleteAlert = async (id) => {
  const response = await API.delete(`${BACKEND_URL}/api/alerts/${id}`)
  return response.data
}

export const resetPassword = async (email) => {
  const response = await API.post(`${BACKEND_URL}/api/users/reset_password/`, {
    email,
  })
  return response.data
}

export const resetPasswordConfirm = async (data) => {
  const response = await API.post(
    `${BACKEND_URL}/api/users/reset_password_confirm/`,
    data
  )
  return response.data
}

export const createCheckoutSession = async (data) => {
  const response = await API.post(
    `${BACKEND_URL}/api/users/checkout_session`,
    data
  )
  return response.data
}

export const getCheckoutResult = async ({ queryKey }) => {
  const [_, userId, sessionId] = queryKey
  const response = await API.get(
    `${BACKEND_URL}/api/users/${userId}/session_result?session_id=${sessionId}`
  )
  return response.data
}

export const getPricingPlans = async () => {
  const response = await API.get(`${BACKEND_URL}/api/plans`)
  return response.data
}
