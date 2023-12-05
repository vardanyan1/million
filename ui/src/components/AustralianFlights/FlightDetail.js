import { useContext } from "react"
import AustralianFlightDataContext from "./FlightDataContext"
import FlightsTable from "./FlightsTable/FlightsTable"
// import { Helmet } from "react-helmet"
// import { useParams } from "react-router-dom"
// import { australianFlightsSEOInfo } from "../../constants/constants"

const AustralianFlightDetail = () => {
  const context = useContext(AustralianFlightDataContext)
  console.log(context)
  // const { route } = useParams()
  // const to = route?.split("-")[1]

  // const seoInfo = australianFlightsSEOInfo[to] || {}
  // const { title = "", description = "", keywords = "" } = seoInfo

  return (
    <>
      {/* <Helmet>
        <title>{title}</title>
        <meta name="description" content={`${description}.`} />
        <meta name="keywords" content={`${keywords}.`} />

        <meta property="og:site_name" content="Rewardflights" />
        <meta
          property="og:url"
          content={`https://rewardflights.io/flights/${route}`}
        />
      </Helmet> */}

      {/* <FlightsTable flights={flights} /> */}
    </>
  )
}

export default AustralianFlightDetail
