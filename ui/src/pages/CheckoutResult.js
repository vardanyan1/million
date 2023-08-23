import { useQuery } from "@tanstack/react-query"
import { useSearchParams, Navigate } from "react-router-dom"

import { useAuthContext } from "../services/auth"
import { getCheckoutResult } from "../services/api"
import Loading from "../components/Loading"

export default function CheckoutResult() {
  const { user, error } = useAuthContext()

  const [searchParams, _] = useSearchParams()

  const sessionId = searchParams.get("session_id")
  const {
    data: session,
    isLoading,
    error: sessionError,
  } = useQuery({
    queryKey: ["session", user?.id, sessionId],
    queryFn: getCheckoutResult,
    initialData: [],
    enabled: !!user,
    refetchInterval: 1000,
  })

  if (error || sessionError) {
    return "Error fetching session. Please try again."
  }

  if (isLoading || session.session_status === "open") {
    return <Loading />
  }

  return <Navigate to="/" />
}
