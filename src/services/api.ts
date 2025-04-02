import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

export const setAuthHeader = (telegramId: string) => {
  api.defaults.headers.common['x-telegram-id'] = telegramId
}
