import {
  Heading,
  Box,
  Button,
  Stack,
  Input,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Text,
  Flex,
} from "@chakra-ui/react"
import { Link as RouterLink, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"

import PasswordInput from "../components/PasswordInput"
import { login } from "../services/api"
import { EMAIL_REGEX } from "../constants"
import Menu from "../components/Menu"

export default function Login() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { mutateAsync: performLogin } = useMutation({
    mutationFn: login,
    onSuccess: () => queryClient.invalidateQueries(["me"]),
  })
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm()

  const onSubmit = async (values) => {
    values.email = values.email.toLowerCase()

    try {
      await performLogin(values)
      navigate("/")
    } catch (error) {
      const message = error.response?.data?.detail || t("login.generalError")
      setError("root.loginError", {
        type: "loginError",
        message,
      })
    }
  }

  return (
    <Stack
      direction={{ base: "column", lg: "row" }}
      minHeight="100vh"
      spacing={0}
    >
      <Menu />
      <Flex
        bg="#F7F7F9"
        px={[0, 7]}
        py="7"
        marginInlineStart={0}
        flexGrow={1}
        justifyContent={"center"}
      >
        <Box width={{ base: 350, sm: 400 }} p={7}>
          <Heading
            as="h1"
            pb={6}
            color="#141725"
            textAlign="left"
            fontSize={{ base: "xl", lg: "2xl" }}
          >
            {t("login.header")}
          </Heading>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FormControl mb={6} isInvalid={!!errors?.email}>
              <FormLabel fontSize={"xs"} fontWeight="semibold">
                {t("login.email")}
              </FormLabel>
              <Input
                {...register("email", {
                  required: t("validation.required"),
                  pattern: {
                    value: EMAIL_REGEX,
                    message: t("validation.email.pattern"),
                  },
                })}
                placeholder={t("login.emailPlaceholder")}
                bg={"white"}
              />
              <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
            </FormControl>
            <FormControl mb={1} isInvalid={!!errors?.password}>
              <FormLabel fontSize={"xs"} fontWeight="semibold">
                {t("login.password")}
              </FormLabel>
              <PasswordInput register={register} />
              <FormErrorMessage>{errors.password?.message}</FormErrorMessage>
              <Box
                textAlign="right"
                color="#D00"
                fontSize={"sm"}
                textDecoration={"underline"}
              >
                <RouterLink to="/reset-password">
                  {t("login.forgotPassword")}
                </RouterLink>
              </Box>
            </FormControl>
            <FormControl isInvalid={errors.root?.loginError}>
              <FormErrorMessage>
                {errors.root?.loginError.message}
              </FormErrorMessage>
            </FormControl>
            <Button
              type="submit"
              my={5}
              width={"100%"}
              backgroundColor="#D00"
              color="white"
            >
              {t("login.login")}
            </Button>
            <Text fontSize={"sm"}>
              {t("login.noAccountYet")} {` `}
              <Text as="span" color="#D00" textDecoration={"underline"}>
                <RouterLink to="/pricing">{t("login.signUp")}</RouterLink>
              </Text>
            </Text>
          </form>
        </Box>
      </Flex>
    </Stack>
  )
}
