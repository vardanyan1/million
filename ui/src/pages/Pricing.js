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
import {
  getPricingPlans,
  createCheckoutSession,
  cancelSubscription,
  me,
} from "../services/api"
import Menu from "../components/Menu"
import Footer from "../components/Footer"
import SubscriptionPopup from "../components/SubscriptionPopup"
import { useAuthContext } from "../services/auth"
import { PRICE_INTERVAL, SUBSCRIPTION } from "../constants"

const { FREE, MONTHLY, ANNUAL } = SUBSCRIPTION
const { MONTH, YEAR } = PRICE_INTERVAL

export const Pricing = () => {
  const [plan, setPlan] = useState()
  const { user, setUser } = useAuthContext()
  const [isProcessing, setIsProcessing] = useState(false)
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

  const { mutateAsync: cancelSubscriptionMutation } = useMutation({
    mutationFn: cancelSubscription,
  })

  const [isCancelPopupOpen, setIsCancelPopupOpen] = useState(false)
  const [isSwitchPopupOpen, setIsSwitchPopupOpen] = useState(false)

  const monthPlan = pricingPlans.find((plan) => plan.interval === MONTH)
  const annualPlan = pricingPlans.find((plan) => plan.interval === YEAR)

  const handleCancelClick = () => {
    setIsCancelPopupOpen(true)
  }

  const handleCancelClose = () => {
    setIsCancelPopupOpen(false)
  }

  const handleCancelConfirm = async () => {
    if (user) {
      try {
        setIsProcessing(true)

        await cancelSubscriptionMutation({
          queryKey: ["cancelSubscription", user.id],
        })

        setTimeout(async () => {
          const updatedUser = await me()

          if (updatedUser) {
            setUser(updatedUser)
          }

          setIsCancelPopupOpen(false)
          setIsProcessing(false)

          navigate("/")
        }, 2000)
      } catch (error) {
        console.error("Error canceling subscription:", error)
        setIsProcessing(false)
      }
    }
  }

  const handleSubscribeClick = (plan) => {
    setPlan(plan)
    setIsSwitchPopupOpen(true)
  }

  const handleSwitchCancel = () => {
    setIsSwitchPopupOpen(false)
  }

  const handleSubscribeConfirm = async (plan) => {
    if (plan) {
      const response = await checkoutSessionMutation({
        interval: plan,
      })
      window.location.href = response.session_url
    }

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
            border={
              user?.subscription === FREE || user?.subscription === null
                ? "1px solid #d00"
                : "1px solid transparent"
            }
            direction="column"
            borderRadius={12}
            p={6}
            flexBasis={0}
            flexGrow={1}
            backgroundColor="white"
            position="relative"
            justifyContent="space-between"
          >
            <div>
              {user &&
                (user.cancel_at_period_end ||
                  user.subscription === FREE ||
                  user.subscription === null) && (
                  <Badge
                    colorScheme="red"
                    width="100px"
                    position="absolute"
                    top="8px"
                    left="8px"
                  >
                    {t("pricing.activePlan")}
                  </Badge>
                )}
              <Text
                fontSize="sm"
                textTransform="uppercase"
                fontWeight="bold"
                color="#D00"
              >
                {t("pricing.free.header")}
              </Text>
              <Text fontSize={"3xl"}>$0.00</Text>

              <Divider color="rgba(33, 51, 63, 0.15)" my={5} />

              <List fontWeight="semibold" fontSize="sm" textAlign="left" mb={8}>
                <ListItem display="flex">
                  <ListIcon as={CheckIcon} color="#D00" mt={1} />
                  {t("pricing.free.point1")}
                </ListItem>
                <ListItem display="flex">
                  <ListIcon as={CheckIcon} color="#D00" mt={1} />
                  {t("pricing.free.point2")}
                </ListItem>
              </List>
            </div>
            <Button
              as={RouterLink}
              to="/"
              w="100%"
              mt="auto"
              backgroundColor="#D00"
              textTransform="uppercase"
              color="white"
            >
              {t("pricing.free.button")}
            </Button>
          </Flex>

          <Flex
            border={
              user?.subscription === MONTHLY
                ? "1px solid #d00"
                : "1px solid transparent"
            }
            direction="column"
            borderRadius={12}
            p={6}
            flexBasis={0}
            flexGrow={1}
            backgroundColor="white"
            position="relative"
            justifyContent="space-between"
          >
            <div>
              {user &&
                !user.cancel_at_period_end &&
                user.subscription === MONTHLY && (
                  <Badge
                    colorScheme="red"
                    width="100px"
                    position="absolute"
                    top="8px"
                    left="8px"
                  >
                    {t("pricing.activePlan")}
                  </Badge>
                )}
              <Text
                fontSize="sm"
                textTransform="uppercase"
                fontWeight="bold"
                color="#D00"
              >
                {t("pricing.monthly.header")}
              </Text>
              <Text fontSize={"3xl"}>${monthPlan?.amount}</Text>

              <Divider color="rgba(33, 51, 63, 0.15)" my={5} />

              <List fontWeight="semibold" fontSize="sm" textAlign="left" mb={8}>
                <ListItem display={"flex"}>
                  <ListIcon as={CheckIcon} color="#D00" mt={1} />
                  {t("pricing.monthly.point1")}
                </ListItem>
                <ListItem display="flex">
                  <ListIcon as={CheckIcon} color="#D00" mt={1} />
                  {t("pricing.monthly.point2")}
                </ListItem>
                <ListItem display="flex">
                  <ListIcon as={CheckIcon} color="#D00" mt={1} />
                  {t("pricing.monthly.point3")}
                </ListItem>
              </List>
            </div>
            <Flex gap={2}>
              {!user && (
                <Button
                  w="100%"
                  mt="auto"
                  backgroundColor="#D00"
                  textTransform="uppercase"
                  onClick={() => {
                    navigate(`/register?interval=${MONTH}`)
                  }}
                  color="white"
                >
                  {t("login.signUp")}
                </Button>
              )}

              {user && user.cancel_at_period_end && (
                <Button
                  w="100%"
                  mt="auto"
                  backgroundColor="#D00"
                  textTransform={"uppercase"}
                  onClick={() => handleSubscribeClick(MONTH)}
                  color="white"
                >
                  {t("login.resubscribe")}
                </Button>
              )}

              {user &&
                user.subscription === MONTHLY &&
                !user.cancel_at_period_end && (
                  <Button
                    w="100%"
                    mt="auto"
                    backgroundColor="#D00"
                    textTransform="uppercase"
                    onClick={handleCancelClick}
                    color="white"
                  >
                    {t("login.cancel")}
                  </Button>
                )}

              {user &&
                user.subscription !== MONTHLY &&
                !user.cancel_at_period_end && (
                  <Button
                    w="100%"
                    mt="auto"
                    backgroundColor="#D00"
                    textTransform="uppercase"
                    onClick={() => handleSubscribeClick(MONTH)}
                    color="white"
                  >
                    {t("login.switch")}
                  </Button>
                )}
            </Flex>
          </Flex>

          <Flex
            border={
              user?.subscription === ANNUAL
                ? "1px solid #d00"
                : "1px solid transparent"
            }
            direction="column"
            borderRadius={12}
            p={6}
            flexBasis={0}
            flexGrow={1}
            backgroundColor="white"
            position="relative"
            justifyContent="space-between"
          >
            <div>
              {user &&
                !user.cancel_at_period_end &&
                user?.subscription === ANNUAL && (
                  <Badge
                    colorScheme="red"
                    width="100px"
                    position="absolute"
                    top="8px"
                    left="8px"
                  >
                    {t("pricing.activePlan")}
                  </Badge>
                )}
              <Text
                fontSize="sm"
                textTransform="uppercase"
                fontWeight="bold"
                color="#D00"
              >
                {t("pricing.annual.header")}
              </Text>
              <Text fontSize={"3xl"}>${annualPlan?.amount}</Text>
              <Divider color="rgba(33, 51, 63, 0.15)" my={5} />
              <List fontWeight="semibold" fontSize="sm" textAlign="left" mb={8}>
                <ListItem display="flex">
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
            </div>
            <Flex gap={2}>
              {!user && (
                <Button
                  w="100%"
                  mt="auto"
                  backgroundColor="#D00"
                  textTransform={"uppercase"}
                  onClick={() => {
                    navigate(`/register?interval=${YEAR}`)
                  }}
                  color="white"
                >
                  {t("login.signUp")}
                </Button>
              )}

              {user && user.cancel_at_period_end && (
                <Button
                  w="100%"
                  mt="auto"
                  backgroundColor="#D00"
                  textTransform={"uppercase"}
                  onClick={() => handleSubscribeClick(YEAR)}
                  color="white"
                >
                  {t("login.resubscribe")}
                </Button>
              )}

              {user &&
                user.subscription === ANNUAL &&
                !user.cancel_at_period_end && (
                  <Button
                    w="100%"
                    mt="auto"
                    backgroundColor="#D00"
                    textTransform="uppercase"
                    onClick={handleCancelClick}
                    color="white"
                  >
                    {t("login.cancel")}
                  </Button>
                )}

              {user &&
                user.subscription !== ANNUAL &&
                !user.cancel_at_period_end && (
                  <Button
                    w="100%"
                    mt="auto"
                    backgroundColor="#D00"
                    textTransform="uppercase"
                    onClick={() => handleSubscribeClick(YEAR)}
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
          onClose={handleCancelClose}
          onConfirm={handleCancelConfirm}
          header="Cancel Subscription"
          body={t("subscription.cancellation.text")}
          type="cancel"
          isProcessing={isProcessing}
        />
        <SubscriptionPopup
          isOpen={isSwitchPopupOpen}
          onClose={handleSwitchCancel}
          onConfirm={handleSubscribeConfirm}
          header="Switch Subscription"
          body={t("subscription.switch.text")}
          type="switch"
          plan={plan}
        />
        <Footer />
      </Box>
    </Stack>
  )
}

export default Pricing
