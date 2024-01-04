import { useContext } from "react"
import { useParams } from "react-router-dom"
import { Helmet } from "react-helmet"
import FlightDataContext from "./FlightDataContext"
import FlightsTable from "./FlightsTable/FlightsTable"
import { flightsSEOInfo } from "../../constants/seoInfo"

const FlightDetail = () => {
  const { flights, user } = useContext(FlightDataContext)
  const { route } = useParams()
  const to = route?.split("-")[1]

  const seoInfo = flightsSEOInfo[to] || {}
  const { title = "", description = "", keywords = "" } = seoInfo

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={`${description}.`} />
        <meta name="keywords" content={`${keywords}.`} />

        <meta property="og:site_name" content="Rewardflights" />
        <meta
          property="og:url"
          content={`https://rewardflights.io/flights/${route}`}
        />
      </Helmet>

      <FlightsTable flights={flights} user={user} />
    </>
  )
}

export default FlightDetail
