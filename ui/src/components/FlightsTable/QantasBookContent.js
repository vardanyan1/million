import { useTranslation } from 'react-i18next'
import {
    Heading,
    ListItem,
    OrderedList,
    UnorderedList,
    Button,
    Divider,
    Flex,
    Image,
    Box,
    Text
  } from '@chakra-ui/react'

import qantasFFImage from '../../img/qantas_frequent_flyer_logo.svg'


const numberFormat = new Intl.NumberFormat()

const QantasBookContent = ({ points }) => {
    const { t } = useTranslation()

    const howToBookQantasLink = t('links.howToBookQantasLink')

    return (
        <>
            <Heading as="h1" align="left" mb="4" color="#141725" fontSize={"xl"} fontWeight="extrabold">
                {t('table.bookHeader')}
            </Heading>
            <OrderedList fontWeight={"semibold"} fontSize={"sm"}>
            <ListItem mb={4}>
                {t('table.bookItem1')}
            </ListItem>
            <ListItem mb={4}>
                {t('table.bookItem2')}
                <UnorderedList pl={3}>
                    <ListItem my={3}>{t('table.bookItem2_1')}</ListItem>
                    <ListItem mb={3}>{t('table.bookItem2_2')}</ListItem>
                    <ListItem mb={3}>{t('table.bookItem2_3')}</ListItem>
                    <ListItem>{t('table.bookItem2_4')}</ListItem>
                </UnorderedList>
                </ListItem>
            </OrderedList>
            <Divider/>
            <Flex justify={"space-between"} py={4}>
                <Image src={qantasFFImage}/>
                <Box>
                    <Text fontSize={"md"} fontWeight={"bold"}>{numberFormat.format(points)} {t('table.bookPoints')}</Text>
                    <Text align={"right"} fontWeight={"bold"}>{t('table.bookTaxes')}</Text>
                </Box>
            </Flex>
            <Button as="a" w={'100%'} backgroundColor="#DD0000" color="white" 
                borderRadius={8} boxShadow={"0px 4px 12px rgba(0, 0, 0, 0.24)"}
                target='_blank' href={howToBookQantasLink}>
                {t('table.bookButton')}
            </Button>
        </>
    )
}

export default QantasBookContent