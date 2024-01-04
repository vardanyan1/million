import { useState, useEffect } from "react"

import "../App.css"

import { Box, Heading, Text, Stack, Image, Flex, Link } from "@chakra-ui/react"
import { useTranslation } from "react-i18next"
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import { Outlet, Link as RouterLink, useNavigate } from "react-router-dom"

import Menu from "../components/Menu"
import FilterPanel from "../components/Flights/FilterPanel"
import Loading from "../components/Loading"
import instagramImage from "../img/instagram.svg"
import facebookImage from "../img/facebook.svg"
import { getFlights } from "../services/api"
import { useAuthContext } from "../services/auth"
import { trackPage } from "../services/analytics"
import { ITEMS_PER_PAGE } from "../constants/constants"
import FlightDataContext from "../components/Flights/FlightDataContext"
import { Helmet } from "react-helmet"
import { getPagesToRender } from "../helpers/functions"

const AllAvailability = () => {
  const navigate = useNavigate()
  const { user } = useAuthContext()
  const { t } = useTranslation()
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState({
    from: "",
    to: "",
    date: new Date(),
  })

  const params = {
    page: currentPage,
    date: format(filters.date, "yyyy-MM-dd"),
    origin: filters.from?.value,
    destination: filters.to?.value,
  }

  const query = useQuery({
    queryKey: ["flights", params],
    queryFn: getFlights,
    keepPreviousData: true,
    initialData: { count: 0, results: [] },
    enabled: !!(params.origin && params.destination),
  })

  useEffect(() => {
    trackPage({ title: "All Rewards Availability" })
  }, [])

  if (query.isLoading && query.isInitialLoading) {
    return <Loading />
  }

  const pageCount = Math.ceil(query.data.count / ITEMS_PER_PAGE)
  const flights = query.data.results

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

  const handleFlightSelection = ({ from, to }) => {
    if (from && to) {
      navigate(`/flights/${from.value}-${to.value}`)
    }
  }

  const applyFilters = (newFilters) => {
    let updateFrom = newFilters.from || filters.from
    let updateTo = newFilters.to || filters.to

    if (
      newFilters.from !== filters.from ||
      newFilters.to !== filters.to ||
      newFilters.date !== filters.date
    ) {
      setCurrentPage(1)
      handleFlightSelection({ from: updateFrom, to: updateTo })
    }
    setFilters((existingFilters) => ({ ...existingFilters, ...newFilters }))
  }

  const paginationButtons = getPagesToRender(currentPage, pageCount)

  return (
    <>
      <Helmet>
        <title>Reward Flight Search</title>
        <meta
          name="description"
          content="Easy reward flight discovery using Qantas and Velocity points"
        />
        <meta
          name="keywords"
          content="reward travel, award travel, classic flight rewards, qantas reward flights, velocity frequent flier, flight redemption"
        />
      </Helmet>
      <FlightDataContext.Provider value={{ flights, user }}>
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
                {t("allRewardMenuItem")}
              </Heading>
              <Text
                align="left"
                color="#141725"
                pb="6"
                fontSize={{ base: "small", lg: "sm" }}
              >
                {t("allRewardDescription")}
              </Text>
            </Box>

            <Box bg="white" borderRadius={[0, 12]} mb={7}>
              <Box px={4} pt={4} pb={4}>
                <FilterPanel onChange={applyFilters} {...filters} user={user} />
              </Box>

              <Outlet />

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

            {/* Footer */}
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
      </FlightDataContext.Provider>
    </>
  )
}

export default AllAvailability
