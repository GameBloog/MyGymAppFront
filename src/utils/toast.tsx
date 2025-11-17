import toast from "react-hot-toast"
import { CustomToast } from "../components/CustomToast"

export const showToast = {
  success: (message: string, title?: string) => {
    toast.custom(
      (t) => <CustomToast type="success" message={message} title={title} />,
      { duration: 3000 }
    )
  },

  error: (message: string, title?: string) => {
    toast.custom(
      (t) => <CustomToast type="error" message={message} title={title} />,
      { duration: 4000 }
    )
  },

  warning: (message: string, title?: string) => {
    toast.custom(
      (t) => <CustomToast type="warning" message={message} title={title} />,
      { duration: 3500 }
    )
  },

  info: (message: string, title?: string) => {
    toast.custom(
      (t) => <CustomToast type="info" message={message} title={title} />,
      { duration: 3000 }
    )
  },

  loading: (message: string) => {
    return toast.loading(message)
  },

  dismiss: (toastId?: string) => {
    toast.dismiss(toastId)
  },
}
