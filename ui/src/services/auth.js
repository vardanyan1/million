import { createContext, useContext } from "react"
import { useQuery } from "@tanstack/react-query"

import { me } from "./api"
import Loading from "../components/Loading"

const AuthContext = createContext({ user: null, error: null })

export const AuthProvider = ({ children }) => {
  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["me"],
    queryFn: me,
  })
  return (
    <AuthContext.Provider value={{ user, error }}>
      {isLoading ? <Loading /> : children}
    </AuthContext.Provider>
  )
}

export const useAuthContext = () => {
  return useContext(AuthContext)
}
