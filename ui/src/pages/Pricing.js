import {
  Stack,
  Box,
  Heading,
  Text,
  Button,
  Flex,
  Divider,
  List,
  ListItem,
  ListIcon,
  Badge,
} from "@chakra-ui/react"
import { CheckIcon } from "@chakra-ui/icons"
import { useTranslation } from "react-i18next"
import { Link as RouterLink } from "react-router-dom"
import { useQuery, useMutation } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"

import Menu from "../components/Menu"
import Footer from "../components/Footer"
import { getPricingPlans, createCheckoutSession } from "../services/api"
import { useAuthContext } from "../services/auth"
import { PRICE_INTERVAL } from "../constants"
import { useState } from "react"

export const Pricing = () => {
  const [userPlan, setUserPlan] = useState("ANNUAL")
  let { user } = useAuthContext()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: pricingPlans } = useQuery({
    queryKey: ["pricingPlans"],
    queryFn: getPricingPlans,
    initialData: [],
  })
  const { mutateAsync: checkoutSessionMutation } = useMutation({
    mutationFn: createCheckoutSession,
  })

  const monthPlan = pricingPlans.find((plan) => plan.interval === "month")
  const annualPlan = pricingPlans.find((plan) => plan.interval === "year")

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
          {user ? t("pricing.user") : t("pricing.anonymousHeader")}
        </Heading>

        <Stack direction={{ base: "column", lg: "row" }} gap={4} mb={7}>
          <Flex
            border={user?.subscription === "FREE" ? "1px solid #d00" : "none"}
            direction="column"
            borderRadius={12}
            p={6}
            flexBasis={0}
            flexGrow={1}
            backgroundColor="white"
            position={"relative"}
          >
            {user?.subscription === "FREE" && (
              <Badge
                colorScheme="red"
                width="100px"
                position="absolute"
                top={"8px"}
                left={"8px"}
              >
                {t("pricing.activePlan")}
              </Badge>
            )}
            <Text
              fontSize="sm"
              textTransform={"uppercase"}
              fontWeight="bold"
              color="#D00"
            >
              {t("pricing.free.header")}
            </Text>
            <Text fontSize={"3xl"}>$0.00</Text>
            <Divider color="rgba(33, 51, 63, 0.15)" my={5} />
            <List
              fontWeight={"semibold"}
              fontSize={"sm"}
              textAlign={"left"}
              mb={8}
            >
              <ListItem display={"flex"}>
                <ListIcon as={CheckIcon} color="#D00" mt={1} />
                {t("pricing.free.point1")}
              </ListItem>
              <ListItem display={"flex"}>
                <ListIcon as={CheckIcon} color="#D00" mt={1} />
                {t("pricing.free.point2")}
              </ListItem>
            </List>
            <Button
              as={RouterLink}
              to="/"
              w={"100%"}
              mt="auto"
              backgroundColor="#D00"
              textTransform={"uppercase"}
              color="white"
            >
              {t("pricing.free.button")}
            </Button>
          </Flex>
          <Flex
            border={
              user?.subscription === "MONTHLY" ? "1px solid #d00" : "none"
            }
            direction="column"
            borderRadius={12}
            p={6}
            flexBasis={0}
            flexGrow={1}
            backgroundColor="white"
            position={"relative"}
          >
            {user?.subscription === "MONTHLY" && (
              <Badge
                colorScheme="red"
                width="100px"
                position="absolute"
                top={"8px"}
                left={"8px"}
              >
                {t("pricing.activePlan")}
              </Badge>
            )}
            <Text
              fontSize={"sm"}
              textTransform={"uppercase"}
              fontWeight="bold"
              color="#D00"
            >
              {t("pricing.monthly.header")}
            </Text>
            <Text fontSize={"3xl"}>${monthPlan?.amount}</Text>
            <Divider color="rgba(33, 51, 63, 0.15)" my={5} />
            <List
              fontWeight={"semibold"}
              fontSize={"sm"}
              textAlign={"left"}
              mb={8}
            >
              <ListItem display={"flex"}>
                <ListIcon as={CheckIcon} color="#D00" mt={1} />
                {t("pricing.monthly.point1")}
              </ListItem>
              <ListItem display={"flex"}>
                <ListIcon as={CheckIcon} color="#D00" mt={1} />
                {t("pricing.monthly.point2")}
              </ListItem>
              <ListItem display={"flex"}>
                <ListIcon as={CheckIcon} color="#D00" mt={1} />
                {t("pricing.monthly.point3")}
              </ListItem>
            </List>
            <Flex gap={2}>
              <Button
                w={"100%"}
                mt="auto"
                backgroundColor="#D00"
                textTransform={"uppercase"}
                onClick={async () => {
                  if (userPlan === "MONTHLY") {
                    setUserPlan("FREE")
                  } else {
                    if (
                      user?.subscription === "FREE" ||
                      user?.subscription === null
                    ) {
                      const response = await checkoutSessionMutation({
                        interval: PRICE_INTERVAL.MONTHLY,
                      })
                      window.location.href = response.session_url
                    } else {
                      navigate(`/register?interval=${PRICE_INTERVAL.MONTHLY}`)
                    }
                  }
                }}
                color="white"
              >
                {/* replace with this when login will ready user?.subscription === "ANNUAL" ? t("login.unsubscribe") : t("login.signUp") */}
                {userPlan === "MONTHLY"
                  ? t("login.unsubscribe")
                  : t("login.signUp")}
              </Button>
              {userPlan === "ANNUAL" && (
                <Button
                  w={"100%"}
                  mt="auto"
                  backgroundColor="#D00"
                  textTransform={"uppercase"}
                  onClick={async () => {
                    setUserPlan("MONTHLY")
                  }}
                  color="white"
                >
                  {t("login.switch")}
                </Button>
              )}
            </Flex>
          </Flex>
          <Flex
            border={user?.subscription === "ANNUAL" ? "1px solid #d00" : "none"}
            direction="column"
            borderRadius={12}
            p={6}
            flexBasis={0}
            flexGrow={1}
            backgroundColor="white"
            position={"relative"}
          >
            {user?.subscription === "ANNUAL" && (
              <Badge
                colorScheme="red"
                width="100px"
                position="absolute"
                top={"8px"}
                left={"8px"}
              >
                {t("pricing.activePlan")}
              </Badge>
            )}
            <Text
              fontSize={"sm"}
              textTransform={"uppercase"}
              fontWeight="bold"
              color="#D00"
            >
              {t("pricing.annual.header")}
            </Text>
            <Text fontSize={"3xl"}>${annualPlan?.amount}</Text>
            <Divider color="rgba(33, 51, 63, 0.15)" my={5} />
            <List
              fontWeight={"semibold"}
              fontSize={"sm"}
              textAlign={"left"}
              mb={8}
            >
              <ListItem display={"flex"}>
                <ListIcon as={CheckIcon} color="#D00" mt={1} />
                {t("pricing.annual.point1")}
              </ListItem>
              <ListItem display={"flex"}>
                <ListIcon as={CheckIcon} color="#D00" mt={1} />
                {t("pricing.annual.point2")}
              </ListItem>
              <ListItem display={"flex"}>
                <ListIcon as={CheckIcon} color="#D00" mt={1} />
                {t("pricing.annual.point3")}
              </ListItem>
            </List>
            <Flex gap={2}>
              <Button
                w={"100%"}
                mt="auto"
                backgroundColor="#D00"
                textTransform={"uppercase"}
                onClick={async () => {
                  if (userPlan === "ANNUAL") {
                    setUserPlan("FREE")
                  } else {
                    if (
                      user?.subscription === "FREE" ||
                      user?.subscription === null
                    ) {
                      const response = await checkoutSessionMutation({
                        interval: PRICE_INTERVAL.YEARLY,
                      })
                      window.location.href = response.session_url
                    } else {
                      navigate(`/register?interval=${PRICE_INTERVAL.YEARLY}`)
                    }
                  }
                }}
                color="white"
              >
                {/* replace with this when login will ready user?.subscription === "ANNUAL" ? t("login.unsubscribe") : t("login.signUp") */}
                {userPlan === "ANNUAL"
                  ? t("login.unsubscribe")
                  : t("login.signUp")}
              </Button>

              {userPlan === "MONTHLY" && (
                <Button
                  w={"100%"}
                  mt="auto"
                  backgroundColor="#D00"
                  textTransform={"uppercase"}
                  onClick={async () => {
                    setUserPlan("ANNUAL")
                  }}
                  color="white"
                >
                  {t("login.switch")}
                </Button>
              )}
            </Flex>
          </Flex>
        </Stack>

        <Footer />
      </Box>
    </Stack>
  )
}

export default Pricing
