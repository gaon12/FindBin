const CompleteLogin = () => {
return(
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Hello! I am a Modal!</Text>
          <Text>This is some text in the modal.</Text>
          <Text>로그인 성공</Text> {/* 로그인 성공 텍스트 */}
          <TouchableOpacity onPress={toggleModal}>
            <Text>Hide Modal</Text>
          </TouchableOpacity>
        </View>
)
}