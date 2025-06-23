import { StyleSheet, Text, View } from "react-native";
import {
  ContainerId,
  ContainerType,
  LoroDoc,
  LoroList,
  LoroValue,
  type LoroValueLike,
  loroValueToJsValue,
} from "../../src";

export default function App() {
  const doc = new LoroDoc();
  const sub = doc.subscribeRoot((e) => {
    console.log("doc sub", e);
  });
  const text = doc.getText("text");
  text.insert(0, "Hello, world!");
  const map = doc.getMap("map");
  const list = map.insertContainer("container", new LoroList());
  list.insert(0, true);
  map.subscribe((e) => { console.log("map sub", e) })
  list.insert(1, 123);
  map.insert("number", 123);
  map.insert("bool", true);
  map.insert("float", 123.456);
  map.insert("string", "Hello, world!");
  map.insert("list", [1.1, 2, 3.3]);
  map.insert("map", { "key": "value" });
  map.insert("null", null);
  map.insert("undefined", undefined);
  console.log(map.getDeepValue());
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
    alignItems: "center",
    justifyContent: "center",
  },
});
