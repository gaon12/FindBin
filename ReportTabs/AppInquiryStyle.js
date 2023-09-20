import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f5f5f5',
    },
    categoryButton: {
        marginBottom: 12,
    },
    categoryInput: {
        backgroundColor: '#fff',
        borderWidth: 1, // 경계선을 추가합니다.
        borderColor: '#6200ea', // 경계선 색상을 설정합니다.
        borderRadius: 4, // 경계선의 반경을 설정합니다.
        paddingHorizontal: 8, // 좌우 패딩을 추가합니다.
        paddingVertical: 4, // 상하 패딩을 추가합니다.
        height: 50,
    },
    input: {
        marginBottom: 12,
        backgroundColor: '#fff',
    },
    textArea: {
        height: 150,
    },
    button: {
        marginBottom: 12,
        backgroundColor: '#6200ea',
    },
    imagesContainer: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    imageContainer: {
        position: 'relative',
        marginRight: 8,
    },
    image: {
        width: 100,
        height: 100,
        borderRadius: 8,
    },
    icon: {
        position: 'absolute',
        top: -10,
        right: -10,
    },
    footer: {
        flex: 1,
        justifyContent: 'flex-end',
        marginBottom: 16,
    },
    submitButton: {
        backgroundColor: '#6200ea',
    },
});

export default styles;
