import { useTranslation } from "react-i18next"
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
  Text,
} from "@chakra-ui/react"

import velocity from "../../img/velocity.png"

const numberFormat = new Intl.NumberFormat()

const VelocityBookContent = ({ points }) => {
  const { t } = useTranslation()

  const howToBookVelocityLink = t("links.howToBookVelocityLink")

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
        {t("table.velocityBookHeader")}
      </Heading>
      <OrderedList fontWeight={"semibold"} fontSize={"sm"}>
        <ListItem mb={4}>{t("table.velocityBookItem1")}</ListItem>
        <ListItem mb={4}>
          {t("table.velocityBookItem2")}
          <UnorderedList pl={3}>
            <ListItem my={3}>{t("table.velocityBookItem2_1")}</ListItem>
            <ListItem mb={3}>{t("table.velocityBookItem2_2")}</ListItem>
            <ListItem mb={3}>{t("table.velocityBookItem2_3")}</ListItem>
            <ListItem>{t("table.velocityBookItem2_4")}</ListItem>
          </UnorderedList>
        </ListItem>
      </OrderedList>
      <Divider />
      <Flex justify={"space-between"} py={4}>
        <Image src={velocity} width={"100px"} height={"36px"} />
        <Box>
          <Text fontSize={"md"} fontWeight={"bold"}>
            {numberFormat.format(points)} {t("table.velocityBookPoints")}
          </Text>
          <Text align={"right"} fontWeight={"bold"}>
            {t("table.velocityBookTaxes")}
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
        href={howToBookVelocityLink}
      >
        {t("table.velocityBookButton")}
      </Button>
    </>
  )
}

export default VelocityBookContent
