import { Fragment, useState, useRef } from "react"
import { useTranslation } from "react-i18next"
import {
  format,
  differenceInCalendarDays,
  parseISO,
  formatDistanceToNow,
  addDays,
} from "date-fns"
import { useQuery } from "@tanstack/react-query"
import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons"

import { trackPage } from "../../../services/analytics"
import VelocityBookContent from "./VelocityBookContent"
import AlertRouteContent from "./AlertRouteContent"
import { getAlerts } from "../../../services/api"

import bellImage from "../../../img/bell.svg"

import QFAwards from "../../../img/QF.svg"
import VAAwards from "../../../img/VA.png"
import airplane from "../../../img/airplane.svg"

import flightImages from "../../../flightImages"

import {
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Image,
  Show,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverCloseButton,
  Flex,
  Box,
  useOutsideClick,
} from "@chakra-ui/react"
import {
  COLORS,
  DATE_FORMAT_AUSTRALIA_DEPART,
  DATE_FORMAT_EXPANDABLE_ROW,
  flightClassesMapping,
  maxAlertsPerSubscription,
} from "../../../constants"
import QantasBookContent from "./QantasBookContent"

const numberFormat = new Intl.NumberFormat()

const formatTime = (dateStr) => {
  const parsedDate = parseISO(dateStr)
  return format(parsedDate, "HH:mm")
}

const parseDate = (dateStr) => {
  return parseISO(dateStr)
}

const ExpandableRow = ({ flight }) => {
  const showFlightClasses = (flightClass, index) => {
    const uniqueFlightClasses = flightClass.map(({ cabin_type }) => {
      const classArr = cabin_type.split(", ")
      return classArr[index]
    })

    const sortOrder = ["Economy", "PremiumEconomy", "Business", "First"]

    uniqueFlightClasses.sort((a, b) => {
      const indexA = sortOrder.indexOf(a)
      const indexB = sortOrder.indexOf(b)
      if (indexA === -1) return 1 // If not found, place at the end
      if (indexB === -1) return -1 // If not found, place at the end
      return indexA - indexB
    })

    return uniqueFlightClasses.join(", ")
  }

  return (
    <Box>
      {flight.details.map((detail, index, details) => {
        const planeImage =
          details.length >= 3
            ? flightImages.group_3_plus
            : flightImages[details[index].aircraft_details.slice(0, 2)]

        return (
          <Fragment key={index}>
            <Flex my={6} fontSize="sm" fontWeight="semibold">
              <Flex alignItems="center" gap="10px" w="36px">
                <Image
                  width="100%"
                  src={planeImage}
                  margin="0 auto"
                  position="relative"
                  zIndex={1}
                />
              </Flex>

              <Image
                src={airplane}
                width="24px"
                height="108px"
                alt="airplane"
                alignSelf="center"
                mr="2px"
              />

              <Box w={"45%"} fontSize="12px">
                <Text color={COLORS.secondary}>
                  {format(
                    parseDate(detail.departure_date),
                    DATE_FORMAT_EXPANDABLE_ROW
                  )}
                </Text>
                <Text>{detail.from_airport}</Text>
                <Text color={COLORS.secondary} my={5} fontSize={"xs"}>
                  {detail.flight_duration}
                </Text>
                <Text color={COLORS.secondary}>
                  {format(
                    parseDate(detail.arrival_date),
                    DATE_FORMAT_EXPANDABLE_ROW
                  )}
                </Text>
                <Text>{detail.to_airport}</Text>
              </Box>

              <Box w={"45%"} fontSize={"12px"}>
                <Text color={COLORS.secondary}>
                  Flight: {detail.aircraft_details}
                </Text>
                <Text color={COLORS.secondary}>
                  Availability: {showFlightClasses(flight.class_details, index)}
                </Text>
                {detail?.equipment && (
                  <Text color={COLORS.secondary}>
                    Aircraft: {detail.equipment}
                  </Text>
                )}
              </Box>
            </Flex>
            {index < details.length - 1 && (
              <Box
                ml="60px"
                py={2}
                borderTop="1px solid #D4D4D9;"
                borderBottom="1px solid #D4D4D9;"
                fontWeight="semibold"
                fontSize={"12px"}
              >
                <Text>
                  Layover: {detail.to_airport} {detail.transition_time}
                </Text>
              </Box>
            )}
          </Fragment>
        )
      })}
    </Box>
  )
}

const FlightsTable = ({
  flights,
  user,
  orderBy,
  descending,
  setOrderBy,
  setDescending,
}) => {
  const ref = useRef()
  const { t } = useTranslation()

  const [expandedFlight, setExpandedFlight] = useState(null)

  const { data: alerts } = useQuery({
    queryKey: ["alerts"],
    queryFn: getAlerts,
    initialData: [],
    enabled: true,
  })

  useOutsideClick({
    ref,
    handler: () => setExpandedFlight(null),
  })

  const alertsCount = alerts.length
  const maxAlertsCount = maxAlertsPerSubscription[user?.subscription || "FREE"]
  const canCreateAlerts = user && alertsCount < maxAlertsCount

  if (flights.length === 0) {
    return <Text p={2}>{t("table.empty")}</Text>
  }

  const sortFlights = (key) => {
    let isDescending = "False"
    if (key === orderBy && descending === "False") {
      isDescending = "True"
    }
    setOrderBy(key)
    setDescending(isDescending)
  }

  return (
    <>
      <Table width="100%" ref={ref}>
        <Thead>
          <Tr
            boxShadow="0px 2px 8px rgba(20, 23, 37, 0.08)"
            fontSize={[10, 12]}
          >
            <Th
              textTransform="none"
              p={2}
              w={{ lg: "10%" }}
              cursor={"pointer"}
              onClick={() => sortFlights("departure_date")}
            >
              {t("table.depart")}
              {orderBy === "departure_date" ? (
                descending === "True" ? (
                  <ChevronUpIcon boxSize="4" />
                ) : (
                  <ChevronDownIcon boxSize="4" />
                )
              ) : null}
            </Th>
            <Th
              textTransform="none"
              p={2}
              w={{ lg: "10%" }}
              cursor={"pointer"}
              onClick={() => sortFlights("from_airport")}
            >
              {t("table.from")}
              {orderBy === "from_airport" ? (
                descending === "True" ? (
                  <ChevronUpIcon boxSize="4" />
                ) : (
                  <ChevronDownIcon boxSize="4" />
                )
              ) : null}
            </Th>
            <Th
              textTransform="none"
              p={2}
              w={{ lg: "10%" }}
              cursor={"pointer"}
              onClick={() => sortFlights("to_airport")}
            >
              {t("table.to")}
              {orderBy === "to_airport" ? (
                descending === "True" ? (
                  <ChevronUpIcon boxSize="4" />
                ) : (
                  <ChevronDownIcon boxSize="4" />
                )
              ) : null}
            </Th>
            <Th textTransform="none" p={2} w={{ base: "35%", lg: "15%" }}>
              {t("table.itinerary")}
            </Th>
            <Show below="lg">
              <Th textTransform="none" p={2}>
                {t("table.pointsRequired")}
              </Th>
            </Show>
            <Show above="lg">
              <Th textTransform="none" p={2} w={{ lg: "8%" }}>
                {t("table.stops")}
              </Th>
              <Th
                textTransform="none"
                p={2}
                w={{ lg: "10%" }}
                cursor={"pointer"}
                onClick={() => sortFlights("designated_class")}
              >
                {t("table.business")}
                {orderBy === "designated_class" ? (
                  descending === "True" ? (
                    <ChevronUpIcon boxSize="4" />
                  ) : (
                    <ChevronDownIcon boxSize="4" />
                  )
                ) : null}
              </Th>
              <Th
                textTransform="none"
                p={2}
                w={{ lg: "10%" }}
                cursor={"pointer"}
                onClick={() => sortFlights("designated_class")}
              >
                {t("table.first")}
                {orderBy === "designated_class" ? (
                  descending === "True" ? (
                    <ChevronUpIcon boxSize="4" />
                  ) : (
                    <ChevronDownIcon boxSize="4" />
                  )
                ) : null}
              </Th>
              <Th textTransform="none" p={2} w={{ lg: "10%" }}>
                {t("table.lastSeen")}
              </Th>
            </Show>
            <Th textTransform="none" textAlign="center" p={2}>
              {t("table.qantasBookHeader")}
            </Th>
            <Show above="lg">
              <Th textTransform="none" textAlign="center" p={2}>
                {t("table.alert")}
              </Th>
            </Show>
          </Tr>
        </Thead>
        <Tbody>
          {flights.map((flight) => {
            const { details } = flight

            const summaryPoints = flight.class_details.reduce(
              (acc, item) => ({
                ...acc,
                [item.designated_class]: {
                  points: item.points_per_adult,
                  name: t(
                    `table.${flightClassesMapping[item.designated_class]}`
                  ),
                  tax_per_adult: item.tax_per_adult,
                  remaining_seats: item.remaining_seats,
                },
              }),
              {}
            )

            const lowestPoint =
              summaryPoints["Economy"] ||
              summaryPoints["PremiumEconomy"] ||
              summaryPoints["Business"] ||
              summaryPoints["First"]

            const highestPoint =
              summaryPoints["First"] ||
              summaryPoints["Business"] ||
              summaryPoints["PremiumEconomy"] ||
              summaryPoints["Economy"]

            const departureDate = new Date(details[0].departure_date)
            const arrivalDate = new Date(
              details[details.length - 1].arrival_date
            )
            const diffInDays = differenceInCalendarDays(
              arrivalDate,
              departureDate
            )

            const route = {
              origin: flight.origin,
              destination: flight.destination,
              startDate: format(
                parseISO(flight.flight_start_date),
                "yyyy-MM-dd"
              ),
              endDate: format(
                addDays(parseISO(flight.flight_start_date), 1),
                "yyyy-MM-dd"
              ),
              flightClasses: Object.keys(summaryPoints),
              preferredPrograms: [flight.source === "VA" ? "VA" : "Qantas FF"],
              source: [flight.source],
            }

            const isFlightExpanded = expandedFlight === flight

            const adjustTimezone = (dateStr, timezoneOffsetInHoursFromUTC) => {
              const [datePart, timePart] = dateStr.split("T")
              const [year, month, day] = datePart.split("-").map(Number)
              const [hour, minute, second] = timePart.split(":").map(Number)

              const utcDate = new Date(
                Date.UTC(
                  year,
                  month - 1,
                  day,
                  hour - timezoneOffsetInHoursFromUTC,
                  minute,
                  second
                )
              )

              return utcDate.toISOString()
            }
            const flightTimeInUTC = adjustTimezone(flight.timestamp, 10)
            const lastSeenText = formatDistanceToNow(
              parseDate(flightTimeInUTC),
              {
                addSuffix: true,
              }
            )
            const shouldIncludeAbout = !lastSeenText.includes("about")

            return (
              <Fragment key={flight.id}>
                <Tr
                  fontSize={[12, 14]}
                  position={isFlightExpanded ? "relative" : "initial"}
                  zIndex={isFlightExpanded ? 2 : 0}
                  backgroundColor={isFlightExpanded ? "#F7F7F9" : "#FFFFFF"}
                  transform={isFlightExpanded ? "translateZ(1px)" : "none"}
                  boxShadow={
                    isFlightExpanded
                      ? "0px -10px 18px 0px rgba(20, 23, 37, 0.13)"
                      : "none"
                  }
                  fontWeight="semibold"
                  onClick={() => {
                    setExpandedFlight(expandedFlight === flight ? null : flight)
                  }}
                  cursor="pointer"
                >
                  <Td
                    p="8px"
                    width="50px"
                    whiteSpace="noWrap"
                    fontWeight={600}
                    fontSize={12}
                  >
                    {format(
                      parseDate(flight.details[0].departure_date),
                      DATE_FORMAT_AUSTRALIA_DEPART
                    )}
                  </Td>
                  <Td p="8px" width="50px" fontSize={12}>
                    {flight.origin.name}
                  </Td>
                  <Td p="8px" width="50px" fontSize={12}>
                    {flight.destination.name}
                  </Td>
                  <Td p={2} border={isFlightExpanded ? "none" : ""}>
                    <Text>
                      {formatTime(flight.flight_start_date)} -{" "}
                      {formatTime(flight.flight_end_date)}
                      {diffInDays > 0 && <Text as="sup"> +{diffInDays}</Text>}
                    </Text>
                    <Text fontSize={12}>
                      {details
                        .map((conn) => conn.aircraft_details.split("(")[0])
                        .join(", ")}
                    </Text>
                  </Td>
                  <Show below="lg">
                    <Td
                      p={2}
                      border={isFlightExpanded ? "none" : ""}
                      fontSize={12}
                    >
                      {lowestPoint ? (
                        <>
                          <Text color="#DD0000">
                            {lowestPoint.points}
                            <Text as="span" fontSize={10}>
                              {" "}
                              +$
                              {Math.round(lowestPoint.tax_per_adult)}
                            </Text>
                          </Text>
                          <Text color="#141725">{lowestPoint.name}</Text>
                          <Text color="#141725">
                            {lowestPoint.remaining_seats
                              ? lowestPoint.remaining_seats + " seats left"
                              : "Min. 2 seats left"}
                          </Text>
                        </>
                      ) : (
                        "-"
                      )}
                    </Td>
                  </Show>
                  <Show above="lg">
                    <Td
                      p={2}
                      border={isFlightExpanded ? "none" : ""}
                      fontSize={"12px"}
                    >
                      <Text>
                        {details.length === 1 ? "Direct" : details.length - 1}
                      </Text>
                      <Text fontSize={12} color={"#6A6E85"}>
                        {details
                          .slice(0, -1)
                          .map(
                            (conn) => conn.to_airport.match(/\(([^)]+)\)$/)[1]
                          )
                          .join(", ")}
                      </Text>
                    </Td>
                    <Td p={2} border={isFlightExpanded ? "none" : ""}>
                      {summaryPoints["Business"] ? (
                        <>
                          <Text color="#DD0000">
                            {numberFormat.format(
                              summaryPoints["Business"].points
                            )}
                            <Text as="span" fontSize={10}>
                              {" "}
                              +$
                              {Math.round(
                                summaryPoints["Business"].tax_per_adult
                              )}
                            </Text>
                          </Text>
                          <Text color="#141725" fontSize="xs">
                            {summaryPoints["Business"].remaining_seats
                              ? summaryPoints["Business"].remaining_seats +
                                " seats left"
                              : "Min. 2 seats left"}
                          </Text>
                        </>
                      ) : (
                        "-"
                      )}
                    </Td>
                    <Td p={2} border={isFlightExpanded ? "none" : ""}>
                      {summaryPoints["First"] ? (
                        <>
                          <Text color="#DD0000">
                            {numberFormat.format(summaryPoints["First"].points)}
                            <Text as="span" fontSize={10}>
                              {" "}
                              +$
                              {Math.round(summaryPoints["First"].tax_per_adult)}
                            </Text>
                          </Text>
                          <Text color="#141725" fontSize="xs">
                            {summaryPoints["First"].remaining_seats
                              ? summaryPoints["First"].remaining_seats +
                                " seats left"
                              : "Min. 2 seats left"}
                          </Text>
                        </>
                      ) : (
                        "-"
                      )}
                    </Td>
                  </Show>
                  <Td
                    p={2}
                    border={isFlightExpanded ? "none" : ""}
                    fontSize={"12px"}
                  >
                    <Text color={COLORS.secondary}>
                      {shouldIncludeAbout ? "about " : ""}
                      {lastSeenText}
                    </Text>
                  </Td>
                  <Td p={2} border={isFlightExpanded ? "none" : ""}>
                    <Popover
                      placement="left"
                      onOpen={() => {
                        trackPage({ title: "How to Book? | QFF" })
                      }}
                    >
                      <PopoverTrigger>
                        <Image
                          src={flight.source === "QF" ? QFAwards : VAAwards}
                          margin="0 auto"
                          width="28px"
                          height="28px"
                          onClick={(e) => {
                            e.stopPropagation()
                          }}
                        />
                      </PopoverTrigger>
                      <PopoverContent
                        w={{ base: 240, sm: 320 }}
                        p={5}
                        _focus={{ boxShadow: "none" }}
                        borderRadius={8}
                      >
                        <PopoverBody p={0}>
                          {flight.source === "VA" ? (
                            <VelocityBookContent points={highestPoint.points} />
                          ) : (
                            <QantasBookContent points={highestPoint.points} />
                          )}
                        </PopoverBody>
                      </PopoverContent>
                    </Popover>
                  </Td>
                  <Show above="lg">
                    <Td p={2} border={isFlightExpanded ? "none" : ""}>
                      <Popover
                        placement="left"
                        closeOnBlur={true}
                        onOpen={() => {
                          trackPage({
                            title: "Alert Route",
                          })
                        }}
                      >
                        {({ onClose }) => (
                          <>
                            <PopoverTrigger>
                              <Image
                                src={bellImage}
                                onClick={(e) => {
                                  e.stopPropagation()
                                }}
                                margin="0 auto"
                              />
                            </PopoverTrigger>
                            <PopoverContent
                              p={5}
                              _focus={{ boxShadow: "none" }}
                              boxShadow="0px 10px 22px rgba(0, 0, 0, 0.14);"
                              borderRadius={8}
                              w={360}
                              onClick={(e) => e.stopPropagation()}
                            >
                              {canCreateAlerts && <PopoverCloseButton />}
                              <PopoverBody p={0}>
                                {canCreateAlerts ? (
                                  <AlertRouteContent
                                    route={route}
                                    onClose={onClose}
                                    isNew={true}
                                  />
                                ) : (
                                  <Box>
                                    <Text>{t("table.maxAlertReached")}</Text>
                                  </Box>
                                )}
                              </PopoverBody>
                            </PopoverContent>
                          </>
                        )}
                      </Popover>
                    </Td>
                    <Td>
                      {isFlightExpanded ? (
                        <ChevronUpIcon boxSize={6} />
                      ) : (
                        <ChevronDownIcon boxSize={6} />
                      )}
                    </Td>
                  </Show>
                </Tr>
                {isFlightExpanded && (
                  <Tr
                    backgroundColor={"#F7F7F9"}
                    boxShadow="0px 15px 18px 0px rgba(20, 23, 37, 0.13)"
                    position={"relative"}
                    zIndex="1"
                  >
                    <Td colSpan={11} p={2} border={0}>
                      <ExpandableRow flight={flight} />
                    </Td>
                  </Tr>
                )}
              </Fragment>
            )
          })}
        </Tbody>
      </Table>
    </>
  )
}

export default FlightsTable
