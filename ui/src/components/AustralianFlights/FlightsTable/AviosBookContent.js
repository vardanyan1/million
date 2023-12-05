import { useTranslation } from "react-i18next"
import {
  Heading,
  ListItem,
  OrderedList,
  Button,
  Divider,
  Flex,
  Image,
  Box,
  Text,
} from "@chakra-ui/react"
import baClubImage from "../../../img/ba_club.svg"

const numberFormat = new Intl.NumberFormat()

const BookWindowContent = ({ points }) => {
  const { t } = useTranslation()

  const howToBookAviosLink = t("links.howToBookAviosLink")

  return (
    <>
      <Heading
        as="h1"
        align="left"
        mb="4"
        color="#141725"
        fontSize={"xl"}
        fontWeight="extrabold"
      >
        {t("howToBookAvios.header")}
      </Heading>
      <Text mb={4}>{t("howToBookAvios.subheader")}</Text>
      <OrderedList fontWeight={"semibold"} fontSize={"sm"}>
        <ListItem mb={4}>{t("howToBookAvios.bookItem1")}</ListItem>
        <ListItem mb={4}>{t("howToBookAvios.bookItem2")}</ListItem>
        <ListItem mb={4}>{t("howToBookAvios.bookItem3")}</ListItem>
      </OrderedList>
      <Divider />
      <Flex justify={"space-between"} py={4}>
        <Image src={baClubImage} width={170} />
        <Box>
          <Text fontSize={"md"} fontWeight={"bold"}>
            {numberFormat.format(points)} {t("table.avios")}
          </Text>
          <Text align={"right"} fontWeight={"bold"}>
            {t("table.bookTaxes")}
          </Text>
        </Box>
      </Flex>
      <Button
        as="a"
        w={"100%"}
        backgroundColor="#DD0000"
        color="white"
        borderRadius={8}
        boxShadow={"0px 4px 12px rgba(0, 0, 0, 0.24)"}
        target="_blank"
        href={howToBookAviosLink}
      >
        {t("table.bookButton")}
      </Button>
    </>
  )
}

export default BookWindowContent
