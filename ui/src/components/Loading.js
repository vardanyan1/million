import { Image, AbsoluteCenter } from "@chakra-ui/react"
import loadingAnimation from "../img/loading_animation.svg"

const Loading = () => {
  return (
    <AbsoluteCenter
      backgroundColor="transparent"
      justifyContent="center"
      zIndex="999"
    >
      <Image src={loadingAnimation} />
    </AbsoluteCenter>
  )
}

export default Loading
