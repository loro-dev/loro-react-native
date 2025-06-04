import { Text, View, StyleSheet } from 'react-native';
import { ContainerId, LoroDoc, LoroList, ContainerType } from 'loro-react-native';
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
  const text = doc.getText({
    asContainerId: (ty: ContainerType) => new ContainerId.Root({
      name: "text",
      containerType: ty,
    }),
  });
  text.insert(0, "Hello, world!");
  const map = doc.getMap("map");
  const list = map.insertContainer("container", text);
  map.insert("bool", true);
  map.insert("number", 123);
  map.insert("float", 123.456);
  map.insert("string", "Hello, world!");
  map.insert("list", [1, 2, 3]);
  map.insert("map", { "key": "value" });
  map.insert("null", null);
  map.insert("undefined", undefined);

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
