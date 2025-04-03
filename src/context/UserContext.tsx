import { createContext, useState, useContext, useEffect, ReactNode } from 'react'

interface User {
  id: string                   // ✅ нужно для Chat и других компонентов
  telegramId: string
  username?: string
  role?: 'passenger' | 'driver'
}

interface UserContextType {
  user: User | null
  setUser: (user: User | null) => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export function useUser() {
  const context = useContext(UserContext)
  if (!context) throw new Error('useUser должен использоваться внутри UserProvider')
  return context
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const savedUser = localStorage.getItem('taxip2p-user')
      return savedUser ? JSON.parse(savedUser) : null
    } catch {
      return null
    }
  })

  useEffect(() => {
    if (user) {
      localStorage.setItem('taxip2p-user', JSON.stringify(user))
    } else {
      localStorage.removeItem('taxip2p-user')
    }
  }, [user])

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  )
}
