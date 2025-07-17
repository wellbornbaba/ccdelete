import { ReactNode } from "react";
import { Modal, View } from "react-native";
import tw from "twrnc"


type CustomModalProps = {
    visible: boolean;
    children: ReactNode;
    modalContainerStyle?: any;
} & Omit<React.ComponentProps<typeof Modal>, "visible" >; // Allows passing extra Modal props

export default function CustomModal({ children, visible, modalContainerStyle, ...props }: CustomModalProps) {
    return (
        <Modal transparent 
        visible={visible} animationType="fade" {...props} 
        presentationStyle="overFullScreen"
        >
            <View className="justify-center items-center bg-black/65 min-h-full">
                <View 
                    style={tw`  px-3 rounded-2xl w-11/12 z-50 bg-white ${modalContainerStyle}`}>
                    {children}
                </View>
            </View>
        </Modal>
    );
}
