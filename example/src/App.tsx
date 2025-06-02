import { Text, View, StyleSheet } from 'react-native';
import { LoroDoc } from '../../src';

export default function App() {
  const doc = new LoroDoc();
  return (
    <View style={styles.container}>
      <Text>LoroDoc Peer ID: {doc.peerId().toString()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
