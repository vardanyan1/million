import {
    Box,
    Stack,
    Heading,
    Text
} from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'

import Menu from '../components/Menu';

const TermsAndConditions = () => {
    const { t } = useTranslation()

    return (
            <Stack direction={{base: 'column', lg: 'row' }} minHeight="100vh" spacing={0}>
                <Menu/>

                <Box bg="#F7F7F9" p={7} marginInlineStart={0} flexGrow={1}>
                    <Heading as="h1" pb="2" color="#141725" fontSize={{base: "xl", lg: "2xl"}}>
                        {t('terms.header')}
                    </Heading>
                    <Text color="#141725" pb="6" fontSize={{base: "small", lg: "sm"}}>
                        {t('terms.paragraph1')}
                    </Text>
                    <Text color="#141725" pb="6" fontSize={{base: "small", lg: "sm"}}>
                        {t('terms.paragraph2')}
                    </Text>

                    <Heading as="h2" py="2" color="#141725" fontSize={{base: "xl", lg: "2xl"}}>
                        {t('terms.servicesSubheader')}
                    </Heading>
                    <Text color="#141725" pb="6" fontSize={{base: "small", lg: "sm"}}>
                        {t('terms.servicesParagraph1')}
                    </Text>
                    <Text color="#141725" pb="6" fontSize={{base: "small", lg: "sm"}}>
                        {t('terms.servicesParagraph2')}
                    </Text>

                    <Heading as="h2" py="2" color="#141725" fontSize={{base: "xl", lg: "2xl"}}>
                        {t('terms.useSubheader')}
                    </Heading>
                    <Text color="#141725" pb="6" fontSize={{base: "small", lg: "sm"}}>
                        {t('terms.useParagraph1')}
                    </Text>
                    <Text color="#141725" pb="6" fontSize={{base: "small", lg: "sm"}}>
                        {t('terms.useParagraph2')}
                    </Text>
                    <Text color="#141725" pb="6" fontSize={{base: "small", lg: "sm"}}>
                        {t('terms.useParagraph3')}
                    </Text>
                    <Text color="#141725" pb="6" fontSize={{base: "small", lg: "sm"}}>
                        {t('terms.useParagraph4')}
                    </Text>

                    <Heading as="h2" py="2" color="#141725" fontSize={{base: "xl", lg: "2xl"}}>
                        {t('terms.disclaimerSubheader')}
                    </Heading>
                    <Text color="#141725" pb="6" fontSize={{base: "small", lg: "sm"}}>
                        {t('terms.disclaimerParagraph1')}
                    </Text>
                    <Text color="#141725" pb="6" fontSize={{base: "small", lg: "sm"}}>
                        {t('terms.disclaimerParagraph2')}
                    </Text>

                    <Heading as="h2" py="2" color="#141725" fontSize={{base: "xl", lg: "2xl"}}>
                        {t('terms.limitationSubheader')}
                    </Heading>
                    <Text color="#141725" pb="6" fontSize={{base: "small", lg: "sm"}}>
                        {t('terms.limitationParagraph1')}
                    </Text>

                    <Heading as="h2" py="2" color="#141725" fontSize={{base: "xl", lg: "2xl"}}>
                        {t('terms.warrantySubheader')}
                    </Heading>
                    <Text color="#141725" pb="6" fontSize={{base: "small", lg: "sm"}}>
                        {t('terms.warrantyParagraph')}
                    </Text>

                    <Heading as="h2" py="2" color="#141725" fontSize={{base: "xl", lg: "2xl"}}>
                        {t('terms.indemnificationSubheader')}
                    </Heading>
                    <Text color="#141725" pb="6" fontSize={{base: "small", lg: "sm"}}>
                        {t('terms.indemnificationParagraph1')}
                    </Text>
                    <Text color="#141725" pb="6" fontSize={{base: "small", lg: "sm"}}>
                        {t('terms.indemnificationParagraph2')}
                    </Text>
                </Box>

            </Stack>
    )
}

export default TermsAndConditions