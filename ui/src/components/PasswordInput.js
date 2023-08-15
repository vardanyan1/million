import {
    Image,
    Input,
    InputGroup,
    InputRightElement,
    useBoolean,
  } from "@chakra-ui/react"
import { useTranslation } from 'react-i18next'

import eyeIconOpen from '../img/icon_eye_open.svg'
import eyeIconClose from '../img/icon_eye_close.svg'

export default function PasswordInput({ register, disabled }) {
    const { t } = useTranslation()
    const [isPasswordShown, { toggle: togglePasswordVisibility }] = useBoolean()

    return (
        <InputGroup>
            <Input
                disabled={disabled}
                {...register("password", { 
                    required: t('validation.required')
                })}
                type={isPasswordShown ? 'text' : 'password'}
                bg={"white"}
                placeholder={t('login.passwordPlaceholder')}
                mb={3}
            />
            <InputRightElement>
                <Image src={isPasswordShown ? eyeIconClose : eyeIconOpen}
                    onClick={!disabled ? togglePasswordVisibility : undefined}/>
            </InputRightElement>
        </InputGroup>
    )
}