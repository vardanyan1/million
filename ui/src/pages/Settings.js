import {
  Heading,
  Box,
  Button,
  Input,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Stack,
  Flex,
  useToast,
  Badge,
  Text,
} from "@chakra-ui/react"
import { useForm } from "react-hook-form"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"

import PasswordInput from "../components/PasswordInput"

import { updateUser, me } from "../services/api"
import Menu from "../components/Menu"
import { useAuthContext } from "../services/auth"

export default function Settings() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { user, error } = useAuthContext()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    },
    values: {
      firstName: user?.first_name,
      lastName: user?.last_name,
      email: user?.email,
      password: "***********",
    },
  })
  const { mutateAsync: updateUserInfo } = useMutation({
    mutationFn: updateUser,
    onSuccess: () => queryClient.invalidateQueries(["me"]),
  })
  const toast = useToast()

  const onSubmit = async (values) => {
    try {
      const updateValues = {
        first_name: values.firstName,
        last_name: values.lastName,
      }
      await updateUserInfo(updateValues)
      toast({
        position: "bottom-right",
        title: "Successfully updated user data",
        status: "success",
      })
    } catch (err) {
      setError("root.updateUserError", {
        type: "updateUserError",
        message: "Error happened. Please try again.",
      })
      toast({
        position: "bottom-right",
        title: "Error updating user data",
        status: "error",
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
        <Box width={{ base: 350, sm: 400 }}>
          <Heading
            as="h1"
            pt={10}
            pb={6}
            color="#141725"
            textAlign="left"
            fontSize={{ base: "xl", lg: "2xl" }}
          >
            {t("settings.header")}
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
                disabled
                {...register("email", { required: t("validation.required") })}
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
              <PasswordInput register={register} disabled />
              <FormErrorMessage>{errors.password?.message}</FormErrorMessage>
            </FormControl>
            <FormControl isInvalid={errors.root?.updateUserError}>
              <FormErrorMessage>
                {errors.root?.updateUserError.message}
              </FormErrorMessage>
            </FormControl>
            <Flex alignItems={"center"} justifyContent="center">
              <Text mr={2}>Active Plan:</Text>
              <Badge fontSize="md" colorScheme="red">{user.subscription}</Badge>
            </Flex>
            <Button
              type="submit"
              my={5}
              width={"100%"}
              backgroundColor="#D00"
              color="white"
            >
              {t("settings.save")}
            </Button>
          </form>
        </Box>
      </Flex>
    </Stack>
  )
}
