import {
    Box,
    Image,
    AbsoluteCenter,
    Center,
    Flex
} from '@chakra-ui/react'

import loadingAnimation from '../img/loading_animation.svg'

export default function Loading() {
    return (
        <AbsoluteCenter justifyContent="center">
            <Image src={loadingAnimation}/>
        </AbsoluteCenter>
    )
}