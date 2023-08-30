import { Image, AbsoluteCenter } from "@chakra-ui/react"
import loadingAnimation from "../img/loading_animation.svg"

const Loading = () => {
  return (
    <AbsoluteCenter justifyContent="center">
      <Image src={loadingAnimation} />
    </AbsoluteCenter>
  )
}

export default Loading
