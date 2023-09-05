import { useState, useEffect } from "react"

import "../App.css"

import { Box, Heading, Text, Stack, Image, Flex, Link } from "@chakra-ui/react"
import { useTranslation } from "react-i18next"
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons"
import range from "lodash/range"
import { useQuery } from "@tanstack/react-query"
import { format } from "date-fns"
import { Link as RouterLink } from "react-router-dom"

import Menu from "../components/Menu"
import FilterPanel from "../components/FilterPanel"
import FlightsTable from "../components/FlightsTable/FlightsTable"
import Loading from "../components/Loading"
import instagramImage from "../img/instagram.svg"
import facebookImage from "../img/facebook.svg"
import { getFlights } from "../services/api"
import { useAuthContext } from "../services/auth"
import { trackPage } from "../services/analytics"
import { ITEMS_PER_PAGE } from "../constants"

// const breakpoints = {
//   base: "0em", //0??
//   sm: "30em", // 480px
//   md: "48em", // 768px
//   lg: "62em", // 992px
//   xl: "80em", // 1280px
//   "2xl": "96em", // 1536px
// }

const getPagesToRender = (currentPage, pageCount) => {
  if (pageCount <= 6) {
    return range(1, pageCount + 1)
  }
  switch (currentPage) {
    case 1:
    case 2:
      return [1, 2, 3, "...", pageCount]
    case 3:
      return [1, 2, 3, 4, "...", pageCount]
    case 4:
      return [1, 2, 3, 4, 5, "...", pageCount]
    case pageCount - 4:
      return [
        1,
        "...",
        currentPage - 1,
        currentPage,
        currentPage + 1,
        "...",
        pageCount,
      ]
    case pageCount - 3:
      return [
        1,
        "...",
        currentPage - 1,
        currentPage,
        currentPage + 1,
        "...",
        pageCount,
      ]
    case pageCount - 2:
      return [
        1,
        "...",
        currentPage - 1,
        currentPage,
        currentPage + 1,
        pageCount,
      ]
    case pageCount - 1:
      return [1, "...", currentPage - 1, currentPage, pageCount]
    case pageCount:
      return [1, "...", currentPage - 1, currentPage]
    default:
      return [
        1,
        "...",
        currentPage - 1,
        currentPage,
        currentPage + 1,
        "...",
        pageCount,
      ]
  }
}

const AllAvailability = () => {
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

  const applyFilters = (newFilters) => {
    if (
      newFilters.from !== filters.from ||
      newFilters.to !== filters.to ||
      newFilters.date !== filters.date
    ) {
      setCurrentPage(1)
    }
    setFilters((existingFilters) => ({ ...existingFilters, ...newFilters }))
  }

  const paginationButtons = getPagesToRender(currentPage, pageCount)

  return (
    <Stack
      direction={{ base: "column", lg: "row" }}
      minHeight="100vh"
      spacing={0}
    >
      <Menu />
      <Box bg="#F7F7F9" px={[0, 7]} py="7" marginInlineStart={0} flexGrow={1}>
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

          <FlightsTable flights={flights} user={user} />

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
                  backgroundColor={label === currentPage ? "#FF0000" : "none"}
                  color={label === currentPage ? "white" : "#70767D"}
                  cursor={
                    [currentPage, "..."].includes(label) ? "default" : "pointer"
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

        <Box px={[4, 0]}>
          <Text fontSize={{ base: "10px", lg: "small" }} mb={3} color="#6A6E85">
            {t("allRewardFooterLine1")}
          </Text>
          <Text fontSize={{ base: "10px", lg: "small" }} mb={3} color="#6A6E85">
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
            <RouterLink to="/privacy-policy">{t("privacyPolicy")}</RouterLink>
            <RouterLink to="/terms-and-conditions">
              {t("termsAndConditions")}
            </RouterLink>
            <Text>{t("allRewardFooterSummary")}</Text>
          </Flex>
        </Box>
      </Box>
    </Stack>
  )
}

export default AllAvailability
