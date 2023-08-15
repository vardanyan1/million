import {
    Box,
    Stack,
    Heading,
    Text
} from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'

import Menu from '../components/Menu';

const PrivacyPolicy = () => {
    const { t } = useTranslation()

    return (
        <Stack direction={{base: 'column', lg: 'row' }} minHeight="100vh" spacing={0}>
            <Menu/>

            <Box bg="#F7F7F9" p={7} marginInlineStart={0} flexGrow={1}>
                <Heading as="h1" pb="2" color="#141725" fontSize={{base: "xl", lg: "2xl"}}>
                    {t('privacy.header')}
                </Heading>
                <Text color="#141725" pb="6" fontSize={{base: "small", lg: "sm"}}>
                    {t('privacy.paragraph1')}
                </Text>

                <Heading as="h2" py="2" color="#141725" fontSize={{base: "xl", lg: "2xl"}}>
                    {t('privacy.coverSubheader')}
                </Heading>
                <Text color="#141725" pb="6" fontSize={{base: "small", lg: "sm"}}>
                    {t('privacy.coverParagraph1')}
                </Text>
                <Text color="#141725" pb="6" fontSize={{base: "small", lg: "sm"}}>
                    {t('privacy.coverParagraph2')}
                </Text>

                <Heading as="h2" py="2" color="#141725" fontSize={{base: "xl", lg: "2xl"}}>
                    {t('privacy.collectSubheader')}
                </Heading>
                <Text color="#141725" pb="6" fontSize={{base: "small", lg: "sm"}}>
                    {t('privacy.collectParagraph1')}
                </Text>

                <Heading as="h2" py="2" color="#141725" fontSize={{base: "xl", lg: "2xl"}}>
                    {t('privacy.addressSubheader')}
                </Heading>
                <Text color="#141725" pb="6" fontSize={{base: "small", lg: "sm"}}>
                    {t('privacy.addressParagraph1')}
                </Text>
                <Text color="#141725" pb="6" fontSize={{base: "small", lg: "sm"}}>
                    {t('privacy.addressParagraph2')}
                </Text>

                <Heading as="h2" py="2" color="#141725" fontSize={{base: "xl", lg: "2xl"}}>
                    {t('privacy.emailSubheader')}
                </Heading>
                <Text color="#141725" pb="6" fontSize={{base: "small", lg: "sm"}}>
                    {t('privacy.emailParagraph1')}
                </Text>

                <Heading as="h2" py="2" color="#141725" fontSize={{base: "xl", lg: "2xl"}}>
                    {t('privacy.advertSubheader')}
                </Heading>
                <Text color="#141725" pb="6" fontSize={{base: "small", lg: "sm"}}>
                    {t('privacy.advertParagraph1')}
                </Text>

                <Heading as="h2" py="2" color="#141725" fontSize={{base: "xl", lg: "2xl"}}>
                    {t('privacy.choicesSubheader')}
                </Heading>
                <Text color="#141725" pb="6" fontSize={{base: "small", lg: "sm"}}>
                    {t('privacy.choicesParagraph1')}
                </Text>
            </Box>

        </Stack>
    )
}

export default PrivacyPolicy