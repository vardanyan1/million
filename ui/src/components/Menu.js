import { Text, Stack, Image, Flex, Show, Button, Box } from "@chakra-ui/react"
import { useTranslation } from "react-i18next"

import logo from "../img/reward_flights_logo.svg"
import { ReactComponent as AllRewardsMenuIcon } from "../img/all_rewards_menu_icon.svg"
import { ReactComponent as AustralianFlightsMenuIcon } from "../img/australian_flights_menu_icon.svg"
import { ReactComponent as AlertMenuIcon } from "../img/alert_menu_icon.svg"
import { ReactComponent as SettingsMenuIcon } from "../img/settings_menu_icon.svg"
import { ReactComponent as LogoutMenuIcon } from "../img/logout_menu_icon.svg"
import { ReactComponent as PriceMenuIcon } from "../img/price_menu_icon.svg"
import { ReactComponent as RewardIcon } from "../img/reward_icon.svg"
import { Link as RouterLink, useLocation } from "react-router-dom"
import { useQueryClient } from "@tanstack/react-query"
import { logout } from "../services/api"
import { useAuthContext } from "../services/auth"

const MenuItem = ({ isActive, ...props }) => {
  return (
    <Flex
      as={RouterLink}
      cursor="pointer"
      width={[null, null, null, "100%"]}
      alignItems="center"
      bg={isActive ? "#F7F7F9" : "none"}
      pl={[3, 3, 3, 3]}
      pr={[3, 3, 3, 0]}
      pb={[2, 2, 2, 4]}
      py={[0, 0, 0, 3]}
      height={{ base: "44px", lg: "auto" }}
      borderRadius={12}
      fontSize={14}
      color={isActive ? "#DD0000" : "#6A6E85"}
      {...props}
    />
  )
}

const Menu = () => {
  const queryClient = useQueryClient()
  const location = useLocation()

  const { t } = useTranslation()
  const { user } = useAuthContext()

  const isUserPresent = !!user
  const showShowLoginButton = !isUserPresent && location.pathname !== "/login"

  return (
    <Stack
      direction={{ base: "row", lg: "column" }}
      bg="white"
      flexBasis={{ base: 0, lg: 260 }}
      flexShrink={0}
      px="4"
      py={{ base: 4, lg: 9 }}
      boxShadow={{
        base: "0px 2px 8px rgba(20, 23, 37, 0.08)",
        lg: "0px 0px 12px rgba(20, 23, 37, 0.06)",
      }}
      alignItems={{ base: "center", lg: null }}
    >
      <RouterLink to="/">
        <Image src={logo} width="177px" mb={[0, 0, 0, 6]} />
      </RouterLink>

      <MenuItem
        to={"/"}
        ml={{ base: "auto !important", lg: "0 !important" }}
        isActive={location.pathname === "/"}
      >
        <Image
          as={AllRewardsMenuIcon}
          width={{ base: "20px", lg: "24px" }}
          display="inline"
          fill={location.pathname === "/" ? "#DD0000" : "#6A6E85"}
        />
        <Show above="lg">
          <Text ml={2}>{t("allRewardMenuItem")}</Text>
        </Show>
      </MenuItem>

      <MenuItem
        to={"/australian-flights-for-testing"}
        ml={0}
        isActive={location.pathname === "/australian-flights-for-testing"}
      >
        <Image
          as={AustralianFlightsMenuIcon}
          width={{ base: "20px", lg: "24px" }}
          display="inline"
          stroke={
            location.pathname === "/australian-flights-for-testing"
              ? "#DD0000"
              : "#6A6E85"
          }
        />
        <Show above="lg">
          <Text ml={2}>All Business & First Class</Text>
        </Show>
      </MenuItem>

      <MenuItem
        to={"/pricing"}
        ml={0}
        isActive={location.pathname === "/pricing"}
      >
        <Image
          as={PriceMenuIcon}
          width={{ base: "20px", lg: "24px" }}
          display="inline"
          stroke={location.pathname === "/pricing" ? "#DD0000" : "#6A6E85"}
        />
        <Show above="lg">
          <Text ml={2}>Pricing</Text>
        </Show>
      </MenuItem>

      {isUserPresent && (
        <>
          <MenuItem
            to={"/settings"}
            ml={0}
            isActive={location.pathname === "/settings"}
          >
            <Image
              as={SettingsMenuIcon}
              width={{ base: "20px", lg: "24px" }}
              display="inline"
              stroke={location.pathname === "/settings" ? "#DD0000" : "#6A6E85"}
            />
            <Show above="lg">
              <Text ml={2}>Settings</Text>
            </Show>
          </MenuItem>

          <MenuItem
            to={"/alerts"}
            ml={0}
            isActive={location.pathname === "/alerts"}
          >
            <Image
              as={AlertMenuIcon}
              width={{ base: "20px", lg: "24px" }}
              display="inline"
              stroke={location.pathname === "/alerts" ? "#DD0000" : "#6A6E85"}
            />
            <Show above="lg">
              <Text ml={2}>Alerts</Text>
            </Show>
          </MenuItem>

          <MenuItem
            to={
              "https://docs.google.com/forms/d/e/1FAIpQLSeJnfVte3CL4d-7jCUdHnW_eLaTaRea2pYcO8Kc4HRTv-hmAA/viewform?usp=sf_link"
            }
            ml={0}
            target="_blank"
          >
            <Image
              as={RewardIcon}
              width={{ base: "20px", lg: "24px" }}
              display="inline"
            />
            <Show above="lg">
              <Text ml={2}>Reward Concierge</Text>
            </Show>
          </MenuItem>

          <MenuItem
            ml={0}
            onClick={() => {
              logout()
              queryClient.resetQueries()
            }}
          >
            <Image
              as={LogoutMenuIcon}
              width={{ base: "20px", lg: "24px" }}
              display="inline"
              stroke={"#6A6E85"}
            />
            <Show above="lg">
              <Text ml={2}>Logout</Text>
            </Show>
          </MenuItem>
        </>
      )}
      {showShowLoginButton && (
        <Box pt={{ lg: 8 }} w={{ base: "200px", lg: "100%" }}>
          <RouterLink to="/login">
            <Button
              backgroundColor="#D00"
              color="white"
              w={{ base: "200px", lg: "100%" }}
              textTransform={"uppercase"}
            >
              login
            </Button>
          </RouterLink>
        </Box>
      )}
    </Stack>
  )
}

export default Menu
