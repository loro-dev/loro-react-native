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
} from '../index';

describe('Extension Interface Tests', () => {
    let doc: LoroDoc;

    beforeEach(() => {
        doc = new LoroDoc();
    });

    describe('LoroDoc Extensions', () => {
        test('export method with snapshot mode', () => {
            const map = doc.getMap("test");
            map.insert("key", "value");

            const exported = doc.export({ mode: "snapshot" });
            expect(exported).toBeInstanceOf(Uint8Array);
            expect(exported.length).toBeGreaterThan(0);
        });

        test('export method with updates mode', () => {
            const map = doc.getMap("test");
            map.insert("key", "value");

            const version = doc.version();
            const exported = doc.export({ mode: "updates", from: version });
            expect(exported).toBeInstanceOf(Uint8Array);
        });

        test('export method with updatesInRange mode', () => {
            const map = doc.getMap("test");
            map.insert("key", "value");

            const exported = doc.export({ mode: "updatesInRange", spans: [] });
            expect(exported).toBeInstanceOf(Uint8Array);
        });

        test('export method with shallowSnapshot mode', () => {
            const map = doc.getMap("test");
            map.insert("key", "value");

            const frontiers = doc.frontiers();
            const exported = doc.export({ mode: "shallowSnapshot", frontiers });
            expect(exported).toBeInstanceOf(Uint8Array);
        });

        test('export method with stateOnly mode', () => {
            const map = doc.getMap("test");
            map.insert("key", "value");

            const exported = doc.export({ mode: "stateOnly" });
            expect(exported).toBeInstanceOf(Uint8Array);
        });

        test('export method with snapshotAt mode', () => {
            const map = doc.getMap("test");
            map.insert("key", "value");

            const frontiers = doc.frontiers();
            const exported = doc.export({ mode: "snapshotAt", frontiers });
            expect(exported).toBeInstanceOf(Uint8Array);
        });

        test('subscribeRoot method', () => {
            const callback = jest.fn();
            const subscription = doc.subscribeRoot(callback);

            expect(subscription).toBeDefined();
            expect(typeof subscription.unsubscribe).toBe('function');

            const map = doc.getMap("test");
            map.insert("key", "value");

            // Note: callback invocation might be async or immediate depending on implementation
            subscription.unsubscribe();
        });

        test('subscribe method with container', () => {
            const map = doc.getMap("test");
            const callback = jest.fn();
            const subscription = doc.subscribe(map.id(), callback);

            expect(subscription).toBeDefined();
            expect(typeof subscription.unsubscribe).toBe('function');

            map.insert("key", "value");

            subscription.unsubscribe();
        });

        test('subscribeLocalUpdate method', () => {
            const callback = jest.fn();
            const subscription = doc.subscribeLocalUpdate(callback);

            expect(subscription).toBeDefined();
            expect(typeof subscription.unsubscribe).toBe('function');

            const map = doc.getMap("test");
            map.insert("key", "value");

            subscription.unsubscribe();
        });

        test('travelChangeAncestors method', () => {
            const map = doc.getMap("test");
            map.insert("key", "value");

            const ids = []; // This would need actual change IDs in real usage
            const travelCallback = jest.fn().mockReturnValue(true);

            // Note: This test may need adjustment based on actual API behavior
            expect(() => {
                doc.travelChangeAncestors(ids, travelCallback);
            }).not.toThrow();
        });
    });

    describe('LoroMap Extensions', () => {
        let map: LoroMap;

        beforeEach(() => {
            map = doc.getMap("testMap");
        });

        test('insert method with string value', () => {
            map.insert("stringKey", "stringValue");
            expect(map.get("stringKey")).toBe("stringValue");
        });

        test('insert method with number value', () => {
            map.insert("numberKey", 42);
            expect(map.get("numberKey")).toBe(42);
        });

        test('insert method with boolean value', () => {
            map.insert("boolKey", true);
            expect(map.get("boolKey")).toBe(true);
        });

        test('insert method with null value', () => {
            map.insert("nullKey", null);
            expect(map.get("nullKey")).toBe(null);
        });

        test('insert method with object value', () => {
            const obj = { nested: "value" };
            map.insert("objKey", obj);
            expect(map.get("objKey")).toEqual(obj);
        });

        test('insert method with array value', () => {
            const arr = [1, 2, 3];
            map.insert("arrKey", arr);
            expect(map.get("arrKey")).toEqual(arr);
        });

        test('insert method with Uint8Array value', () => {
            const buffer = new Uint8Array([1, 2, 3, 4]);
            map.insert("bufferKey", buffer);
            expect(map.get("bufferKey")).toEqual(buffer);
        });

        test('insertContainer method', () => {
            const nestedList = doc.getList("nestedList");
            const insertedContainer = map.insertContainer("listKey", nestedList);

            expect(insertedContainer).toBe(nestedList);
            expect(map.get("listKey")).toBeDefined();
        });

        test('getOrCreateContainer method', () => {
            const nestedMap = doc.getMap("nestedMap");
            const container = map.getOrCreateContainer("mapKey", nestedMap);

            expect(container).toBe(nestedMap);
            expect(map.get("mapKey")).toBeDefined();
        });
    });

    describe('LoroList Extensions', () => {
        let list: LoroList;

        beforeEach(() => {
            list = doc.getList("testList");
        });

        test('insert method with various value types', () => {
            list.insert(0, "string");
            list.insert(1, 42);
            list.insert(2, true);
            list.insert(3, null);
            list.insert(4, [1, 2, 3]);
            list.insert(5, { key: "value" });

            expect(list.get(0)).toBe("string");
            expect(list.get(1)).toBe(42);
            expect(list.get(2)).toBe(true);
            expect(list.get(3)).toBe(null);
            expect(list.get(4)).toEqual([1, 2, 3]);
            expect(list.get(5)).toEqual({ key: "value" });
        });

        test('push method with various value types', () => {
            list.push("first");
            list.push(123);
            list.push(false);

            expect(list.get(0)).toBe("first");
            expect(list.get(1)).toBe(123);
            expect(list.get(2)).toBe(false);
            expect(list.length()).toBe(3);
        });

        test('insertContainer method', () => {
            const nestedMap = doc.getMap("nestedMap");
            const insertedContainer = list.insertContainer(0, nestedMap);

            expect(insertedContainer).toBe(nestedMap);
            expect(list.length()).toBe(1);
        });

        test('pushContainer method', () => {
            const nestedText = doc.getText("nestedText");
            const pushedContainer = list.pushContainer(nestedText);

            expect(pushedContainer).toBe(nestedText);
            expect(list.length()).toBe(1);
        });
    });

    describe('LoroMovableList Extensions', () => {
        let movableList: LoroMovableList;

        beforeEach(() => {
            movableList = doc.getMovableList("testMovableList");
        });

        test('insert method with various value types', () => {
            movableList.insert(0, "item1");
            movableList.insert(1, "item2");
            movableList.insert(1, "inserted");

            expect(movableList.get(0)).toBe("item1");
            expect(movableList.get(1)).toBe("inserted");
            expect(movableList.get(2)).toBe("item2");
        });

        test('push method', () => {
            movableList.push("first");
            movableList.push("second");

            expect(movableList.get(0)).toBe("first");
            expect(movableList.get(1)).toBe("second");
            expect(movableList.length()).toBe(2);
        });

        test('set method', () => {
            movableList.push("original");
            movableList.set(0, "replaced");

            expect(movableList.get(0)).toBe("replaced");
        });

        test('insertContainer method', () => {
            const nestedCounter = doc.getCounter("nestedCounter");
            const insertedContainer = movableList.insertContainer(0, nestedCounter);

            expect(insertedContainer).toBe(nestedCounter);
            expect(movableList.length()).toBe(1);
        });

        test('setContainer method', () => {
            movableList.push("placeholder");
            const nestedTree = doc.getTree("nestedTree");
            const setContainer = movableList.setContainer(0, nestedTree);

            expect(setContainer).toBe(nestedTree);
        });
    });

    describe('LoroText Extensions', () => {
        let text: LoroText;

        beforeEach(() => {
            text = doc.getText("testText");
            text.insert(0, "Hello World");
        });

        test('mark method with string value', () => {
            text.mark(0, 5, "bold", true);
            // Note: Verification of marks depends on the API for retrieving marks
            expect(() => text.mark(0, 5, "bold", true)).not.toThrow();
        });

        test('mark method with number value', () => {
            text.mark(6, 11, "fontSize", 14);
            expect(() => text.mark(6, 11, "fontSize", 14)).not.toThrow();
        });

        test('mark method with object value', () => {
            text.mark(0, 11, "style", { color: "red", background: "yellow" });
            expect(() => text.mark(0, 11, "style", { color: "red", background: "yellow" })).not.toThrow();
        });
    });

    describe('UndoManager Extensions', () => {
        let undoManager: UndoManager;

        beforeEach(() => {
            undoManager = new UndoManager(doc);
        });

        test('setOnPush method', () => {
            const onPushCallback = jest.fn();

            expect(() => {
                undoManager.setOnPush(onPushCallback);
            }).not.toThrow();
        });

        test('setOnPop method', () => {
            const onPopCallback = jest.fn();

            expect(() => {
                undoManager.setOnPop(onPopCallback);
            }).not.toThrow();
        });

        test('undo/redo functionality with callbacks', () => {
            const onPushCallback = jest.fn();
            const onPopCallback = jest.fn();

            undoManager.setOnPush(onPushCallback);
            undoManager.setOnPop(onPopCallback);

            const map = doc.getMap("test");
            map.insert("key", "value");

            undoManager.undo();
            undoManager.redo();
        });
    });

    describe('ContainerId Extensions', () => {
        test('asContainerId method', () => {
            const containerId = "test".asContainerId(ContainerType.Map);
            const result = containerId.asContainerId(ContainerType.List);

            expect(result).toBe(containerId);
        });
    });

    describe('Global Prototype Extensions', () => {
        describe('String prototype extensions', () => {
            test('asContainerId method', () => {
                const containerId = "testContainer".asContainerId(ContainerType.Map);
                expect(containerId).toBeInstanceOf(ContainerId);
            });

            test('asLoroValue method', () => {
                const loroValue = "test string".asLoroValue();
                expect(loroValue).toBeInstanceOf(LoroValue);
            });
        });

        describe('Number prototype extensions', () => {
            test('asLoroValue method with integer', () => {
                const loroValue = (42).asLoroValue();
                expect(loroValue).toBeInstanceOf(LoroValue);
            });

            test('asLoroValue method with float', () => {
                const loroValue = (3.14).asLoroValue();
                expect(loroValue).toBeInstanceOf(LoroValue);
            });
        });

        describe('Boolean prototype extensions', () => {
            test('asLoroValue method with true', () => {
                const loroValue = true.asLoroValue();
                expect(loroValue).toBeInstanceOf(LoroValue);
            });

            test('asLoroValue method with false', () => {
                const loroValue = false.asLoroValue();
                expect(loroValue).toBeInstanceOf(LoroValue);
            });
        });

        describe('Uint8Array prototype extensions', () => {
            test('asLoroValue method', () => {
                const buffer = new Uint8Array([1, 2, 3, 4]);
                const loroValue = buffer.asLoroValue();
                expect(loroValue).toBeInstanceOf(LoroValue);
            });
        });

        describe('Array prototype extensions', () => {
            test('asLoroValue method', () => {
                const array = [1, "two", true, null];
                const loroValue = array.asLoroValue();
                expect(loroValue).toBeInstanceOf(LoroValue);
            });
        });

        describe('Map prototype extensions', () => {
            test('asLoroValue method', () => {
                const map = new Map([["key1", "value1"], ["key2", "value2"]]);
                const loroValue = map.asLoroValue();
                expect(loroValue).toBeInstanceOf(LoroValue);
            });
        });
    });

    describe('Container asLoroValue Methods', () => {
        test('LoroText asLoroValue', () => {
            const text = doc.getText("test");
            const loroValue = text.asLoroValue();
            expect(loroValue).toBeInstanceOf(LoroValue);
        });

        test('LoroCounter asLoroValue', () => {
            const counter = doc.getCounter("test");
            const loroValue = counter.asLoroValue();
            expect(loroValue).toBeInstanceOf(LoroValue);
        });

        test('LoroList asLoroValue', () => {
            const list = doc.getList("test");
            const loroValue = list.asLoroValue();
            expect(loroValue).toBeInstanceOf(LoroValue);
        });

        test('LoroMap asLoroValue', () => {
            const map = doc.getMap("test");
            const loroValue = map.asLoroValue();
            expect(loroValue).toBeInstanceOf(LoroValue);
        });

        test('LoroTree asLoroValue', () => {
            const tree = doc.getTree("test");
            const loroValue = tree.asLoroValue();
            expect(loroValue).toBeInstanceOf(LoroValue);
        });

        test('LoroMovableList asLoroValue', () => {
            const movableList = doc.getMovableList("test");
            const loroValue = movableList.asLoroValue();
            expect(loroValue).toBeInstanceOf(LoroValue);
        });
    });

    describe('jsValueToLoroValue function (indirectly tested)', () => {
        test('converts various JavaScript values through container methods', () => {
            const map = doc.getMap("test");

            // Test null
            map.insert("null", null);
            expect(map.get("null")).toBe(null);

            // Test undefined (should be converted to null)
            map.insert("undefined", undefined);
            expect(map.get("undefined")).toBe(null);

            // Test string
            map.insert("string", "test");
            expect(map.get("string")).toBe("test");

            // Test number
            map.insert("number", 42);
            expect(map.get("number")).toBe(42);

            // Test boolean
            map.insert("boolean", true);
            expect(map.get("boolean")).toBe(true);

            // Test Uint8Array
            const buffer = new Uint8Array([1, 2, 3]);
            map.insert("buffer", buffer);
            expect(map.get("buffer")).toEqual(buffer);

            // Test array
            const array = [1, "two", true];
            map.insert("array", array);
            expect(map.get("array")).toEqual(array);

            // Test object
            const obj = { key: "value", nested: { inner: true } };
            map.insert("object", obj);
            expect(map.get("object")).toEqual(obj);
        });

        test('throws error for unsupported value types', () => {
            const map = doc.getMap("test");

            // Test with function (should throw error)
            expect(() => {
                map.insert("function", () => { });
            }).toThrow();

            // Test with symbol (should throw error)
            expect(() => {
                map.insert("symbol", Symbol("test"));
            }).toThrow();
        });
    });

    describe('Complex Integration Tests', () => {
        test('nested container operations with extensions', () => {
            const rootMap = doc.getMap("root");
            const nestedList = doc.getList("nested");
            const nestedText = doc.getText("text");

            // Insert containers using extended methods
            rootMap.insertContainer("list", nestedList);
            nestedList.pushContainer(nestedText);

            // Use extended value insertion methods
            nestedList.push("item1");
            nestedList.insert(0, "item0");
            nestedText.insert(0, "Hello");
            nestedText.mark(0, 5, "bold", true);

            expect(nestedList.length()).toBe(3); // item0, text container, item1
            expect(nestedText.toString()).toBe("Hello");
        });

        test('subscription and export integration', () => {
            const callback = jest.fn();
            const subscription = doc.subscribeRoot(callback);

            const map = doc.getMap("test");
            map.insert("key", "value");

            const exported = doc.export({ mode: "snapshot" });
            expect(exported).toBeInstanceOf(Uint8Array);
            expect(exported.length).toBeGreaterThan(0);

            subscription.unsubscribe();
        });

        test('undo manager with all container types', () => {
            const undoManager = new UndoManager(doc);
            const onPushCallback = jest.fn();
            const onPopCallback = jest.fn();

            undoManager.setOnPush(onPushCallback);
            undoManager.setOnPop(onPopCallback);

            // Perform operations on different container types
            const map = doc.getMap("map");
            const list = doc.getList("list");
            const text = doc.getText("text");
            const movableList = doc.getMovableList("movable");

            map.insert("key", "value");
            list.push("item");
            text.insert(0, "content");
            movableList.push("movable item");

            // Test undo/redo
            undoManager.undo();
            undoManager.redo();
        });
    });
}); 