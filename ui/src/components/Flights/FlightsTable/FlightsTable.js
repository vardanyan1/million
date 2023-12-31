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
// import EarnPointsContent from "./EarnPointsContent"
import VelocityBookContent from "./VelocityBookContent"
import AlertRouteContent from "./AlertRouteContent"
import { getAlerts } from "../../../services/api"

import cardImage from "../../../img/card.svg"
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
  DATE_FORMAT_EXPANDABLE_ROW,
  flightClassesMapping,
  maxAlertsPerSubscription,
} from "../../../constants/constants"
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

  return (
    <Box>
      {flight.details.map((detail, index, details) => {
        const flightTimeInUTC = adjustTimezone(flight.timestamp, 10)

        const lastSeenText = formatDistanceToNow(parseDate(flightTimeInUTC), {
          addSuffix: true,
        })

        const shouldIncludeAbout = !lastSeenText.includes("about")

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
                {/* <Box
                  height={84}
                  position="relative"
                  borderLeft={"1px solid #B6BAD1"}
                  mr={6}
                  _before={{
                    content: '""',
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    border: "1px solid #B6BAD1",
                    position: "absolute",
                    top: "-13px",
                    left: "-7px",
                  }}
                  _after={{
                    content: '""',
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    border: "1px solid #B6BAD1",
                    position: "absolute",
                    bottom: "-13px",
                    left: "-7px",
                  }}
                /> */}
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
                <Text color={COLORS.secondary}>
                  Last seen: {shouldIncludeAbout ? "about " : ""}
                  {lastSeenText}
                </Text>
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

const FlightsTable = ({ flights, user }) => {
  const [expandedFlight, setExpandedFlight] = useState(null)
  const ref = useRef()
  const { t } = useTranslation()

  const { data: alerts } = useQuery({
    queryKey: ["alerts"],
    queryFn: getAlerts,
    initialData: [],
    enabled: !!user,
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

  return (
    <>
      <Table width="100%" ref={ref}>
        <Thead>
          <Tr
            boxShadow="0px 2px 8px rgba(20, 23, 37, 0.08)"
            fontSize={[10, 12]}
          >
            <Show above="lg">
              <Th textTransform="none" p={2}></Th>
            </Show>
            <Th textTransform="none" p={2} w={{ base: "35%", lg: "15%" }}>
              {t("table.itinerary")}
            </Th>
            <Show below="lg">
              <Th textTransform="none" p={2}>
                {t("table.pointsRequired")}
              </Th>
            </Show>
            <Show above="lg">
              <Th textTransform="none" p={2}>
                {t("table.stops")}
              </Th>
              <Th textTransform="none" p={2} w={{ lg: "10%" }}>
                {t("table.economy")}
              </Th>
              <Th textTransform="none" p={2} w={{ lg: "10%" }}>
                {t("table.premiumEconomy")}
              </Th>
              <Th textTransform="none" p={2} w={{ lg: "10%" }}>
                {t("table.business")}
              </Th>
              <Th textTransform="none" p={2} w={{ lg: "10%" }}>
                {t("table.first")}
              </Th>
            </Show>
            <Th textTransform="none" textAlign="center" p={2}>
              {t("table.qantasBookHeader")}
            </Th>
            <Show above="lg">
              <Th textTransform="none" textAlign="center" p={2}>
                {t("table.earnPoints")}
              </Th>
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

            const planeImage =
              details.length >= 3
                ? flightImages.group_3_plus
                : flightImages[details[0].aircraft_details.slice(0, 2)]

            const secondPlaneImage =
              details.length === 2 &&
              flightImages[details[1].aircraft_details.slice(0, 2)]

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

            const checkIfSameAirline = (details) => {
              const regex = /\((.*?)\)/

              // Extract the company names from each string in the array
              const companyNames = details.map((detail) => {
                const match = detail.aircraft_details.match(regex)

                return match ? match[1] : null
              })

              // Check if all extracted company names are the same
              return companyNames.every((name, _, arr) => name === arr[0])
            }

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
                  <Show above="lg">
                    <Td
                      p="8px"
                      width="50px"
                      position="relative"
                      border={isFlightExpanded ? "none" : ""}
                    >
                      <Image
                        width="100%"
                        src={planeImage}
                        margin="0 auto"
                        position="relative"
                        right="-4px"
                        zIndex={1}
                        top={secondPlaneImage ? "5px" : "0px"}
                      />
                      {secondPlaneImage && !checkIfSameAirline(details) && (
                        <Image
                          width="100%"
                          src={secondPlaneImage}
                          margin="0 auto"
                          position="relative"
                          right="4px"
                          bottom="18px"
                          zIndex={0}
                        />
                      )}
                    </Td>
                  </Show>
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
                      {summaryPoints["Economy"] ? (
                        <>
                          <Text color="#DD0000">
                            {numberFormat.format(
                              summaryPoints["Economy"].points
                            )}
                            <Text as="span" fontSize={10}>
                              {" "}
                              +$
                              {Math.round(
                                summaryPoints["Economy"].tax_per_adult
                              )}
                            </Text>
                          </Text>
                          <Text color="#141725" fontSize="xs">
                            {summaryPoints["Economy"].remaining_seats
                              ? summaryPoints["Economy"].remaining_seats +
                                " seats left"
                              : "Min. 2 seats left"}
                          </Text>
                        </>
                      ) : (
                        "-"
                      )}
                    </Td>
                    <Td p={2} border={isFlightExpanded ? "none" : ""}>
                      {summaryPoints["PremiumEconomy"] ? (
                        <>
                          <Text color="#DD0000">
                            {numberFormat.format(
                              summaryPoints["PremiumEconomy"].points
                            )}
                            <Text as="span" fontSize={10} color="#DD0000">
                              {" "}
                              +$
                              {Math.round(
                                summaryPoints["PremiumEconomy"].tax_per_adult
                              )}
                            </Text>
                          </Text>
                          <Text color="#141725" fontSize="xs">
                            {summaryPoints["PremiumEconomy"].remaining_seats
                              ? summaryPoints["PremiumEconomy"]
                                  .remaining_seats + " seats left"
                              : "Min. 2 seats left"}
                          </Text>
                        </>
                      ) : (
                        "-"
                      )}
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
                      {/* We will open this logic, when activate Earn Points */}
                      {/* {flight.source === "QF" ? (
                        <Popover
                          placement="left"
                          onOpen={() => {
                            trackPage({
                              title: "Earn Points",
                              destination: flight.destination,
                            })
                          }}
                          isOpen={false}
                        >
                          <PopoverTrigger>
                            <Image src={cardImage} margin="0 auto" />
                          </PopoverTrigger>
                          <PopoverContent
                            p={5}
                            pb={0}
                            _focus={{ boxShadow: "none" }}
                            boxShadow="0px 10px 22px rgba(0, 0, 0, 0.14);"
                            borderRadius={8}
                          >
                            <PopoverBody p={0}>
                              <EarnPointsContent
                                points={highestPoint.points}
                                destinationAirport={flight.destination}
                              />
                            </PopoverBody>
                          </PopoverContent>
                        </Popover>
                      ) : ( */}
                      <Image src={cardImage} margin="0 auto" opacity={0.3} />
                      {/* )} */}
                    </Td>
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
