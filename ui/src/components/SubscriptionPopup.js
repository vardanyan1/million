import React from "react"
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Button,
} from "@chakra-ui/react"
import { useTranslation } from "react-i18next"

const SubscriptionPopup = ({
  isOpen,
  onClose,
  onConfirm,
  header,
  body,
  type,
  plan,
  isProcessing = false,
}) => {
  const { t } = useTranslation()

  const handleConfirmation = () => {
    if (type === "cancel") {
      onConfirm()
    }
    if (type === "switch") {
      onConfirm(plan)
    }
  }

  return (
    <AlertDialog isOpen={isOpen} onClose={onClose} isCentered>
      <AlertDialogOverlay>
        <AlertDialogContent maxWidth="lg">
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            {header}
          </AlertDialogHeader>
          <AlertDialogBody>{body}</AlertDialogBody>
          <AlertDialogFooter justifyContent="center">
            <Button onClick={onClose} textTransform="uppercase">
              {t("subscription.cancellation.cancel.button")}
            </Button>
            <Button
              backgroundColor="#D00"
              color="white"
              onClick={handleConfirmation}
              ml={3}
              textTransform="uppercase"
              isDisabled={isProcessing}
            >
              {t("subscription.cancellation.confirm.button")}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  )
}

export default SubscriptionPopup
