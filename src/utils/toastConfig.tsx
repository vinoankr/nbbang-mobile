import { ErrorToast, InfoToast, SuccessToast, ToastProps } from "react-native-toast-message";
import { StyleSheet } from "react-native";

const toastStyle = StyleSheet.create({
  successToast: {
    backgroundColor: '#fff',
    borderLeftColor: '#06B20C',
    display: 'flex',
    alignItems: 'center',
    paddingLeft: 10,
    borderRadius: 16,
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  errorToast: {
    backgroundColor: '#fff',
    borderLeftColor: '#E34033',
    display: 'flex',
    alignItems: 'center',
    paddingLeft: 10,
    borderRadius: 16,
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoToast: {
    backgroundColor: '#fff',
    borderLeftColor: '#fff',
    display: 'flex',
    alignItems: 'center',
    paddingLeft: 10,
    borderRadius: 16,
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  toastContent: {
    paddingHorizontal: 5,
  },
  toastText1: {
    fontSize: 16,
    fontWeight: '600',
    color: '#30333D',
  },
});

export const toastConfig = {
  success: (props: ToastProps) => (
    <SuccessToast
      {...props}
      style={toastStyle.successToast}
      contentContainerStyle={toastStyle.toastContent}
      text1Style={toastStyle.toastText1}
    />
  ),
  error: (props: ToastProps) => (
    <ErrorToast
      {...props}
      style={toastStyle.errorToast}
      contentContainerStyle={toastStyle.toastContent}
      text1Style={toastStyle.toastText1}
    />
  ),
  info: (props: ToastProps) => (
    <InfoToast
      {...props}
      style={toastStyle.infoToast}
      contentContainerStyle={toastStyle.toastContent}
      text1Style={toastStyle.toastText1}
    />
  ),
}; 