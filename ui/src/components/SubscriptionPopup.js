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

const SubscriptionPopup = ({
  isOpen,
  onClose,
  onConfirm,
  header,
  body,
  type,
  plan,
}) => {
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
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            {header}
          </AlertDialogHeader>
          <AlertDialogBody>{body}</AlertDialogBody>
          <AlertDialogFooter>
            <Button onClick={onClose}>No</Button>
            <Button
              backgroundColor="#D00"
              color="white"
              onClick={handleConfirmation}
              ml={3}
            >
              Yes
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  )
}

export default SubscriptionPopup
