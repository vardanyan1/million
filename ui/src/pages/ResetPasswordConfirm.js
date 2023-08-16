import {
  Box,
  Heading,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Text,
  Button,
  useToast,
  Flex,
  Stack,
} from "@chakra-ui/react"
import { useParams, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { useMutation } from "@tanstack/react-query"

import Menu from '../components/Menu'
import { resetPasswordConfirm } from "../services/api"
import PasswordInput from "../components/PasswordInput"

export default function ResetPasswordConfirm() {
  const { t } = useTranslation()
  const { uid, token } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { mutateAsync: resetPasswordConfirmMutation } = useMutation({
    mutationFn: resetPasswordConfirm,
  })
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm()

  const onSubmit = async (values) => {
    try {
      await resetPasswordConfirmMutation({
        new_password: values.password,
        uid,
        token,
      })
      toast({
        position: "bottom-right",
        title: t("resetPasswordConfirm.toastSuccess"),
        status: "success",
      })
      navigate('/login')
    } catch (error) {
      setError("root.resetPasswordConfirmError", {
        type: "resetPasswordConfirmError",
        message: t("resetPasswordConfirm.generalError"),
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
          {t("resetPasswordConfirm.header")}
        </Heading>
        <Text fontSize={"sm"} textAlign={"left"} mb={6}>
          {t("resetPasswordConfirm.paragraph")}
        </Text>
        <form onSubmit={handleSubmit(onSubmit)}>
          <FormControl isInvalid={!!errors?.password}>
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
            ></Box>
          </FormControl>
          <FormControl isInvalid={errors.root?.resetPasswordConfirmError}>
            <FormErrorMessage>
              {errors.root?.resetPasswordConfirmError.message}
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
            {t("resetPasswordConfirm.button")}
          </Button>
        </form>
      </Box>
    </Flex>
    </Stack>
  )
}
