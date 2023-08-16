import { useTranslation } from 'react-i18next'
import {
    Heading,
    Button,
    Image,
    Flex,
    Text,
    Box,
    Divider
  } from '@chakra-ui/react'

import amexImage from '../../img/logo_amex.svg'
import qantasLogoImage from '../../img/qantas_logo.svg'
import amexQantas from '../../img/amex_qantas.png'
import amexQantasBusiness from '../../img/amex_qantas_business.png'


const numberFormat = new Intl.NumberFormat()

const EarnPointsContent = ({ points, destinationAirport }) => {
    const { t } = useTranslation()

    const personalQantasAmexCardLink = t("links.personalQantasAmexCard")
    const businessQantasAmexCardLink = t("links.businessQantasAmexCard")

    return (
        <>
            <Heading as="h2" align="left" mb="4" color="#141725" fontSize={"15px"} fontWeight="extrabold">
                {t('flyModal.header', { city: destinationAirport?.name })}
            </Heading>

            <Flex gap={4} align={"center"} mb={6}>
                <Image src={amexImage}/>
                <Text fontWeight={"bold"} fontSize={"sm"}>{t('flyModal.bonus')}</Text>
                <Text ml={"auto"} fontWeight={"bold"}>{t('flyModal.cardSignupBonus')}</Text>
            </Flex>

            <Flex gap={4} align={"center"}>
                <Image src={qantasLogoImage}/>
                <Box fontWeight={"bold"} fontSize={"sm"}>
                    {t('flyModal.pointsRequired')}<br/>
                    <Text color="#6A6E85" fontSize={"xs"} fontWeight={"normal"}>
                        {t('flyModal.pointsRequiredSub')}
                    </Text>
                </Box>
                <Text ml={"auto"} fontWeight={"bold"}>{numberFormat.format(points)}</Text>
            </Flex>

            <Divider my={5}/>

            <Text color="#6A6E85" fontSize={"xs"} fontWeight={"bold"} mb={4}>{t('flyModal.personal')}</Text>
            <Flex gap={3} align={"center"}>
                <Image w={"65px"} src={amexQantas}/>
                <Box fontWeight={"bold"}>
                    {t('flyModal.personalExpressCard')}<br/>
                </Box>
                <Button as="a" target="_blank" href={personalQantasAmexCardLink} fontWeight="bold" 
                    borderRadius={8} backgroundColor="#DD0000" color="white" fontSize={"sm"} py={1} 
                    px={6} boxShadow="0px 4px 12px rgba(0, 0, 0, 0.24)">APPLY</Button>
            </Flex>
            <Text mt={2} fontSize={"xs"} fontWeight={"normal"}>
                {t('flyModal.personalUpToPoints')}
            </Text>
            <Text mb={5} fontSize={"11px"} fontStyle={"italic"} lineHeight={3}>
                {t('flyModal.bonusSub')}
            </Text>
            <Text color="#6A6E85" fontSize={"xs"} fontWeight={"bold"} mb={4}>{t('flyModal.business')}</Text>

            <Flex gap={3} align={"center"}>
                <Image w={"65px"} src={amexQantasBusiness}/>
                <Box fontWeight={"bold"}>
                    {t('flyModal.businessExpressCard')}<br/>
                </Box>
                <Button as="a" target="_blank" href={businessQantasAmexCardLink} fontWeight="bold" 
                    borderRadius={8} backgroundColor="#DD0000" color="white" py={1} px={6} 
                    fontSize={"sm"} boxShadow="0px 4px 12px rgba(0, 0, 0, 0.24)">APPLY</Button>
            </Flex>
            <Text mt={2} fontSize={"xs"} fontWeight={"normal"}>
                {t('flyModal.businessUpToPoints')}
            </Text>
            <Text mb={5} fontSize={"11px"} fontStyle={"italic"} lineHeight={"3"}>
                {t('flyModal.bonusSub')}
            </Text>
            <Box backgroundColor="#F7F7F9" p={5} mx={-5}>
                <Text fontStyle={"italic"} color="#6A6E85" fontSize={"xs"}>
                    {t('flyModal.disclaimer')}
                </Text>
            </Box>
        </>
    )
}

export default EarnPointsContent