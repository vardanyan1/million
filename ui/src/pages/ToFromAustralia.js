import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { useQuery } from "@tanstack/react-query"
import { Link as RouterLink, useNavigate } from "react-router-dom"
import { Helmet } from "react-helmet"
import { Box, Heading, Text, Stack, Image, Flex, Link } from "@chakra-ui/react"
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons"
import Menu from "../components/Menu"
import Loading from "../components/Loading"
import { Select } from "../components/Select"
import AustralianFlightDataContext from "../components/AustralianFlights/FlightDataContext"
import { trackPage } from "../services/analytics"
import { getAustralianFlights } from "../services/api"
import facebookImage from "../img/facebook.svg"
import { getPagesToRender } from "../helpers/functions"
import instagramImage from "../img/instagram.svg"
import { ITEMS_PER_PAGE_AUSTRALIA } from "../constants"
import "../App.css"
import AustralianFlightDetail from "../components/AustralianFlights/FlightDetail"

let selectOptions = [
  {
    label: "Leaving Australia",
    value: 1,
  },
  {
    label: "Back to Australia",
    value: 2,
  },
]

const ToFromAustralia = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [currentPage, setCurrentPage] = useState(1)
  const [isFromAustralia, setIsFromAustralia] = useState("leaving_australia")

  const params = {
    page: currentPage,
    [isFromAustralia]: true,
    page_size: 15,
  }

  const query = useQuery({
    queryKey: ["australianFlights", params],
    queryFn: getAustralianFlights,
    keepPreviousData: true,
    initialData: { count: 0, results: [] },
    enabled: true,
  })

  useEffect(() => {
    trackPage({ title: "To From Australian Flights" })
  }, [])

  if (query.isLoading && query.isInitialLoading) {
    return <Loading />
  }

  const pageCount = Math.ceil(query.data.count / ITEMS_PER_PAGE_AUSTRALIA)
  const flights = query.data.results || []

  const goToPrevPage = () => {
    if (currentPage > 1 && pageCount !== 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const goToNextPage = () => {
    if (currentPage < pageCount && pageCount !== 1) {
      setCurrentPage(currentPage + 1)
    }
  }

  const setPage = (page) => {
    if (page !== "...") {
      setCurrentPage(page)
    }
  }

  const handleSelectChange = ({ value }) => {
    setCurrentPage(1)

    const toFrom = value === 1 ? "from" : "to"

    setIsFromAustralia(value === 1 ? "leaving_australia" : "back_to_australia")

    if (value) {
      navigate(`/australian-flights/${toFrom}-australia`)
    }
  }

  const paginationButtons = getPagesToRender(currentPage, pageCount)

  return (
    <>
      <Helmet>
        <title>Business & First Class reward flights to/from Australia</title>
        <meta
          name="description"
          content="Business & First Class reward flights to/from Australia"
        />
        <meta
          name="keywords"
          content="reward travel, award travel, classic flight rewards, qantas reward flights, velocity frequent flier, flight redemption"
        />
      </Helmet>

      <AustralianFlightDataContext.Provider value={{ flights }}>
        <Stack
          direction={{ base: "column", lg: "row" }}
          minHeight="100vh"
          spacing={0}
        >
          <Menu />
          <Box
            bg="#F7F7F9"
            px={[0, 7]}
            py="7"
            marginInlineStart={0}
            flexGrow={1}
          >
            <Box px={[4, 0]}>
              <Heading
                as="h1"
                align="left"
                pb="2"
                color="#141725"
                fontSize={{ base: "xl", lg: "2xl" }}
              >
                {t("allAustralianFLightsMenuItem")}
              </Heading>
              <Text
                align="left"
                color="#141725"
                pb="6"
                fontSize={{ base: "small", lg: "sm" }}
                sx={{ maxWidth: "590px" }}
              >
                {t("allAustralianFlightsDescription")}
              </Text>
            </Box>

            <Box bg="white" borderRadius={[0, 12]} mb={7}>
              <Flex gap={5}>
                <Box px={4} pt={4} pb={4} w={{ lg: 250 }}>
                  <Select
                    placeholder="Leaving Australia"
                    onChange={handleSelectChange}
                    value={
                      isFromAustralia === null
                        ? ""
                        : isFromAustralia
                        ? selectOptions[0]
                        : selectOptions[1]
                    }
                    options={selectOptions}
                  />
                </Box>

                <Flex
                  direction={"column"}
                  alignItems={"flex-start"}
                  justifyContent={"center"}
                  fontWeight={600}
                  lineHeight={1.2}
                  textAlign={"left"}
                >
                  <Text
                    fontSize={{ base: "small", lg: "xs" }}
                    fontStyle={"italic"}
                    color={"grey"}
                  >
                    {t("australianFlightsInfo")}
                  </Text>
                  <Text
                    fontSize={{ base: "small", lg: "xs" }}
                    fontStyle={"italic"}
                    color={"grey"}
                  >
                    {t("leavingAustralia")}
                  </Text>
                  <Text
                    fontSize={{ base: "small", lg: "xs" }}
                    fontStyle={"italic"}
                    color={"grey"}
                  >
                    {t("backToAustralia")}
                  </Text>
                </Flex>
              </Flex>

              <AustralianFlightDetail />

              {/* Pagination */}
              <Flex py={5} justify={"center"} gap={2} userSelect={"none"}>
                <Text
                  onClick={goToPrevPage}
                  cursor={currentPage === 1 ? "default" : "pointer"}
                >
                  <ChevronLeftIcon color="#70767D" boxSize={6} />
                </Text>

                {paginationButtons.map((label, index) => {
                  return (
                    <Text
                      key={`${label}${index}`}
                      onClick={() => setPage(label)}
                      backgroundColor={
                        label === currentPage ? "#FF0000" : "none"
                      }
                      color={label === currentPage ? "white" : "#70767D"}
                      cursor={
                        [currentPage, "..."].includes(label)
                          ? "default"
                          : "pointer"
                      }
                      px={2}
                      py={"1px"}
                      borderRadius={7}
                    >
                      {label}
                    </Text>
                  )
                })}
                <Text
                  onClick={goToNextPage}
                  cursor={currentPage === pageCount ? "default" : "pointer"}
                >
                  <ChevronRightIcon color="#70767D" boxSize={6} />
                </Text>
              </Flex>
            </Box>

            {/* footer */}
            <Box px={[4, 0]}>
              <Text
                fontSize={{ base: "10px", lg: "small" }}
                mb={3}
                color="#6A6E85"
              >
                {t("allRewardFooterLine1")}
              </Text>
              <Text
                fontSize={{ base: "10px", lg: "small" }}
                mb={3}
                color="#6A6E85"
              >
                {t("allRewardFooterLine2")}
              </Text>
              <Text fontSize={{ base: "10px", lg: "small" }} color="#6A6E85">
                {t("allRewardFooterLine3")}
              </Text>
              <Flex py={5} justify="center">
                <Link target="_blank" href={t("links.instagramLink")}>
                  <Image src={instagramImage} mr={6} />
                </Link>
                <Link target="_blank" href={t("links.facebookLink")}>
                  <Image src={facebookImage} />
                </Link>
              </Flex>
              <Flex
                mb={3}
                color="#6A6E85"
                fontSize={{ base: "10px", lg: "small" }}
                gap={3}
                justify="center"
              >
                <RouterLink to="/privacy-policy">
                  {t("privacyPolicy")}
                </RouterLink>
                <RouterLink to="/terms-and-conditions">
                  {t("termsAndConditions")}
                </RouterLink>
                <Text>{t("allRewardFooterSummary")}</Text>
              </Flex>
            </Box>
          </Box>
        </Stack>
      </AustralianFlightDataContext.Provider>
    </>
  )
}

export default ToFromAustralia
