import { useState, forwardRef } from "react"
import { useTranslation } from "react-i18next"
import {
  Heading,
  Button,
  Text,
  Input,
  useToast,
  Stack,
  Box,
  Flex,
  FormControl,
  FormErrorMessage,
  Checkbox,
  Image,
} from "@chakra-ui/react"
import { useForm, Controller } from "react-hook-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { ChevronDownIcon, ArrowForwardIcon } from "@chakra-ui/icons"
import DatePicker, { CalendarContainer } from "react-datepicker"
import format from "date-fns/format"
import invert from "lodash/invert"

import bellImage from "../../img/bell.svg"
import { createAlert, updateAlert } from "../../services/api"

const DatePickerInput = forwardRef((props, ref) => {
  const { value, onClick } = props
  return (
    <Flex onClick={onClick} ref={ref} position="relative">
      <Input
        sx={{ caretColor: "transparent" }}
        inputMode="none"
        value={value}
        onChange={() => {}}
        minHeight={10}
        borderRadius={12}
        _focus={{ border: "1px solid black", boxShadow: "none" }}
        border="1px solid black"
        borderColor={"gray.200"}
        py={1}
        px={3}
      />
      <ChevronDownIcon
        boxSize={5}
        position="absolute"
        right="4"
        height="100%"
      />
    </Flex>
  )
})

const CustomCalendarContainer = ({ className, children }) => {
  return (
    <div
      style={{ background: "#fff" }}
      className="datepicker-wrapper alert-wrapper"
    >
      <CalendarContainer className={className}>{children}</CalendarContainer>
    </div>
  )
}

const flightClassesMapping = {
  ACEECO: "economy",
  ACEPRM: "premiumEconomy",
  ACEBUS: "business",
  ACEFIR: "first",
}

const labelFlightClassMapping = invert(flightClassesMapping)

const pointsPrograms = {
  QF: "qantasFF",
  VA: "virginVelocity",
}

const labelPointsPrograms = invert(pointsPrograms)

const AlertRouteContent = ({ route, onClose }) => {
  const [fromDate, setFromDate] = useState(route.fromDate)
  const [toDate, setToDate] = useState(route.toDate)
  const { handleSubmit, control, errors } = useForm({
    values: {
      economy: route.flightClasses.some(
        (flightClass) => flightClass === "ACEECO"
      ),
      premiumEconomy: route.flightClasses.some(
        (flightClass) => flightClass === "ACEPRM"
      ),
      business: route.flightClasses.some(
        (flightClass) => flightClass === "ACEBUS"
      ),
      first: route.flightClasses.some(
        (flightClass) => flightClass === "ACEFIR"
      ),
      qantasFF: route.preferredPrograms.some((program) => program === "QF"),
      virginVelocity: route.preferredPrograms.some(
        (program) => program === "VA"
      ),
    },
  })
  const queryClient = useQueryClient()
  const { mutateAsync: createAlertMutation } = useMutation({
    mutationFn: createAlert,
    onSuccess: () => queryClient.invalidateQueries(["alerts"]),
  })
  const { mutateAsync: updateAlertMutation } = useMutation({
    mutationFn: updateAlert,
    onSuccess: () => queryClient.invalidateQueries(["alerts"]),
  })
  const { t } = useTranslation()
  const toast = useToast()

  const onSubmit = async (data) => {
    const formattedData = {
      start_date: format(fromDate, "yyyy-MM-dd"),
      end_date: format(toDate, "yyyy-MM-dd"),
      origin: route.origin.id,
      destination: route.destination.id,
      flight_classes: Object.keys(labelFlightClassMapping)
        .filter((key) => data[key])
        .map((key) => labelFlightClassMapping[key]),
      preferred_programs: Object.keys(labelPointsPrograms)
        .filter((key) => data[key])
        .map((key) => labelPointsPrograms[key]),
    }
    try {
      if (route.id) {
        await updateAlertMutation({ id: route.id, ...formattedData })
      } else {
        await createAlertMutation(formattedData)
      }
      toast({
        position: "bottom-right",
        title: t("alertRouteModal.toastSuccess"),
        status: "success",
      })
      onClose()
    } catch (err) {
      toast({
        position: "bottom-right",
        title: t("alertRouteModal.toastError"),
        status: "error",
      })
    }
  }

  return (
    <>
      <Flex mb="4" alignItems={"center"}>
        <Image src={bellImage} mr={3} />
        <Heading
          as="h1"
          align="left"
          color="#141725"
          fontSize={"xl"}
          fontWeight="extrabold"
        >
          {t("alertRouteModal.header")}
        </Heading>
      </Flex>
      <Text mb={4} textTransform={"uppercase"} fontSize={"md"}>
        {route?.origin.name} <ArrowForwardIcon verticalAlign={-2} />{" "}
        {route?.destination.name}
      </Text>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack gap={3} direction="row" mb={4}>
          <Box>
            <Text mb={1} fontSize={"xs"}>
              From:
            </Text>
            <DatePicker
              selected={fromDate}
              onChange={(date) => {
                setFromDate(date)
              }}
              selectsStart
              startDate={fromDate}
              endDate={toDate}
              customInput={<DatePickerInput />}
              dateFormat="EEE, dd MMMM"
              minDate={new Date()}
              // renderDayContents={renderDayContents}
              calendarContainer={CustomCalendarContainer}
            />
          </Box>

          <Box>
            <Text mb={1} fontSize={"xs"}>
              To:
            </Text>
            <DatePicker
              selected={toDate}
              onChange={(date) => {
                setToDate(date)
              }}
              selectsEnd
              startDate={fromDate}
              endDate={toDate}
              customInput={<DatePickerInput />}
              dateFormat="EEE, dd MMMM"
              minDate={new Date()}
              // renderDayContents={renderDayContents}
              calendarContainer={CustomCalendarContainer}
            />
          </Box>
        </Stack>
        <Stack gap={3} direction="row" mb={9}>
          <Box w={"50%"}>
            <FormControl mb={3} isInvalid={!!errors?.economy}>
              <Controller
                control={control}
                name="economy"
                render={({ field: { onChange, value, ref } }) => {
                  return (
                    <Checkbox
                      onChange={onChange}
                      ref={ref}
                      isChecked={value}
                      colorScheme={"red"}
                    >
                      <Text fontSize="sm" fontWeight="semibold">
                        Economy
                      </Text>
                    </Checkbox>
                  )
                }}
              />
              <FormErrorMessage>{errors?.economy?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors?.business}>
              <Controller
                control={control}
                name="business"
                render={({ field: { onChange, value, ref } }) => {
                  return (
                    <Checkbox
                      onChange={onChange}
                      ref={ref}
                      isChecked={value}
                      colorScheme={"red"}
                    >
                      <Text fontSize="sm" fontWeight="semibold">
                        Business
                      </Text>
                    </Checkbox>
                  )
                }}
              />
              <FormErrorMessage>{errors?.business?.message}</FormErrorMessage>
            </FormControl>
          </Box>
          <Box w={"50%"}>
            <FormControl mb={3} isInvalid={!!errors?.premiumEconomy}>
              <Controller
                control={control}
                name="premiumEconomy"
                render={({ field: { onChange, value, ref } }) => {
                  return (
                    <Checkbox
                      onChange={onChange}
                      ref={ref}
                      isChecked={value}
                      colorScheme={"red"}
                    >
                      <Text fontSize="sm" fontWeight="semibold">
                        Premium Economy
                      </Text>
                    </Checkbox>
                  )
                }}
              />
              <FormErrorMessage>
                {errors?.premiumEconomy?.message}
              </FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors?.first}>
              <Controller
                control={control}
                name="first"
                render={({ field: { onChange, value, ref } }) => {
                  return (
                    <Checkbox
                      onChange={onChange}
                      ref={ref}
                      isChecked={value}
                      colorScheme={"red"}
                    >
                      <Text fontSize="sm" fontWeight="semibold">
                        First Class
                      </Text>
                    </Checkbox>
                  )
                }}
              />
              <FormErrorMessage>{errors?.first?.message}</FormErrorMessage>
            </FormControl>
          </Box>
        </Stack>
        <Text fontSize={"xs"} mb={3}>
          Preferred Program
        </Text>
        <FormControl mb={3} isInvalid={!!errors?.qantasFF}>
          <Controller
            control={control}
            name="qantasFF"
            render={({ field: { onChange, value, ref } }) => {
              return (
                <Checkbox
                  onChange={onChange}
                  ref={ref}
                  isChecked={value}
                  colorScheme={"red"}
                >
                  <Text fontSize="sm" fontWeight="semibold">
                    Qantas FF
                  </Text>
                </Checkbox>
              )
            }}
          />
          <FormErrorMessage>{errors?.qantasFF?.message}</FormErrorMessage>
        </FormControl>
        <FormControl mb={7} isInvalid={!!errors?.virginVelocity}>
          <Controller
            control={control}
            name="virginVelocity"
            render={({ field: { onChange, value, ref } }) => {
              return (
                <Checkbox
                  onChange={onChange}
                  ref={ref}
                  isChecked={value}
                  colorScheme={"red"}
                >
                  <Text fontSize="sm" fontWeight="semibold">
                    Virgin Velocity
                  </Text>
                </Checkbox>
              )
            }}
          />
          <FormErrorMessage>{errors?.virginVelocity?.message}</FormErrorMessage>
        </FormControl>
        <Text fontSize={"xs"} mb={5}>
          Availability for the selected rote is checked at least once a day.
          Alerts will be sent to the account email.
        </Text>

        <Button
          type="submit"
          w={"100%"}
          backgroundColor="#DD0000"
          color="white"
          borderRadius={8}
          boxShadow={"0px 4px 12px rgba(0, 0, 0, 0.24)"}
        >
          {t("alertRouteModal.button")}
        </Button>
      </form>
    </>
  )
}

export default AlertRouteContent