import { Text, View, StyleSheet } from 'react-native';
import { ContainerId, loroValueToJsValue, LoroDoc, LoroList, ContainerType, LoroValue, type LoroValueLike } from 'loro-react-native';
String.prototype.asContainerId = function (ty: ContainerType): ContainerId {
  return new ContainerId.Root({
    name: this as string,
    containerType: ty,
  });
};
export default function App() {
  const doc = new LoroDoc();
  const sub = doc.subscribeRoot((e) => {
    console.log(e);
  })
  const text = doc.getText("text");
  text.insert(0, "Hello, world!");
  const map = doc.getMap("map");
  const list = map.insertContainer("container", new LoroList());
  list.insert(0, true);
  list.insert(1, 123);
  map.insert("number", 123);
  map.insert("bool", true);
  map.insert("float", 123.456);
  map.insert("string", "Hello, world!");
  map.insert("list", [1.1, 2, 3.3]);
  map.insert("map", { "key": "value" });
  map.insert("null", null);
  map.insert("undefined", undefined);
  console.log(map.getValue().inner.value);
  doc.commit();

  return (
    <View style={styles.container}>
      <Text>LoroDoc Peer ID: {doc.peerId().toString()}</Text>
      <Text>{text.toString()}</Text>
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
