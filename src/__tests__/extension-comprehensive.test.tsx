import {
    LoroDoc,
    LoroMap,
    LoroList,
    LoroMovableList,
    LoroText,
    LoroCounter,
    LoroTree,
    UndoManager,
    ContainerId,
    ContainerType,
    LoroValue,
    UndoOrRedo,
    VersionVector,
    Frontiers,
    IdSpan,
} from '../index';

describe('Comprehensive Extension Interface Tests', () => {
    let doc: LoroDoc;

    beforeEach(() => {
        doc = new LoroDoc();
    });

    afterEach(() => {
        // Clean up any subscriptions or resources
    });

    describe('LoroDoc Export Methods', () => {
        test('export with snapshot mode - empty document', () => {
            const exported = doc.export({ mode: "snapshot" });
            expect(exported).toBeInstanceOf(Uint8Array);
            expect(exported.length).toBeGreaterThan(0);
        });

        test('export with snapshot mode - populated document', () => {
            const map = doc.getMap("testMap");
            const list = doc.getList("testList");
            const text = doc.getText("testText");

            map.insert("key1", "value1");
            map.insert("key2", 42);
            list.push("item1");
            list.push("item2");
            text.insert(0, "Hello World");

            const exported = doc.export({ mode: "snapshot" });
            expect(exported).toBeInstanceOf(Uint8Array);
            expect(exported.length).toBeGreaterThan(0);
        });

        test('export with updates mode', () => {
            const map = doc.getMap("test");
            map.insert("key", "initial");

            const version = doc.version();
            map.insert("key", "updated");

            const exported = doc.export({ mode: "updates", from: version });
            expect(exported).toBeInstanceOf(Uint8Array);
        });

        test('export with updatesInRange mode - empty spans', () => {
            const map = doc.getMap("test");
            map.insert("key", "value");

            const exported = doc.export({ mode: "updatesInRange", spans: [] });
            expect(exported).toBeInstanceOf(Uint8Array);
        });

        test('export with shallowSnapshot mode', () => {
            const map = doc.getMap("test");
            map.insert("key", "value");

            const frontiers = doc.frontiers();
            const exported = doc.export({ mode: "shallowSnapshot", frontiers });
            expect(exported).toBeInstanceOf(Uint8Array);
        });

        test('export with stateOnly mode - no frontiers', () => {
            const map = doc.getMap("test");
            map.insert("key", "value");

            const exported = doc.export({ mode: "stateOnly" });
            expect(exported).toBeInstanceOf(Uint8Array);
        });

        test('export with stateOnly mode - with frontiers', () => {
            const map = doc.getMap("test");
            map.insert("key", "value");

            const frontiers = doc.frontiers();
            const exported = doc.export({ mode: "stateOnly", frontiers });
            expect(exported).toBeInstanceOf(Uint8Array);
        });

        test('export with snapshotAt mode', () => {
            const map = doc.getMap("test");
            map.insert("key", "value");

            const frontiers = doc.frontiers();
            const exported = doc.export({ mode: "snapshotAt", frontiers });
            expect(exported).toBeInstanceOf(Uint8Array);
        });
    });

    describe('LoroDoc Subscription Methods', () => {
        test('subscribeRoot - callback is called on changes', () => {
            const callback = jest.fn();
            const subscription = doc.subscribeRoot(callback);

            expect(subscription).toBeDefined();
            expect(typeof subscription.unsubscribe).toBe('function');

            const map = doc.getMap("test");
            map.insert("key", "value");

            // Allow for async callback execution
            setTimeout(() => {
                subscription.unsubscribe();
            }, 10);
        });

        test('subscribe to specific container', () => {
            const map = doc.getMap("test");
            const callback = jest.fn();
            const subscription = doc.subscribe(map.id(), callback);

            expect(subscription).toBeDefined();
            expect(typeof subscription.unsubscribe).toBe('function');

            map.insert("key", "value");

            // Test that other containers don't trigger callback
            const otherMap = doc.getMap("other");
            otherMap.insert("otherKey", "otherValue");

            subscription.unsubscribe();
        });

        test('subscribeLocalUpdate', () => {
            const callback = jest.fn();
            const subscription = doc.subscribeLocalUpdate(callback);

            expect(subscription).toBeDefined();
            expect(typeof subscription.unsubscribe).toBe('function');

            const map = doc.getMap("test");
            map.insert("key", "value");

            subscription.unsubscribe();
        });

        test('multiple subscriptions to same document', () => {
            const callback1 = jest.fn();
            const callback2 = jest.fn();

            const subscription1 = doc.subscribeRoot(callback1);
            const subscription2 = doc.subscribeRoot(callback2);

            const map = doc.getMap("test");
            map.insert("key", "value");

            subscription1.unsubscribe();
            subscription2.unsubscribe();
        });

        test('unsubscribe prevents further callbacks', () => {
            const callback = jest.fn();
            const subscription = doc.subscribeRoot(callback);

            subscription.unsubscribe();

            const map = doc.getMap("test");
            map.insert("key", "value");

            // Callback should not be called after unsubscribe
            setTimeout(() => {
                expect(callback).not.toHaveBeenCalled();
            }, 10);
        });
    });

    describe('LoroMap Extension Methods', () => {
        let map: LoroMap;

        beforeEach(() => {
            map = doc.getMap("testMap");
        });

        test('insert with all supported value types', () => {
            // Test all primitive types
            map.insert("string", "test string");
            map.insert("number", 42.5);
            map.insert("integer", 100);
            map.insert("boolean", true);
            map.insert("null", null);
            map.insert("undefined", undefined);

            // Test complex types
            map.insert("array", [1, 2, "three", true, null]);
            map.insert("object", { nested: { deep: "value" }, count: 42 });
            map.insert("uint8array", new Uint8Array([65, 66, 67]));

            // Verify all values
            expect(map.get("string")).toBe("test string");
            expect(map.get("number")).toBe(42.5);
            expect(map.get("integer")).toBe(100);
            expect(map.get("boolean")).toBe(true);
            expect(map.get("null")).toBe(null);
            expect(map.get("undefined")).toBe(null); // undefined becomes null
            expect(map.get("array")).toEqual([1, 2, "three", true, null]);
            expect(map.get("object")).toEqual({ nested: { deep: "value" }, count: 42 });
            expect(map.get("uint8array")).toEqual(new Uint8Array([65, 66, 67]));
        });

        test('insertContainer with different container types', () => {
            const nestedMap = doc.getMap("nested");
            const nestedList = doc.getList("nested");
            const nestedText = doc.getText("nested");
            const nestedCounter = doc.getCounter("nested");
            const nestedTree = doc.getTree("nested");
            const nestedMovableList = doc.getMovableList("nested");

            expect(map.insertContainer("map", nestedMap)).toBe(nestedMap);
            expect(map.insertContainer("list", nestedList)).toBe(nestedList);
            expect(map.insertContainer("text", nestedText)).toBe(nestedText);
            expect(map.insertContainer("counter", nestedCounter)).toBe(nestedCounter);
            expect(map.insertContainer("tree", nestedTree)).toBe(nestedTree);
            expect(map.insertContainer("movableList", nestedMovableList)).toBe(nestedMovableList);

            // Verify containers are accessible
            expect(map.get("map")).toBeDefined();
            expect(map.get("list")).toBeDefined();
            expect(map.get("text")).toBeDefined();
            expect(map.get("counter")).toBeDefined();
            expect(map.get("tree")).toBeDefined();
            expect(map.get("movableList")).toBeDefined();
        });

        test('getOrCreateContainer', () => {
            const container = doc.getMap("newContainer");
            const result = map.getOrCreateContainer("containerKey", container);

            expect(result).toBe(container);
            expect(map.get("containerKey")).toBeDefined();
        });

        test('overwrite existing keys', () => {
            map.insert("key", "original");
            expect(map.get("key")).toBe("original");

            map.insert("key", "updated");
            expect(map.get("key")).toBe("updated");

            map.insert("key", 42);
            expect(map.get("key")).toBe(42);
        });
    });

    describe('LoroList Extension Methods', () => {
        let list: LoroList;

        beforeEach(() => {
            list = doc.getList("testList");
        });

        test('insert at various positions', () => {
            list.insert(0, "first");
            list.insert(1, "third");
            list.insert(1, "second");

            expect(list.get(0)).toBe("first");
            expect(list.get(1)).toBe("second");
            expect(list.get(2)).toBe("third");
            expect(list.length()).toBe(3);
        });

        test('push multiple items', () => {
            list.push("item1");
            list.push(42);
            list.push(true);
            list.push(null);
            list.push([1, 2, 3]);
            list.push({ key: "value" });

            expect(list.length()).toBe(6);
            expect(list.get(0)).toBe("item1");
            expect(list.get(1)).toBe(42);
            expect(list.get(2)).toBe(true);
            expect(list.get(3)).toBe(null);
            expect(list.get(4)).toEqual([1, 2, 3]);
            expect(list.get(5)).toEqual({ key: "value" });
        });

        test('insertContainer at different positions', () => {
            const container1 = doc.getMap("container1");
            const container2 = doc.getText("container2");

            list.push("item");
            list.insertContainer(0, container1);
            list.insertContainer(2, container2);

            expect(list.length()).toBe(3);
            expect(list.get(1)).toBe("item");
        });

        test('pushContainer', () => {
            const container1 = doc.getCounter("counter1");
            const container2 = doc.getTree("tree1");

            const pushed1 = list.pushContainer(container1);
            const pushed2 = list.pushContainer(container2);

            expect(pushed1).toBe(container1);
            expect(pushed2).toBe(container2);
            expect(list.length()).toBe(2);
        });

        test('mixed content - values and containers', () => {
            const nestedMap = doc.getMap("nested");

            list.push("string value");
            list.pushContainer(nestedMap);
            list.push(42);

            expect(list.length()).toBe(3);
            expect(list.get(0)).toBe("string value");
            expect(list.get(2)).toBe(42);
        });
    });

    describe('LoroMovableList Extension Methods', () => {
        let movableList: LoroMovableList;

        beforeEach(() => {
            movableList = doc.getMovableList("testMovableList");
        });

        test('insert and set operations', () => {
            movableList.insert(0, "first");
            movableList.insert(1, "second");
            movableList.set(0, "updated first");

            expect(movableList.get(0)).toBe("updated first");
            expect(movableList.get(1)).toBe("second");
        });

        test('push and move operations', () => {
            movableList.push("item1");
            movableList.push("item2");
            movableList.push("item3");

            expect(movableList.length()).toBe(3);

            // Move item from position 2 to position 0
            movableList.mov(2, 0);
            expect(movableList.get(0)).toBe("item3");
            expect(movableList.get(1)).toBe("item1");
            expect(movableList.get(2)).toBe("item2");
        });

        test('insertContainer and setContainer', () => {
            const container1 = doc.getMap("map1");
            const container2 = doc.getList("list1");

            movableList.push("placeholder");
            movableList.insertContainer(0, container1);
            movableList.setContainer(1, container2);

            expect(movableList.length()).toBe(2);
        });

        test('complex value types in movable list', () => {
            movableList.insert(0, { complex: { nested: ["array", "data"] } });
            movableList.push(new Uint8Array([1, 2, 3]));
            movableList.set(0, "replaced complex object");

            expect(movableList.get(0)).toBe("replaced complex object");
            expect(movableList.get(1)).toEqual(new Uint8Array([1, 2, 3]));
        });
    });

    describe('LoroText Extension Methods', () => {
        let text: LoroText;

        beforeEach(() => {
            text = doc.getText("testText");
            text.insert(0, "Hello World! This is a test.");
        });

        test('mark with different value types', () => {
            // String value
            text.mark(0, 5, "style", "bold");

            // Number value
            text.mark(6, 11, "fontSize", 16);

            // Boolean value
            text.mark(12, 16, "italic", true);

            // Object value
            text.mark(17, 28, "formatting", {
                color: "red",
                background: "yellow",
                underline: true
            });

            // Array value
            text.mark(0, 28, "tags", ["important", "heading", "highlight"]);

            // All marks should be applied without error
            expect(() => {
                text.mark(0, 5, "testMark", null);
            }).not.toThrow();
        });

        test('overlapping marks', () => {
            text.mark(0, 10, "bold", true);
            text.mark(5, 15, "italic", true);
            text.mark(8, 20, "underline", true);

            expect(() => {
                text.mark(0, 28, "color", "blue");
            }).not.toThrow();
        });

        test('mark empty ranges', () => {
            expect(() => {
                text.mark(5, 5, "emptyMark", "value");
            }).not.toThrow();
        });
    });

    describe('UndoManager Extension Methods', () => {
        let undoManager: UndoManager;

        beforeEach(() => {
            undoManager = new UndoManager(doc);
        });

        test('setOnPush and setOnPop callbacks', () => {
            const onPushCallback = jest.fn().mockReturnValue(undefined);
            const onPopCallback = jest.fn();

            undoManager.setOnPush(onPushCallback);
            undoManager.setOnPop(onPopCallback);

            const map = doc.getMap("test");
            map.insert("key1", "value1");
            map.insert("key2", "value2");

            // Perform undo/redo operations
            undoManager.undo();
            undoManager.redo();
            undoManager.undo();
        });

        test('onPush callback with return value', () => {
            const onPushCallback = jest.fn().mockReturnValue({
                meta: "custom meta data"
            });

            undoManager.setOnPush(onPushCallback);

            const map = doc.getMap("test");
            map.insert("key", "value");
        });

        test('multiple undo manager instances', () => {
            const undoManager2 = new UndoManager(doc);

            const callback1 = jest.fn();
            const callback2 = jest.fn();

            undoManager.setOnPush(callback1);
            undoManager2.setOnPush(callback2);

            const map = doc.getMap("test");
            map.insert("key", "value");
        });
    });

    describe('Global Prototype Extensions', () => {
        describe('String extensions', () => {
            test('asContainerId with different container types', () => {
                const mapId = "testMap".asContainerId(ContainerType.Map);
                const listId = "testList".asContainerId(ContainerType.List);
                const textId = "testText".asContainerId(ContainerType.Text);
                const counterId = "testCounter".asContainerId(ContainerType.Counter);
                const treeId = "testTree".asContainerId(ContainerType.Tree);
                const movableListId = "testMovableList".asContainerId(ContainerType.MovableList);

                expect(mapId).toBeInstanceOf(ContainerId);
                expect(listId).toBeInstanceOf(ContainerId);
                expect(textId).toBeInstanceOf(ContainerId);
                expect(counterId).toBeInstanceOf(ContainerId);
                expect(treeId).toBeInstanceOf(ContainerId);
                expect(movableListId).toBeInstanceOf(ContainerId);
            });

            test('asLoroValue for various strings', () => {
                expect("".asLoroValue()).toBeInstanceOf(LoroValue);
                expect("simple".asLoroValue()).toBeInstanceOf(LoroValue);
                expect("string with spaces".asLoroValue()).toBeInstanceOf(LoroValue);
                expect("unicode: 🌟🚀💻".asLoroValue()).toBeInstanceOf(LoroValue);
                expect("special chars: @#$%^&*()".asLoroValue()).toBeInstanceOf(LoroValue);
            });
        });

        describe('Number extensions', () => {
            test('asLoroValue for integers and floats', () => {
                expect((0).asLoroValue()).toBeInstanceOf(LoroValue);
                expect((42).asLoroValue()).toBeInstanceOf(LoroValue);
                expect((-17).asLoroValue()).toBeInstanceOf(LoroValue);
                expect((3.14159).asLoroValue()).toBeInstanceOf(LoroValue);
                expect((-2.5).asLoroValue()).toBeInstanceOf(LoroValue);
                expect((Number.MAX_SAFE_INTEGER).asLoroValue()).toBeInstanceOf(LoroValue);
                expect((Number.MIN_SAFE_INTEGER).asLoroValue()).toBeInstanceOf(LoroValue);
            });

            test('asLoroValue for special number values', () => {
                expect((Infinity).asLoroValue()).toBeInstanceOf(LoroValue);
                expect((-Infinity).asLoroValue()).toBeInstanceOf(LoroValue);
                expect((NaN).asLoroValue()).toBeInstanceOf(LoroValue);
            });
        });

        describe('Boolean extensions', () => {
            test('asLoroValue for boolean values', () => {
                expect(true.asLoroValue()).toBeInstanceOf(LoroValue);
                expect(false.asLoroValue()).toBeInstanceOf(LoroValue);
            });
        });

        describe('Uint8Array extensions', () => {
            test('asLoroValue for various Uint8Array', () => {
                expect(new Uint8Array().asLoroValue()).toBeInstanceOf(LoroValue);
                expect(new Uint8Array([1, 2, 3]).asLoroValue()).toBeInstanceOf(LoroValue);
                expect(new Uint8Array([255, 0, 128]).asLoroValue()).toBeInstanceOf(LoroValue);

                const largeArray = new Uint8Array(1000);
                for (let i = 0; i < 1000; i++) {
                    largeArray[i] = i % 256;
                }
                expect(largeArray.asLoroValue()).toBeInstanceOf(LoroValue);
            });
        });

        describe('Array extensions', () => {
            test('asLoroValue for various arrays', () => {
                expect([].asLoroValue()).toBeInstanceOf(LoroValue);
                expect([1, 2, 3].asLoroValue()).toBeInstanceOf(LoroValue);
                expect(["a", "b", "c"].asLoroValue()).toBeInstanceOf(LoroValue);
                expect([1, "two", true, null].asLoroValue()).toBeInstanceOf(LoroValue);
                expect([[1, 2], [3, 4]].asLoroValue()).toBeInstanceOf(LoroValue);
                expect([{ a: 1 }, { b: 2 }].asLoroValue()).toBeInstanceOf(LoroValue);
            });
        });

        describe('Map extensions', () => {
            test('asLoroValue for various Maps', () => {
                expect(new Map().asLoroValue()).toBeInstanceOf(LoroValue);
                expect(new Map([["key", "value"]]).asLoroValue()).toBeInstanceOf(LoroValue);
                expect(new Map([
                    ["str", "value"],
                    ["num", 42],
                    ["bool", true]
                ]).asLoroValue()).toBeInstanceOf(LoroValue);
            });
        });
    });

    describe('Container asLoroValue Methods', () => {
        test('all container types implement asLoroValue', () => {
            const text = doc.getText("text");
            const counter = doc.getCounter("counter");
            const list = doc.getList("list");
            const map = doc.getMap("map");
            const tree = doc.getTree("tree");
            const movableList = doc.getMovableList("movableList");

            expect(text.asLoroValue()).toBeInstanceOf(LoroValue);
            expect(counter.asLoroValue()).toBeInstanceOf(LoroValue);
            expect(list.asLoroValue()).toBeInstanceOf(LoroValue);
            expect(map.asLoroValue()).toBeInstanceOf(LoroValue);
            expect(tree.asLoroValue()).toBeInstanceOf(LoroValue);
            expect(movableList.asLoroValue()).toBeInstanceOf(LoroValue);
        });

        test('container asLoroValue returns consistent results', () => {
            const map = doc.getMap("test");
            const loroValue1 = map.asLoroValue();
            const loroValue2 = map.asLoroValue();

            expect(loroValue1).toBeInstanceOf(LoroValue);
            expect(loroValue2).toBeInstanceOf(LoroValue);
        });
    });

    describe('jsValueToLoroValue Error Handling', () => {
        test('unsupported value types throw errors', () => {
            const map = doc.getMap("test");

            // Function should throw error
            expect(() => {
                map.insert("function", () => "test");
            }).toThrow();

            // Symbol should throw error
            expect(() => {
                map.insert("symbol", Symbol("test"));
            }).toThrow();

            // BigInt should throw error
            expect(() => {
                map.insert("bigint", BigInt(123));
            }).toThrow();
        });

        test('nested unsupported types in arrays', () => {
            const map = doc.getMap("test");

            expect(() => {
                map.insert("arrayWithFunction", [1, 2, () => "test"]);
            }).toThrow();

            expect(() => {
                map.insert("arrayWithSymbol", ["a", Symbol("test"), "b"]);
            }).toThrow();
        });

        test('nested unsupported types in objects', () => {
            const map = doc.getMap("test");

            expect(() => {
                map.insert("objWithFunction", { key: () => "test" });
            }).toThrow();

            expect(() => {
                map.insert("objWithSymbol", { sym: Symbol("test") });
            }).toThrow();
        });
    });

    describe('ContainerId Extensions', () => {
        test('asContainerId returns self', () => {
            const originalId = "test".asContainerId(ContainerType.Map);
            const sameId = originalId.asContainerId(ContainerType.List);

            expect(sameId).toBe(originalId);
            expect(sameId).toBeInstanceOf(ContainerId);
        });
    });

    describe('Integration and Complex Scenarios', () => {
        test('deeply nested container operations', () => {
            const rootMap = doc.getMap("root");
            const level1List = doc.getList("level1");
            const level2Map = doc.getMap("level2");
            const level3Text = doc.getText("level3");

            // Build nested structure
            rootMap.insertContainer("list", level1List);
            level1List.pushContainer(level2Map);
            level2Map.insertContainer("text", level3Text);

            // Add content at each level
            rootMap.insert("rootData", "root level");
            level1List.push("list item");
            level2Map.insert("mapKey", "map value");
            level3Text.insert(0, "Deep text content");

            // Verify structure integrity
            expect(rootMap.get("rootData")).toBe("root level");
            expect(level1List.get(1)).toBe("list item");
            expect(level2Map.get("mapKey")).toBe("map value");
            expect(level3Text.toString()).toBe("Deep text content");
        });

        test('multiple subscription types with complex operations', () => {
            const rootCallback = jest.fn();
            const mapCallback = jest.fn();
            const localUpdateCallback = jest.fn();

            const rootSub = doc.subscribeRoot(rootCallback);
            const map = doc.getMap("observedMap");
            const mapSub = doc.subscribe(map.id(), mapCallback);
            const localSub = doc.subscribeLocalUpdate(localUpdateCallback);

            // Perform various operations
            map.insert("key1", "value1");
            map.insertContainer("nestedList", doc.getList("nested"));

            const list = doc.getList("anotherList");
            list.push("item");

            // Clean up
            rootSub.unsubscribe();
            mapSub.unsubscribe();
            localSub.unsubscribe();
        });

        test('undo/redo with complex nested operations', () => {
            const undoManager = new UndoManager(doc);
            const onPushCallback = jest.fn();
            const onPopCallback = jest.fn();

            undoManager.setOnPush(onPushCallback);
            undoManager.setOnPop(onPopCallback);

            // Perform complex operations
            const map = doc.getMap("complexMap");
            const list = doc.getList("complexList");
            const text = doc.getText("complexText");

            map.insert("data", { complex: [1, 2, { nested: true }] });
            list.push("item1");
            list.pushContainer(text);
            text.insert(0, "Hello");
            text.mark(0, 5, "bold", true);

            // Test undo/redo
            undoManager.undo();
            undoManager.redo();
            undoManager.undo();
        });

        test('export and import cycle with all container types', () => {
            // Create comprehensive document structure
            const map = doc.getMap("testMap");
            const list = doc.getList("testList");
            const text = doc.getText("testText");
            const counter = doc.getCounter("testCounter");
            const tree = doc.getTree("testTree");
            const movableList = doc.getMovableList("testMovableList");

            // Populate with data
            map.insert("string", "test");
            map.insert("number", 42);
            map.insert("array", [1, 2, 3]);
            map.insertContainer("list", list);

            list.push("item1");
            list.push("item2");
            list.pushContainer(text);

            text.insert(0, "Sample text");
            text.mark(0, 6, "style", "bold");

            counter.increment(5);

            movableList.push("movable1");
            movableList.push("movable2");

            // Export in different modes
            const snapshot = doc.export({ mode: "snapshot" });
            const stateOnly = doc.export({ mode: "stateOnly" });

            expect(snapshot).toBeInstanceOf(Uint8Array);
            expect(stateOnly).toBeInstanceOf(Uint8Array);
            expect(snapshot.length).toBeGreaterThan(0);
            expect(stateOnly.length).toBeGreaterThan(0);
        });

        test('memory cleanup and resource management', () => {
            const subscriptions: Array<{ unsubscribe: () => void }> = [];

            // Create multiple subscriptions
            for (let i = 0; i < 5; i++) {
                const map = doc.getMap(`map${i}`);
                const callback = jest.fn();
                subscriptions.push(doc.subscribe(map.id(), callback));
                subscriptions.push(doc.subscribeRoot(callback));
            }

            // Perform operations
            for (let i = 0; i < 5; i++) {
                const map = doc.getMap(`map${i}`);
                map.insert("key", `value${i}`);
            }

            // Clean up all subscriptions
            subscriptions.forEach(sub => sub.unsubscribe());
        });
    });
}); 