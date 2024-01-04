import { Box, Stack } from "@chakra-ui/react"
import React from "react"
import Menu from "../components/Menu"

const NotFound = () => {
  return (
    <Stack
      direction={{ base: "column", lg: "row" }}
      minHeight="100vh"
      spacing={0}
    >
      <Menu />

      <Box
        bg="#F7F7F9"
        px={[0, 7]}
        py="7"
        display={"flex"}
        flexDirection={"column"}
        justifyContent={"center"}
        alignItems={"center"}
        marginInlineStart={0}
        flexGrow={1}
      >
        <h1 style={{ fontWeight: "bold" }}>404 - Page Not Found</h1>

        <p>Sorry, the page you are looking for does not exist.</p>

        <div
          style={{
            margin: "12px 0",
            borderRadius: "12px",
            backgroundColor: "#D00",
            color: "#fff",
            width: "fit-content",
            padding: "8px 16px",
          }}
        >
          <a href="/">Go Home</a>
        </div>
      </Box>
    </Stack>
  )
}

export default NotFound
