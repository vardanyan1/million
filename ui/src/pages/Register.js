import {
  Heading,
  Box,
  Button,
  Input,
  FormControl,
  FormLabel,
  Text,
  Checkbox,
  FormErrorMessage,
  Stack,
  Flex,
} from "@chakra-ui/react"
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom"
import { useForm, Controller } from "react-hook-form"
import { useMutation } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"

import { signup, login, createCheckoutSession } from "../services/api"
import { EMAIL_REGEX, PRICE_INTERVAL } from "../constants"
import Menu from '../components/Menu';
import PasswordInput from "../components/PasswordInput"

export default function Register() {
  const { t } = useTranslation()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
    control,
  } = useForm()
  const { mutateAsync: performSignup } = useMutation({ 
    mutationFn: signup
  })
  const { mutateAsync: performLogin } = useMutation({ 
    mutationFn: login,
  })
  const { mutateAsync: checkoutSessionMutation  } = useMutation({
    mutationFn: createCheckoutSession
})
  const { interval = PRICE_INTERVAL.MONTHLY } = useParams()

  const onSubmit = async (values) => {
    try {
      const credentials = { 
        email: values.email,
        password: values.password,
      }
      const signupValues = {
        first_name: values.firstName,
        last_name: values.lastName,
        ...credentials
      }
      await performSignup(signupValues)
      await performLogin(credentials)
      const response = await checkoutSessionMutation({ interval })
      window.location.href = response.session_url
    } catch (error) {
      let message = t("register.generalError")
      const firstKey = Object.keys(error.response?.data)[0]
      if (firstKey) {
        message = error.response?.data[firstKey][0]
      }
      setError("root.signupError", {
        type: "signupError",
        message,
      })
    }
  }

  return (
    <Stack direction={{base: 'column', lg: 'row' }} minHeight="100vh" spacing={0}>
      <Menu/>
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
          {t("register.header")}
        </Heading>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FormControl mb={6} isInvalid={!!errors?.firstName}>
            <FormLabel fontSize={"xs"} fontWeight="semibold">
              {t("register.firstName")}
            </FormLabel>
            <Input
              {...register("firstName", {
                required: t("validation.required"),
              })}
              placeholder={t("register.firstNamePlaceholder")}
              bg={"white"}
            />
            <FormErrorMessage>{errors.firstName?.message}</FormErrorMessage>
          </FormControl>
          <FormControl mb={6} isInvalid={!!errors?.lastName}>
            <FormLabel fontSize={"xs"} fontWeight="semibold">
              {t("register.lastName")}
            </FormLabel>
            <Input
              {...register("lastName", {
                required: t("validation.required"),
              })}
              placeholder={t("register.lastNamePlaceholder")}
              bg={"white"}
            />
            <FormErrorMessage>{errors.lastName?.message}</FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={!!errors?.email}>
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
              type="email"
              bg={"white"}
              placeholder={t("login.emailPlaceholder")}
              mb={3}
            />
            <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
          </FormControl>
          <FormControl mb={2} isInvalid={!!errors?.password}>
            <FormLabel fontSize={"xs"} fontWeight="semibold">
              {t("login.password")}
            </FormLabel>
            <PasswordInput register={register} />
            <FormErrorMessage>{errors.password?.message}</FormErrorMessage>
          </FormControl>
          <FormControl textAlign="left" isInvalid={!!errors?.privacyPolicy}>
            <Controller
              control={control}
              name="privacyPolicy"
              rules={{ required: t("validation.required") }}
              render={({ field: { onChange, value, ref } }) => {
                return (
                  <Checkbox
                    onChange={onChange}
                    ref={ref}
                    isChecked={value}
                    colorScheme={"red"}
                  >
                    <Text fontSize="sm" fontWeight="semibold">
                      {t("register.readPrivacyPolicy")} {` `}
                      <Text
                        as="span"
                        color="#D00"
                        textDecoration={"underline"}
                      >
                        <RouterLink to="/privacy-policy" target="_blank">
                          {t("privacy.header")}
                        </RouterLink>
                      </Text>{" "}
                      {t("register.acceptPrivacyPolicy")}
                    </Text>
                  </Checkbox>
                )
              }}
            />
            <FormErrorMessage>
              {errors.privacyPolicy?.message}
            </FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={errors.root?.signupError}>
            <FormErrorMessage>
              {errors.root?.signupError.message}
            </FormErrorMessage>
          </FormControl>
          <Button
            type="submit"
            my={5}
            width={"100%"}
            backgroundColor="#D00"
            color="white"
          >
            {t("login.signUp")}
          </Button>
          <Text fontSize={"sm"} fontWeight="semibold">
            {t("register.alreadyHaveAccount")} {` `}
            <Text as="span" color="#D00" textDecoration={"underline"}>
              <RouterLink to="/login">{t("login.login")}</RouterLink>
            </Text>
          </Text>
        </form>
      </Box>
      </Flex>
    </Stack>
  )
}
