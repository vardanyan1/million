import { Fragment, useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { format, parse, differenceInCalendarDays, parseISO, addDays, formatDistance } from 'date-fns'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ChevronDownIcon, ChevronUpIcon } from "@chakra-ui/icons"


import { trackPage } from '../../services/analytics'
import EarnPointsContent from './EarnPointsContent'
import QantasBookContent from './QantasBookContent'
import AviosBookContent from './AviosBookContent'
import AlertRouteContent from './AlertRouteContent'
import { getAlerts } from "../../services/api"

import cardImage from '../../img/card.svg'
import bellImage from '../../img/bell.svg'

import QFAwards from '../../img/QF.svg'
import VAAwards from '../../img/VA.svg'

import flightImages from '../../flightImages'

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

const numberFormat = new Intl.NumberFormat()

const DATE_FORMAT = 'yyyy-MM-dd HH:mm:ss'

const DATE_FORMAT_EXPANDABLE_ROW = 'EEEE, MMMM dd, HH:mm aa' 
// 'yyyy-MM-dd HH:mm:ss'

const formatTime = (dateStr) => {
    const parsedDate = parse(dateStr, DATE_FORMAT, new Date())
    return format(parsedDate, 'HH:mm')
}

const flightClassesMapping = {
    'ACEECO': "economy",
    'ACEPRM': "premiumEconomy",
    'ACEBUS': "business",
    'ACEFIR': "first",
}

const maxAlertsPerSubscription = {
    'FREE': 0,
    'MONTHLY': 10,
    'ANNUAL': 100
}


const COLORS = {
  secondary: '#6A6E85',

}

const parseDate = (dateStr) => {
    return parse(dateStr, DATE_FORMAT, new Date())
}

const ExpandableRow = ({ flight, lowestPoint }) => {
    return (
        <Box>
            {flight.connections.map((connection, index, connections) => {
                return (
                    <Fragment key={index}>
                        <Flex my={6} fontSize={"sm"} fontWeight={'semibold'}>
                            <Flex alignItems={"center"}>
                                <Image width="36px" height={"36px"} 
                                    src={flightImages[connection.aircraft_details.slice(0, 2)]} mr={6}
                                    zIndex={1}/>
                                    <Box height={84} position="relative" borderLeft={"1px solid #B6BAD1"} mr={6}
                                    _before={{
                                        content: '""',
                                        width: '12px',
                                        height: '12px',
                                        borderRadius: '50%',
                                        border: '1px solid #B6BAD1',
                                        position: "absolute", 
                                        top: '-13px', 
                                        left: '-7px',
                                    }} 
                                    _after={{
                                        content: '""',
                                        width: '12px',
                                        height: '12px',
                                        borderRadius: '50%',
                                        border: '1px solid #B6BAD1',
                                        position: "absolute", 
                                        bottom: '-13px', 
                                        left: '-7px',
                                    }}
                                    />
                            </Flex>
                            <Box w={'45%'}>
                                <Text color={COLORS.secondary}>
                                    {format(parseDate(connection.departure_date), DATE_FORMAT_EXPANDABLE_ROW)}
                                    </Text>
                                <Text>{connection.origin}</Text>
                                <Text color={COLORS.secondary} my={5} fontSize={"xs"}>
                                    {connection.duration}
                                </Text>
                                <Text color={COLORS.secondary}>
                                    {format(parseDate(connection.arrival_date), DATE_FORMAT_EXPANDABLE_ROW)}
                                </Text>
                                <Text>{connection.destination}</Text>
                            </Box>

                            <Box w={'45%'}>
                                <Text color={COLORS.secondary}>{connection.aircraft_details}</Text>
                                <Text color={COLORS.secondary}>{lowestPoint.name} Class</Text>
                                <Text>Last seen: {formatDistance(new Date(flight.created), new Date(), {addSuffix:true})}</Text>
                            </Box>
                        </Flex>
                        {
                            (index < connections.length - 1) && 
                            <Box ml={'60px'} py={4} borderTop={"1px solid #D4D4D9;"} 
                                borderBottom={"1px solid #D4D4D9;"}
                                fontWeight={"semibold"} fontSize={"sm"}>
                                Layover: {connection.destination} {connection.transition_time}
                            </Box>
                        }
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
    const navigate = useNavigate()

    const { data: alerts } = useQuery({
        queryKey: ["alerts"],
        queryFn: getAlerts,
        initialData: [],
        enabled: !!user
      })

    useOutsideClick({
        ref,
        handler: () => setExpandedFlight(null),
    })

    const alertsCount = alerts.length
    const maxAlertsCount = maxAlertsPerSubscription[user?.subscription || 'FREE']
    const canCreateAlerts = user && (alertsCount < maxAlertsCount)

    if (flights.length === 0) {
        return (
            <Text p={2}>{t('table.empty')}</Text>
        )
    }

    return (
        <>
        <Table width={"100%"} sx={{ tableLayout: "fixed" }} ref={ref}>
        <Thead>
            <Tr boxShadow="0px 2px 8px rgba(20, 23, 37, 0.08)" fontSize={[10, 12]}>
                <Show above="lg">
                    <Th textTransform="none" p={2}></Th>
                </Show>
                <Th textTransform="none" p={2} w={{base: '35%', lg: '15%'}}>{t('table.itinerary')}</Th>
                <Show below="lg">
                    <Th textTransform="none" p={2}>{t('table.pointsRequired')}</Th>
                </Show>
                <Show above="lg">
                    <Th textTransform="none" p={2}>{t('table.stops')}</Th>
                    <Th textTransform="none" p={2} w={{lg: '10%'}}>{t('table.economy')}</Th>
                    <Th textTransform="none" p={2} w={{lg: '10%'}}>{t('table.premiumEconomy')}</Th>
                    <Th textTransform="none" p={2} w={{lg: '10%'}}>{t('table.business')}</Th>
                    <Th textTransform="none" p={2} w={{lg: '10%'}}>{t('table.first')}</Th>
                </Show>
                <Th textTransform="none" textAlign="center" p={2}>{t('table.bookHeader')}</Th>
                <Show above="lg">
                    <Th textTransform="none" textAlign="center" p={2}>{t('table.earnPoints')}</Th>
                    <Th textTransform="none" textAlign="center" p={2}>{t('table.alert')}</Th>
                </Show>
            </Tr>
        </Thead>
        <Tbody>
            {flights.map(flight => {
                const { connections } = flight
                const summaryPoints = flight.availabilities
                    .reduce((acc, item) => ({
                        ...acc, 
                        [item.flight_class]: { 
                            points: item.points, 
                            name: t(`table.${flightClassesMapping[item.flight_class]}`) }
                    }), {})

                const lowestPoint = summaryPoints['ACEECO'] || summaryPoints['ACEPRM'] ||
                    summaryPoints['ACEBUS'] || summaryPoints['ACEFIR']

                const highestPoint = summaryPoints['ACEFIR'] || summaryPoints['ACEBUS'] ||
                summaryPoints['ACEPRM'] || summaryPoints['ACEECO']

                const planeImage = flight.connections.length >= 3 ? flightImages.group_3_plus :
                    flightImages[flight.connections[0].aircraft_details.slice(0, 2)]

                const secondPlaneImage = flight.connections.length === 2 && flightImages[flight.connections[1].aircraft_details.slice(0, 2)]
                
                const departureDate = parse(connections[0].departure_date, DATE_FORMAT, new Date())
                const arrivalDate = parse(connections[connections.length - 1].arrival_date, DATE_FORMAT, new Date())
                const diffInDays = differenceInCalendarDays(arrivalDate, departureDate)

                const route = {
                    origin: flight.origin,
                    destination: flight.destination,
                    fromDate: parseISO(flight.departure_date),
                    toDate: addDays(parseISO(flight.departure_date), 1),
                    flightClasses: Object.keys(summaryPoints),
                    preferredPrograms: [flight.source],
                }

                const isFlightExpanded = expandedFlight === flight

                return (
                    <Fragment key={flight.id}>
                    <Tr fontSize={[12, 14]}
                        position={isFlightExpanded ? "relative" : "initial"} 
                        zIndex={isFlightExpanded ? 2 : 0}
                        backgroundColor={isFlightExpanded ? '#F7F7F9' : '#FFF'}
                        transform={isFlightExpanded ? 'translateZ(1px)' : 'none'}
                        boxShadow={isFlightExpanded ? "0px -10px 18px 0px rgba(20, 23, 37, 0.13)" : 'none'}
                        fontWeight={"semibold"} onClick={() => {setExpandedFlight(expandedFlight === flight ? null : flight)}}>
                        <Show above="lg">
                            <Td p={2} position={"relative"} border={isFlightExpanded ? 'none' : ''}>
                                <Image width="36px" src={planeImage} margin="0 auto" position={'relative'} 
                                    zIndex={1} top={secondPlaneImage ? "5px" : "0px"}/>
                                {secondPlaneImage && <Image width="36px" src={secondPlaneImage} margin="0 auto" 
                                    position={"absolute"} zIndex={0} bottom={'20px'} right={'35%'}/>}
                            </Td>
                        </Show>
                        <Td p={2} border={isFlightExpanded ? 'none' : ''}>
                            <Text>
                                {formatTime(connections[0].departure_date)} - {' '} 
                                {formatTime(connections[connections.length - 1].arrival_date)}
                                {diffInDays > 0 && <Text as="sup"> +{diffInDays}</Text>}
                            </Text>
                            <Text fontSize={12}>
                                {connections.map(conn => conn.aircraft_details.split('(')[0]).join(', ')}
                            </Text>
                        </Td>
                        <Show below="lg">
                            <Td p={2} border={isFlightExpanded ? 'none' : ''}>
                                {lowestPoint ? 
                                    <>  
                                        <Text color={'#DD0000'}>
                                            {lowestPoint.points}
                                            <Text as="span" fontSize={10}> +${Math.round(flight.tax_per_adult)}</Text>
                                        </Text>
                                        <Text color={'#141725'} fontSize={12}>{lowestPoint.name}</Text>
                                    </> : 
                                    '-'}
                            </Td>
                        </Show>
                        <Show above="lg">
                            <Td p={2} border={isFlightExpanded ? 'none' : ''}>
                                <Text>{connections.length === 1 ? 'Direct' : connections.length - 1}</Text>
                                <Text fontSize={12} color={"#6A6E85"}>
                                    {connections.slice(0, -1).map(conn => conn.destination).join(', ')}
                                </Text>
                            </Td>
                            <Td p={2} border={isFlightExpanded ? 'none' : ''}>
                                <Text color={'#DD0000'}>
                                    {summaryPoints['ACEECO'] ? 
                                        <>
                                            {numberFormat.format(summaryPoints['ACEECO'].points)}
                                            <Text as="span" fontSize={10}> +${Math.round(flight.tax_per_adult)}</Text>
                                        </> : 
                                        '-'}
                                </Text>
                            </Td>
                            <Td p={2} border={isFlightExpanded ? 'none' : ''}>
                                <Text color={'#DD0000'}>
                                    {summaryPoints['ACEPRM'] ? 
                                        <>
                                            {numberFormat.format(summaryPoints['ACEPRM'].points)}
                                            <Text as="span" fontSize={10}> +${Math.round(flight.tax_per_adult)}</Text>
                                        </> : 
                                        '-'}
                                </Text>
                            </Td>
                            <Td p={2} border={isFlightExpanded ? 'none' : ''}>
                                <Text color={'#DD0000'}>
                                    {summaryPoints['ACEBUS'] ? 
                                        <>
                                            {numberFormat.format(summaryPoints['ACEBUS'].points)}
                                            <Text as="span" fontSize={10}> +${Math.round(flight.tax_per_adult)}</Text>
                                        </> : 
                                        '-'}
                                </Text>
                            </Td>
                            <Td p={2} border={isFlightExpanded ? 'none' : ''}>
                                <Text color={'#DD0000'}>
                                    {summaryPoints['ACEFIR'] ? 
                                        <>
                                            {numberFormat.format(summaryPoints['ACEFIR'].points)}
                                            <Text as="span" fontSize={10}> +${Math.round(flight.tax_per_adult)}</Text>
                                        </> : 
                                        '-'}
                                </Text>
                            </Td>
                        </Show>
                        <Td p={2} border={isFlightExpanded ? 'none' : ''}>
                            <Popover placement={"left"} onOpen={() => {
                                trackPage({ title: 'How to Book? | QFF' })
                            }}>
                                <PopoverTrigger>
                                    <Image src={flight.source === 'QF' ? QFAwards : VAAwards } margin={"0 auto"}/>
                                </PopoverTrigger>
                                <PopoverContent w={{ base: 240, sm: 320 }} p={5} _focus={{boxShadow: 'none'}} borderRadius={8}>
                                    <PopoverBody p={0}>
                                        <QantasBookContent points={highestPoint.points}/>
                                    </PopoverBody>
                                </PopoverContent>
                            </Popover>
                        </Td>
                        <Show above="lg">
                            <Td p={2} border={isFlightExpanded ? 'none' : ''}>
                                <Popover placement={"left"} onOpen={() => {
                                    trackPage({ 
                                        title: 'Earn Points',
                                        destination: flight.destination.name
                                    })
                                }}>
                                    <PopoverTrigger>
                                        <Image src={cardImage} margin="0 auto"/>
                                    </PopoverTrigger>
                                    <PopoverContent p={5} pb={0} _focus={{boxShadow: 'none'}} 
                                        boxShadow="0px 10px 22px rgba(0, 0, 0, 0.14);" borderRadius={8}>
                                        <PopoverBody p={0}>
                                            <EarnPointsContent 
                                                points={highestPoint.points}
                                                destinationAirport={flight.destination}
                                            />
                                        </PopoverBody>
                                    </PopoverContent>
                                </Popover>
                            </Td>
                            <Td p={2} border={isFlightExpanded ? 'none' : ''}>
                                <Popover placement={"left"} 
                                    closeOnBlur={!canCreateAlerts}
                                    onOpen={() => {
                                        trackPage({ 
                                            title: 'Alert Route',
                                        })
                                    }}>
                                    {({ onClose }) => (
                                        <>
                                        <PopoverTrigger>
                                            <Image src={bellImage} margin="0 auto"/>
                                        </PopoverTrigger>
                                        <PopoverContent p={5} 
                                            _focus={{boxShadow: 'none'}} 
                                            boxShadow="0px 10px 22px rgba(0, 0, 0, 0.14);" 
                                            borderRadius={8}
                                            w={360}>
                                            {canCreateAlerts && <PopoverCloseButton />}
                                            <PopoverBody p={0}>

                                                { 
                                                    canCreateAlerts ?
                                                    <AlertRouteContent route={route} onClose={onClose}/> :
                                                    <Box>
                                                        <Text>{t('table.maxAlertReached')}</Text>
                                                    </Box>
                                                 }

                                            </PopoverBody>
                                        </PopoverContent>
                                        </>
                                    )}
                                </Popover>
                            </Td>
                            <Td>
                                { isFlightExpanded ? <ChevronUpIcon boxSize={6}/> : <ChevronDownIcon boxSize={6}/>}
                            </Td>
                        </Show>
                    </Tr>
                    {isFlightExpanded && <Tr backgroundColor={'#F7F7F9'} 
                        boxShadow="0px 15px 18px 0px rgba(20, 23, 37, 0.13)" position={"relative"} zIndex="1"
                    >
                        <Td colSpan={11} p={2} border={0}>
                            <ExpandableRow flight={flight} lowestPoint={lowestPoint}/>
                        </Td>
                    </Tr>}
                    </Fragment>
                )
            })}
        </Tbody>
    </Table>
    </>
    )
}

export default FlightsTable