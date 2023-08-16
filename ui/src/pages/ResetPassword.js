import {
  Box,
  Heading,
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  Text,
  Button,
  useToast,
  Stack,
  Flex,
} from "@chakra-ui/react"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useMutation } from "@tanstack/react-query"

import Menu from '../components/Menu'
import { EMAIL_REGEX } from "../constants"
import { resetPassword } from "../services/api"

export default function ResetPassword() {
  const { t } = useTranslation()
  const toast = useToast()
  const { mutateAsync: resetPasswordMutation } = useMutation({
    mutationFn: resetPassword,
  })
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm()

  const onSubmit = async (values) => {
    try {
      await resetPasswordMutation(values.email)
      toast({
        position: "bottom-right",
        title: t("resetPassword.toastSuccess"),
        status: "success",
      })
    } catch (error) {
      const message = error.response?.data[0] || t("resetPassword.generalError")
      setError("root.resetPasswordError", {
        type: "resetPasswordError",
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
          fontSize={"2xl"}
        >
          {t("resetPassword.header")}
        </Heading>
        <Text fontSize={"sm"} textAlign={"left"} mb={6}>
          {t("resetPassword.paragraph")}
        </Text>
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
          <FormControl isInvalid={errors.root?.resetPasswordError}>
            <FormErrorMessage>
              {errors.root?.resetPasswordError.message}
            </FormErrorMessage>
          </FormControl>
          <Button
            textTransform={"uppercase"}
            type="submit"
            my={5}
            width={"100%"}
            backgroundColor="#D00"
            color="white"
          >
            {t("resetPassword.button")}
          </Button>
        </form>
      </Box>
    </Flex>
    </Stack>
  )
}
