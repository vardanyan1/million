import {
    Box,
    Text,
    Flex,
    Image,
} from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import instagramImage from "../img/instagram.svg"
import facebookImage from "../img/facebook.svg"

export default function Footer() {
    const { t } = useTranslation()

    return (
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
            <RouterLink target="_blank" href={t("links.instagramLink")}>
            <Image src={instagramImage} mr={6} />
            </RouterLink>
            <RouterLink target="_blank" href={t("links.facebookLink")}>
            <Image src={facebookImage} />
            </RouterLink>
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
    )
}