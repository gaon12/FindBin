import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    modalOutside: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)", // 반투명 배경
    },
    map: {
        flex: 1,
    },
    buttonContainer: {
        position: "absolute",
        top: 40,
        right: 10,
        backgroundColor: "white",
        borderRadius: 8,
        padding: 8,
    },
    button: {
        marginVertical: 4,
        padding: 10,
        alignItems: "center",
    },
    customButton: {
        flex: 1,
        backgroundColor: "#007AFF",
        padding: 10,
        margin: 5,
        borderRadius: 5,
        alignItems: "center",
    },
    buttonText: {
        color: "white",
        fontSize: 12,
    },
    modalView: {
        margin: 20,
        backgroundColor: "white",
        borderRadius: 20,
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
    },
    modalText: {
        marginBottom: 15,
        textAlign: "center",
    },
});

export default styles;