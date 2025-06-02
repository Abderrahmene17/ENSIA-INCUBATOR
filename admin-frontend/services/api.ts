import axios from "axios"

// Create axios instance with base URL and default headers
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: false,
})

// Temporarily disable authentication requirements
// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('token') || sessionStorage.getItem('token')
//     if (token) {
//       config.headers.Authorization = `Token ${token}`
//     }
//     return config
//   },
//   (error) => {
//     return Promise.reject(error)
//   }
// )

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    // Log the request for debugging
    console.log("API Request:", {
      method: config.method,
      url: config.url,
      data: config.data,
      headers: config.headers,
    })
    return config
  },
  (error) => {
    console.error("Request Error:", error)
    return Promise.reject(error)
  },
)

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    // Log successful responses for debugging
    console.log("API Response:", {
      status: response.status,
      data: response.data,
      url: response.config.url,
    })
    return response
  },
  async (error) => {
    // Log detailed error information
    console.error("API Error:", {
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method,
      headers: error.config?.headers,
      requestData: error.config?.data,
    })

    if (error.response) {
      const errorMessage =
        error.response.data?.error || error.response.data?.detail || JSON.stringify(error.response.data)
      throw new Error(`Request failed: ${errorMessage}`)
    } else if (error.request) {
      throw new Error("No response received from server. Please check your connection.")
    } else {
      throw new Error(`Request setup error: ${error.message}`)
    }
  },
)

export default api
