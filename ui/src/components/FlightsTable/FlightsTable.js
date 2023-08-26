import { Fragment, useState, useRef } from "react"
import { useTranslation } from "react-i18next"
import {
  format,
  parse,
  differenceInCalendarDays,
  parseISO,
  addDays,
  formatDistance,
} from "date-fns"
import { useQuery } from "@tanstack/react-query"
import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons"

import { trackPage } from "../../services/analytics"
import EarnPointsContent from "./EarnPointsContent"
import VelocityBookContent from "./VelocityBookContent"
import AlertRouteContent from "./AlertRouteContent"
import { getAlerts } from "../../services/api"

import cardImage from "../../img/card.svg"
import bellImage from "../../img/bell.svg"

import QFAwards from "../../img/QF.svg"
import VAAwards from "../../img/VA.png"

import flightImages from "../../flightImages"

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
  DATE_FORMAT,
  DATE_FORMAT_EXPANDABLE_ROW,
  flightClassesMapping,
  maxAlertsPerSubscription,
} from "../../constants"

const numberFormat = new Intl.NumberFormat()

const formatTime = (dateStr) => {
  const parsedDate = parseISO(dateStr)
  return format(parsedDate, "HH:mm")
}

const parseDate = (dateStr) => {
  return parseISO(dateStr)
}

const ExpandableRow = ({
  flight,
  lowestPoint,
  planeImage,
  secondPlaneImage,
}) => {
  const showFlightClasses = (flightClass) => {
    let uniqueFlightClasses = [
      ...new Set(flightClass.split(", ").map((item) => item.trim())),
    ]
    let result = uniqueFlightClasses.join(", ")

    return result
  }

  return (
    <Box>
      {flight.details.map((detail, index, details) => {
        return (
          <Fragment key={index}>
            <Flex my={6} fontSize="sm" fontWeight="semibold">
              <Flex alignItems="center" gap="10px" w="36px" mr="26px">
                <Image
                  width="100%"
                  src={planeImage}
                  margin="0 auto"
                  position="relative"
                  zIndex={1}
                  top={secondPlaneImage ? "5px" : "0px"}
                />
                <Box
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
                />
              </Flex>
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
                  Availability:{" "}
                  {showFlightClasses(flight.class_details[0].cabin_type)}
                </Text>
                <Text color={COLORS.secondary}>
                  Aircraft: {detail.equipment}
                </Text>
                <Text color={COLORS.secondary}>
                  Last seen: about{" "}
                  {formatDistance(new Date(flight.timestamp), new Date(), {
                    addSuffix: true,
                  })}
                </Text>
              </Box>
            </Flex>
            {index < details.length - 1 && (
              <Box
                ml="60px"
                py={4}
                borderTop="1px solid #D4D4D9;"
                borderBottom="1px solid #D4D4D9;"
                fontWeight="semibold"
                fontSize="sm"
              >
                Layover: {detail.to_airport} {detail.transition_time}
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

            const departureDate = parse(
              details[0].departure_date,
              DATE_FORMAT,
              new Date()
            )
            const arrivalDate = parse(
              details[details.length - 1].arrival_date,
              DATE_FORMAT,
              new Date()
            )
            const diffInDays = differenceInCalendarDays(
              arrivalDate,
              departureDate
            )

            const route = {
              origin: flight.origin,
              destination: flight.destination,
              fromDate: parseISO(flight.flight_start_date),
              toDate: addDays(parseISO(flight.flight_start_date), 1),
              flightClasses: Object.keys(summaryPoints),
              preferredPrograms: [flight.source],
            }

            const isFlightExpanded = expandedFlight === flight

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
                  fontWeight={"semibold"}
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
                      {secondPlaneImage && (
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
                              {Math.round(
                                flight.class_details[0].tax_per_adult
                              )}
                            </Text>
                          </Text>
                          <Text color={"#141725"}>{lowestPoint.name}</Text>
                          <Text color={"#141725"}>
                            {flight.class_details[0].remaining_seats} seats left
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
                          .map((conn) => conn.to_airport)
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
                                flight.class_details[0].tax_per_adult
                              )}
                            </Text>
                          </Text>
                          <Text color="#141725" fontSize="xs">
                            {flight.class_details[0].remaining_seats} seats left
                          </Text>
                        </>
                      ) : (
                        "-"
                      )}
                    </Td>
                    <Td p={2} border={isFlightExpanded ? "none" : ""}>
                      <Text color={"#DD0000"}>
                        {summaryPoints["PremiumEconomy"] ? (
                          <>
                            {numberFormat.format(
                              summaryPoints["PremiumEconomy"].points
                            )}
                            <Text as="span" fontSize={10}>
                              {" "}
                              +$
                              {Math.round(
                                flight.class_details[0].tax_per_adult
                              )}
                            </Text>
                          </>
                        ) : (
                          "-"
                        )}
                      </Text>
                    </Td>
                    <Td p={2} border={isFlightExpanded ? "none" : ""}>
                      <Text color="#DD0000">
                        {summaryPoints["Business"] ? (
                          <>
                            {numberFormat.format(
                              summaryPoints["Business"].points
                            )}
                            <Text as="span" fontSize={10}>
                              {" "}
                              +$
                              {Math.round(
                                flight.class_details[0].tax_per_adult
                              )}
                            </Text>
                          </>
                        ) : (
                          "-"
                        )}
                      </Text>
                    </Td>
                    <Td p={2} border={isFlightExpanded ? "none" : ""}>
                      <Text color={"#DD0000"}>
                        {summaryPoints["First"] ? (
                          <>
                            {numberFormat.format(summaryPoints["First"].points)}
                            <Text as="span" fontSize={10}>
                              {" "}
                              +$
                              {Math.round(
                                flight.class_details[0].tax_per_adult
                              )}
                            </Text>
                          </>
                        ) : (
                          "-"
                        )}
                      </Text>
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
                          <VelocityBookContent points={highestPoint.points} />
                        </PopoverBody>
                      </PopoverContent>
                    </Popover>
                  </Td>
                  <Show above="lg">
                    <Td p={2} border={isFlightExpanded ? "none" : ""}>
                      {flight.source === "QF" ? (
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
                      ) : (
                        <Image src={cardImage} margin="0 auto" opacity={0.3} />
                      )}
                    </Td>
                    <Td p={2} border={isFlightExpanded ? "none" : ""}>
                      <Popover
                        placement="left"
                        closeOnBlur={!canCreateAlerts}
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
                            >
                              {canCreateAlerts && <PopoverCloseButton />}
                              <PopoverBody p={0}>
                                {canCreateAlerts ? (
                                  <AlertRouteContent
                                    route={route}
                                    onClose={onClose}
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
                      <ExpandableRow
                        flight={flight}
                        lowestPoint={lowestPoint}
                        planeImage={planeImage}
                        secondPlaneImage={secondPlaneImage}
                      />
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
