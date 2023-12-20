import { useContext } from "react"
import AustralianFlightDataContext from "./FlightDataContext"
import FlightsTable from "./FlightsTable/FlightsTable"
// import { Helmet } from "react-helmet"
// import { useParams } from "react-router-dom"
// import { australianFlightsSEOInfo } from "../../constants/seoInfoAustralia"

const AustralianFlightDetail = ({
  orderBy,
  descending,
  setOrderBy,
  setDescending,
}) => {
  const { flights, user } = useContext(AustralianFlightDataContext)

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

      <FlightsTable
        flights={flights}
        user={user}
        orderBy={orderBy}
        descending={descending}
        setOrderBy={setOrderBy}
        setDescending={setDescending}
      />
    </>
  )
}

export default AustralianFlightDetail
