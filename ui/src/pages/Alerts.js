import {
  Stack,
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Th,
  Tr,
  Td,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverCloseButton,
  PopoverBody,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  useDisclosure,
  Flex,
  Text,
} from "@chakra-ui/react"
import { DeleteIcon, EditIcon } from "@chakra-ui/icons"
import { useTranslation } from "react-i18next"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import parse from "date-fns/parse"
import format from "date-fns/format"

import Menu from "../components/Menu"
import { getAlerts, deleteAlert } from "../services/api"
import AlertRouteContent from "../components/FlightsTable/AlertRouteContent"
import { trackPage } from "../services/analytics"
import { programNameToCodeMapping } from "../constants"

const DATE_FORMAT = "MMMM dd, yyyy"
const DEFAULT_DATE_FORMAT = "yyyy-MM-dd"

const parseDate = (dateStr) => {
  const parsedDate = parse(dateStr, DEFAULT_DATE_FORMAT, new Date())
  return format(parsedDate, DATE_FORMAT)
}

const flightClassesMapping = {
  Economy: "economy",
  PremiumEconomy: "premiumEconomy",
  Business: "business",
  First: "first",
}

const pointsPrograms = {
  "Qantas FF": "Qantas FF",
  "Virgin Velocity": "Virgin Velocity",
}

const Alerts = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const queryClient = useQueryClient()
  const { data: alerts } = useQuery({
    queryKey: ["alerts"],
    queryFn: getAlerts,
    initialData: [],
  })

  const { mutateAsync: deleteAlertMutation } = useMutation({
    mutationFn: deleteAlert,
    onSuccess: () => queryClient.invalidateQueries(["alerts"]),
  })
  const { t } = useTranslation()

  const onAlertDelete = async (userAlert) => {
    await deleteAlertMutation(userAlert.id)
    onClose()
  }

  const convertProgramNamesToCodes = (preferred_programs) => {
    return preferred_programs.map(
      (programName) => programNameToCodeMapping[programName] || programName
    )
  }

  return (
    <Stack
      direction={{ base: "column", lg: "row" }}
      minHeight="100vh"
      spacing={0}
    >
      <Menu />
      <Box bg="#F7F7F9" px={[0, 7]} py="7" marginInlineStart={0} flexGrow={1}>
        <Heading
          as="h1"
          pb={6}
          color="#141725"
          textAlign="left"
          fontSize={{ base: "xl", lg: "2xl" }}
        >
          {t("alerts.header")}
        </Heading>
        <Box bg="white" borderRadius={[0, 12]} mb={7}>
          {alerts.length > 0 ? (
            <Table
              width={"100%"}
              sx={{ tableLayout: "fixed" }}
              fontSize={"sm"}
              textAlign={"left"}
            >
              <Thead>
                <Tr boxShadow="0px 2px 8px rgba(20, 23, 37, 0.08)">
                  <Th textTransform="none" p={4} w={"22%"}>
                    {t("alerts.itinerary")}
                  </Th>
                  <Th textTransform="none" p={4} w={"22%"}>
                    {t("alerts.dateRange")}
                  </Th>
                  <Th textTransform="none" p={4} w={"22%"}>
                    {t("alerts.class")}
                  </Th>
                  <Th textTransform="none" p={4} w={"22%"}>
                    {t("alerts.program")}
                  </Th>
                  <Th textTransform="none" p={2}></Th>
                  <Th textTransform="none" p={2}></Th>
                </Tr>
              </Thead>
              <Tbody>
                {alerts.map((userAlert) => {
                  const flightClasses = userAlert.flight_classes.map(
                    (flightClass) =>
                      t(`table.${flightClassesMapping[flightClass]}`)
                  )
                  const programs = userAlert.preferred_programs.map(
                    (program) => pointsPrograms[program]
                  )

                  const route = {
                    id: userAlert.id,
                    origin: userAlert.origin,
                    destination: userAlert.destination,
                    startDate: userAlert.start_date,
                    endDate: userAlert.end_date,
                    flightClasses: userAlert.flight_classes,
                    preferredPrograms: userAlert.preferred_programs,
                    source: convertProgramNamesToCodes(
                      userAlert.preferred_programs
                    ),
                  }

                  return (
                    <Tr key={userAlert.id}>
                      <Td p={4} textAlign={"left"}>
                        {userAlert.origin.name} - {userAlert.destination.name}
                      </Td>
                      <Td p={4}>
                        {parseDate(userAlert.start_date)} -{" "}
                        {parseDate(userAlert.end_date)}
                      </Td>
                      <Td p={4}>{flightClasses.join(", ")}</Td>
                      <Td p={4}>{programs.join(", ")}</Td>
                      <Td p={2}>
                        <DeleteIcon
                          cursor="pointer"
                          boxSize={5}
                          color="#6a6e85"
                          onClick={onOpen}
                        />
                        <Modal isOpen={isOpen} onClose={onClose} isCentered>
                          <ModalOverlay />
                          <ModalContent>
                            <ModalHeader fontSize={"2xl"} fontWeight="bold">
                              {t("alerts.deleteHeader")}
                            </ModalHeader>
                            <ModalCloseButton />
                            <ModalBody>{t("alerts.deleteContent")}</ModalBody>

                            <ModalFooter>
                              <Flex width="100%" gap={5}>
                                <Button
                                  flex={1}
                                  textTransform={"uppercase"}
                                  backgroundColor="#F7F7F9"
                                  color="#DD0000"
                                  onClick={onClose}
                                >
                                  {t("alerts.deleteCancel")}
                                </Button>
                                <Button
                                  flex={1}
                                  textTransform={"uppercase"}
                                  backgroundColor="#DD0000"
                                  color="white"
                                  onClick={() => onAlertDelete(userAlert)}
                                >
                                  {t("alerts.deleteAgree")}
                                </Button>
                              </Flex>
                            </ModalFooter>
                          </ModalContent>
                        </Modal>
                      </Td>
                      <Td p={2}>
                        <Popover
                          placement={"left"}
                          closeOnBlur={false}
                          onOpen={() => {
                            trackPage({
                              title: "Alert Route",
                            })
                          }}
                        >
                          {({ onClose }) => (
                            <>
                              <PopoverTrigger>
                                <EditIcon
                                  cursor="pointer"
                                  boxSize={5}
                                  color="#6a6e85"
                                />
                              </PopoverTrigger>
                              <PopoverContent
                                p={5}
                                _focus={{ boxShadow: "none" }}
                                boxShadow="0px 10px 22px rgba(0, 0, 0, 0.14);"
                                borderRadius={8}
                                w={360}
                              >
                                <PopoverCloseButton />
                                <PopoverBody p={0}>
                                  <AlertRouteContent
                                    route={route}
                                    onClose={onClose}
                                    isNew={false}
                                  />
                                </PopoverBody>
                              </PopoverContent>
                            </>
                          )}
                        </Popover>
                      </Td>
                    </Tr>
                  )
                })}
              </Tbody>
            </Table>
          ) : (
            <Text p={2}>{t("alerts.empty")}</Text>
          )}
        </Box>
      </Box>
    </Stack>
  )
}

export default Alerts
