import { useState } from "react"
import { Link as RouterLink, useNavigate } from "react-router-dom"
import { useQuery, useMutation } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { CheckIcon } from "@chakra-ui/icons"
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
import { getPricingPlans, createCheckoutSession } from "../services/api"
import Menu from "../components/Menu"
import Footer from "../components/Footer"
import { useAuthContext } from "../services/auth"
import { PRICE_INTERVAL } from "../constants"
import SubscriptionPopup from "../components/SubscriptionPopup"

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

  const [isCancelPopupOpen, setIsCancelPopupOpen] = useState(false)
  const [isSwitchPopupOpen, setIsSwitchPopupOpen] = useState(false)

  const monthPlan = pricingPlans.find((plan) => plan.interval === "month")
  const annualPlan = pricingPlans.find((plan) => plan.interval === "year")

  const handleCancelClick = () => {
    setIsCancelPopupOpen(true)
  }

  const handleCloseCancel = () => {
    setIsCancelPopupOpen(false)
  }

  const handleConfirmCancel = () => {
    setUserPlan("FREE")
    setIsCancelPopupOpen(false)
  }

  const handleSwitchClick = () => {
    setIsSwitchPopupOpen(true)
  }

  const handleSwitchCancel = () => {
    setIsSwitchPopupOpen(false)
  }

  const handleConfirmSwitch = (plan) => {
    setUserPlan(plan === "MONTHLY" ? "ANNUAL" : "MONTHLY")
    setIsSwitchPopupOpen(false)
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
              {(userPlan === "FREE" || userPlan === null) && (
                <Button
                  w={"100%"}
                  mt="auto"
                  backgroundColor="#D00"
                  textTransform={"uppercase"}
                  onClick={async () => {
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
                  }}
                  color="white"
                >
                  {t("login.signUp")}
                </Button>
              )}

              {userPlan === "MONTHLY" && (
                <Button
                  w={"100%"}
                  mt="auto"
                  backgroundColor="#D00"
                  textTransform={"uppercase"}
                  onClick={handleCancelClick}
                  color="white"
                >
                  {t("login.cancel")}
                </Button>
              )}

              {userPlan === "ANNUAL" && (
                <Button
                  w={"100%"}
                  mt="auto"
                  backgroundColor="#D00"
                  textTransform={"uppercase"}
                  onClick={handleSwitchClick}
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
              {(userPlan === "FREE" || userPlan === null) && (
                <Button
                  w={"100%"}
                  mt="auto"
                  backgroundColor="#D00"
                  textTransform={"uppercase"}
                  onClick={async () => {
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
                  }}
                  color="white"
                >
                  {t("login.signUp")}
                </Button>
              )}

              {userPlan === "ANNUAL" && (
                <Button
                  w={"100%"}
                  mt="auto"
                  backgroundColor="#D00"
                  textTransform={"uppercase"}
                  onClick={handleCancelClick}
                  color="white"
                >
                  {t("login.cancel")}
                </Button>
              )}

              {userPlan === "MONTHLY" && (
                <Button
                  w={"100%"}
                  mt="auto"
                  backgroundColor="#D00"
                  textTransform={"uppercase"}
                  onClick={handleSwitchClick}
                  color="white"
                >
                  {t("login.switch")}
                </Button>
              )}
            </Flex>
          </Flex>
        </Stack>

        <SubscriptionPopup
          isOpen={isCancelPopupOpen}
          onClose={handleCloseCancel}
          onConfirm={handleConfirmCancel}
          header="Cancel Subscription"
          body="Are you sure you want to cancel your subscription?"
          type="cancel"
        />
        <SubscriptionPopup
          isOpen={isSwitchPopupOpen}
          onClose={handleSwitchCancel}
          onConfirm={handleConfirmSwitch}
          header="Switch Subscription"
          body="The current plan remains in place until the next billing cycle, at which point the account will be switched over."
          type="switch"
          plan={userPlan}
        />
        <Footer />
      </Box>
    </Stack>
  )
}

export default Pricing
