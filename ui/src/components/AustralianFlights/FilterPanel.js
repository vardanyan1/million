import { useEffect } from "react"
import { Box, Stack } from "@chakra-ui/react"
import "react-datepicker/dist/react-datepicker.css"
import { useQuery } from "@tanstack/react-query"
import { useParams } from "react-router-dom"

import { Select } from "../Select"
import { getOriginAirports, getDestinationAirports } from "../../services/api"

const AustralianFlightsFilterPanel = ({ from, to, onChange }) => {
  const params = useParams()
  const route = params?.route?.split("-")[1]

  const originAirportsQuery = useQuery({
    queryKey: ["originAirports", to?.value],
    queryFn: getOriginAirports,
    initialData: [],
  })
  const destinationAirportsQuery = useQuery({
    queryKey: ["destinationAirports", from?.value],
    queryFn: getDestinationAirports,
    initialData: [],
    enabled: !!from,
  })

  const sortedOriginAirports = originAirportsQuery.data.sort((a, b) =>
    a.name.localeCompare(b.name)
  )

  const originAirportOptions = sortedOriginAirports.map((airport) => {
    return { value: airport.code, label: `${airport.name} (${airport.code})` }
  })

  useEffect(() => {
    if (originAirportOptions.length > 0 && !from) {
      onChange({ from: originAirportOptions[0] })
    }
  }, [originAirportOptions, from, onChange])

  const sortedAirports = destinationAirportsQuery.data.sort((a, b) =>
    a.name.localeCompare(b.name)
  )

  const destinationAirportOptions = sortedAirports.map((airport) => {
    return { value: airport.code, label: `${airport.name} (${airport.code})` }
  })

  useEffect(() => {
    if (destinationAirportOptions.length > 0 && !to && route) {
      const existingDestinationValue = destinationAirportOptions.find(
        (el) => el.value === route
      )

      existingDestinationValue && onChange({ to: existingDestinationValue })
    }
  }, [destinationAirportOptions, to, onChange, route])

  return (
    <Stack>
      <Stack>
        <Box w={{ lg: 250 }}>
          <Select
            placeholder="Leaving Australia"
            onChange={(value) => onChange({ from: value })}
            value={from}
            options={originAirportOptions}
          />
        </Box>
      </Stack>
    </Stack>
  )
}

export default AustralianFlightsFilterPanel
