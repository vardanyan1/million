import { forwardRef, useEffect } from "react"
import DatePicker, { CalendarContainer } from "react-datepicker"
import { ChevronDownIcon } from "@chakra-ui/icons"
import { Box, Stack, Image, Flex, Heading, Button, Divider, Input, useDisclosure, Text, Popover, PopoverTrigger,PopoverArrow, PopoverCloseButton, PopoverBody, PopoverContent, PopoverHeader } from "@chakra-ui/react"
import "react-datepicker/dist/react-datepicker.css"
import { useQuery } from '@tanstack/react-query'
import pickBy from 'lodash/pickBy'
import { isSameDay, isFuture, format, addMonths, isToday } from 'date-fns'
import { useNavigate } from "react-router-dom"
import { Link as RouterLink } from 'react-router-dom'
import { useTranslation } from "react-i18next"

import { Select } from "./Select"
import { getFlightDates, getOriginAirports, getDestinationAirports, getPricingPlans } from "../services/api"
import circleImage from '../img/circle.svg'
import locationPinImage from '../img/location_pin.svg'


const Circle = ({ color }) => {
    return (
       <Box borderRadius="50%" width={"6px"} height={"6px"} background={color} margin={"0 auto"}></Box>
    )
}

const DatePickerInput = forwardRef((props, ref) => {
    const { value, onClick } = props
    return (
        <Flex onClick={onClick} ref={ref} position="relative">
            <Input sx={{caretColor: 'transparent'}} inputMode='none' value={value} 
                onChange={()=>{}} minHeight={10} 
                borderRadius={12} _focus={{border: '1px solid black', boxShadow: 'none'}}
                border="1px solid black" borderColor={"gray.200"} py={1} px={3}/>
            <ChevronDownIcon boxSize={5} position="absolute" right="4" height="100%"/>
        </Flex>
    )
});

const flightClassesColours = {
    'ACEECO': '#DD0000',
    'ACEPRM': "#FC9E0A",
    'ACEBUS': "#B39E69",
    'ACEFIR': "#796F5A",
}

const CustomCalendarContainer = ({className, children}) => {
    return (
        <div style={{ background: "#fff" }} className="datepicker-wrapper">
            <CalendarContainer className={className}>
                {children}
            </CalendarContainer>
            <Flex borderTop={"1px solid rgba(0, 0, 0, 0.12)"} justifyContent={"space-around"} py={"24px"} mx={3}>
                <Box>
                    <Circle color={flightClassesColours['ACEECO']}/>
                    <Text mt={1} color="#141725" fontWeight="semibold" fontSize="xs">Economy</Text>
                </Box>
                <Box>
                    <Circle color={flightClassesColours['ACEPRM']}/>
                    <Text mt={1} color="#141725" fontWeight="semibold" fontSize="xs">Premium Economy</Text>
                </Box>
                <Box>
                    <Circle color={flightClassesColours['ACEBUS']}/>
                    <Text mt={1} color="#141725" fontWeight="semibold" fontSize="xs">Business Class</Text>
                </Box>
                <Box>
                    <Circle color={flightClassesColours['ACEFIR']}/>
                    <Text mt={1} color="#141725" fontWeight="semibold" fontSize="xs">First Class</Text>
                </Box>
            </Flex>
        </div>
    )
}
  
const buildGradientString = (availabilities) => {
    const chunks = [
        'transparent 0% 2%',
        availabilities.includes('ACEECO') ? `${flightClassesColours['ACEECO']} 2% 23%` : 'transparent 2% 23%',
        'transparent 23% 27%',
        availabilities.includes('ACEPRM') ? `${flightClassesColours['ACEPRM']} 27% 48%` : 'transparent 27% 48%',
        'transparent 48% 52%',
        availabilities.includes('ACEBUS') ? `${flightClassesColours['ACEBUS']} 52% 73%` : 'transparent 52% 73%',
        'transparent 73% 77%',
        availabilities.includes('ACEFIR') ? `${flightClassesColours['ACEFIR']} 77% 98%` : 'transparent 77% 98%',
        'transparent 98% 100%',
    ];
    const result = `conic-gradient(${chunks.join(', ')})`
    return result
}

const FilterPanel = ({ from, to, date, onChange, user }) => {
    const { t } = useTranslation()
    const { isOpen, onOpen, onClose } = useDisclosure()
    const navigate = useNavigate()
    const originAirportsQuery = useQuery({ 
        queryKey: ['originAirports'], 
        queryFn: getOriginAirports, 
        initialData: [] 
    })
    const destinationAirportsQuery = useQuery({ 
        queryKey: ['destinationAirports', from?.value],
        queryFn: getDestinationAirports,
        initialData: [],
        enabled: !!from
    })
    const flightDatesParams = pickBy({ origin: from.value, destination: to.value})
    const flightDatesQuery = useQuery({
        queryKey: ['flightDates', flightDatesParams],
        queryFn: getFlightDates,
        initialData: [],
        enabled: !!(from && to)
    })
    const { data: pricingPlans } = useQuery({
        queryKey: ['pricingPlans'],
        queryFn: getPricingPlans,
        initialData: []
    })

    const monthPlan = pricingPlans.find(plan => plan.interval === 'month')

    const today = new Date()
    const twoMonthsLater = addMonths(today, 2)

    const isFreePlan = !user || ['FREE', null].includes(user.subscription)

    const originAirportOptions = originAirportsQuery.data.map(airport => {
        return { value: airport.code, label: `${airport.name} (${airport.code})` }
    })

    useEffect(() => {
        if (originAirportOptions.length > 0 && !from) {
            onChange({ from: originAirportOptions[0] })
        }
    }, [originAirportOptions])

    const destinationAirportOptions = destinationAirportsQuery.data.map(airport => {
        return { value: airport.code, label: `${airport.name} (${airport.code})` }
    })

    const allowedDates = flightDatesQuery.data
        .map(({date}) => {
            return new Date(date)
        })

    if (allowedDates.sort().at(-1) < twoMonthsLater && isFreePlan) {
        allowedDates.push(addMonths(today, 3))
    }

    const renderDayContents = (day, date) => {
        const dayWithAvailability = flightDatesQuery.data
            .find(allowedDate => isSameDay(date, new Date(allowedDate.date)) && 
                  (isToday(date) || isFuture(date)))

        return (
            <Flex className={dayWithAvailability ? "color-wheel" : ""} 
                height="45px" position="relative" align="center" justify="center"
                background={dayWithAvailability ? buildGradientString(dayWithAvailability?.availabilities) : 'none'}
            >
                <Text position="absolute" zIndex={1}>{day}</Text>
            </Flex>
        )
    };

    const renderCustomHeader = ({
        date,
        decreaseMonth,
        increaseMonth,
        prevMonthButtonDisabled,
        nextMonthButtonDisabled,
      }) => (
        <Flex justify="center">
          {!prevMonthButtonDisabled && <button className="react-datepicker__navigation react-datepicker__navigation--previous" 
            onClick={decreaseMonth}>
                <span className="react-datepicker__navigation-icon react-datepicker__navigation-icon--previous">
                    {t('filterPanel.previousMonth')}
                </span>
          </button>}

          <div className="react-datepicker__current-month">{format(date, 'MMMM yyyy')}</div>

          <Popover isOpen={isOpen} onClose={onClose} closeOnBlur={false}>
            <PopoverTrigger>
                <button className="react-datepicker__navigation react-datepicker__navigation--next" 
                onClick={()=>{
                    if (nextMonthButtonDisabled) {
                        if (isFreePlan) {
                            onOpen()
                        }
                        return
                    }
                    increaseMonth()
                }}>
                    <span className="react-datepicker__navigation-icon react-datepicker__navigation-icon--next">
                    {t('filterPanel.nextMonth')}
                    </span>
                </button>
            </PopoverTrigger>
            <PopoverContent py={5}>
                <PopoverCloseButton />
                <PopoverBody>
                    <Heading as="h3" fontSize={"md"} mb={3} fontWeight={"bold"}>
                        {t('filterPanel.60daysAlert.header')}
                    </Heading>
                    <Text fontWeight={"semibold"}>
                        {t('filterPanel.60daysAlert.text')}
                    </Text>
                    <Divider my={2}/>
                    <Text fontWeight={"semibold"}>{t('filterPanel.60daysAlert.text2')}</Text>
                    <Flex alignItems={"baseline"} justifyContent={"center"} gap={2} mb={2}>
                        <Text fontSize={"xs"}>{t('filterPanel.60daysAlert.textBeforePrice')}</Text>
                        <Text fontSize={"2xl"} fontWeight={"bold"}>${monthPlan?.amount}</Text>
                        <Text fontSize={"xs"}>{t('filterPanel.60daysAlert.textAfterPrice')}</Text>
                    </Flex>
                    <Button as={RouterLink} to="/register" w={'100%'} backgroundColor="#D00" color={"white"}>
                        {t('login.signUp')}
                    </Button>
                </PopoverBody>
            </PopoverContent>
          </Popover>
        </Flex>
    )

    return (
        <Stack justifyContent={"space-between"} direction={{base: 'column', lg: 'row'}} gap={3}>
            <Stack gap={3} direction={{base: 'column', lg: 'row'}}>
                <Box w={{xl: 250}}>
                    <Select
                        placeholder="Where from?"
                        labelLeftComponent={<Image mr={1} src={circleImage}/>}
                        onChange={(value) => onChange({from: value})}
                        value={from}
                        options={originAirportOptions}
                    />
                </Box>

                <Box w={{xl: 250}}>
                    <Select
                        isDisabled={!from}
                        placeholder="Where to?"
                        labelLeftComponent={<Image mr={1} src={locationPinImage}/>}
                        onChange={(value) => onChange({to: value})}
                        value={to}
                        options={destinationAirportOptions}
                    />
                </Box>
            </Stack>

            <Flex gap={3}>
                <Flex justify="center" align="center" w={200} flex={1}>
                    <DatePicker
                        disabled={!to}
                        selected={date} 
                        onChange={(date) => {
                            onChange({ date })
                        }}
                        customInput={<DatePickerInput/>}
                        dateFormat="EEE, dd MMMM"
                        includeDates={allowedDates}
                        minDate={today}
                        maxDate={isFreePlan ? twoMonthsLater : null}
                        renderDayContents={renderDayContents}
                        renderCustomHeader={renderCustomHeader}
                        calendarContainer={CustomCalendarContainer}
                    />
                </Flex>
            </Flex>

        </Stack>
    )
}

export default FilterPanel