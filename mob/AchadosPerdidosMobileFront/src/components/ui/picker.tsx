import { Dimensions, StyleSheet } from "react-native";
const { width, height } = Dimensions.get("window");
 
export const picker = StyleSheet.create({
    centerView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 22,
 
    },
 
    modalView: {
        margin: 20,
        backgroundColor: "white",
        borderRadius: 20,
        width: "90%",
        padding: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
           
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
 
 
    }
   
});