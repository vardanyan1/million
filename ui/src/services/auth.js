import { createContext, useContext, useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"

import { me } from "./api"
import Loading from "../components/Loading"

const AuthContext = createContext({
  user: null,
  error: null,
  setUser: () => {},
})

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["me"],
    queryFn: me,
  })

  useEffect(() => {
    setCurrentUser(user)
  }, [user])

  return (
    <AuthContext.Provider
      value={{ user: currentUser, error, setUser: setCurrentUser }}
    >
      {isLoading ? <Loading /> : children}
    </AuthContext.Provider>
  )
}

export const useAuthContext = () => {
  return useContext(AuthContext)
}
