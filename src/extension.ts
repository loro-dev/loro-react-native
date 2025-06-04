import {
    Id, LoroCounter, LoroList, LoroMap, LoroText, LoroTree,
    LoroMovableList, ContainerId, ContainerType, Frontiers, IdSpan,
    LoroDoc, VersionVector, UndoManager, LoroValue, UndoOrRedo,
    CounterSpan, UndoItemMeta, DiffEvent
} from './generated/loro';

import type { ChangeAncestorsTraveler, ChangeMeta } from './generated/loro';

export type Value =
    | ContainerId
    | string
    | number
    | boolean
    | null
    | { [key: string]: Value }
    | Uint8Array
    | Value[]
    | undefined;

// Extend the LoroDoc interface
declare module "./generated/loro" {
    interface LoroDoc {
        export(mode: ExportMode): ArrayBuffer;
        getText(id: ContainerId | string): LoroText;
        getCounter(id: ContainerId | string): LoroCounter;
        getList(id: ContainerId | string): LoroList;
        getMap(id: ContainerId | string): LoroMap;
        getTree(id: ContainerId | string): LoroTree;
        getMovableList(id: ContainerId | string): LoroMovableList;
        travelChangeAncestors(ids: Array<Id>, travel: (change: ChangeMeta) => boolean): void;
        subscribeRoot(cb: (diff: DiffEvent) => void): SubscriptionInterface;
        subscribe(containerId: ContainerId, cb: (diff: DiffEvent) => void): SubscriptionInterface;
        subscribeLocalUpdate(cb: (update: ArrayBuffer) => void): SubscriptionInterface;
    }

    interface LoroMap {
        insert(key: string, value: Value): void;
        insertContainer<T extends Container>(key: string, container: T): T;
        getOrCreateContainer<T extends Container>(key: string, container: T): T;
    }

    interface LoroList {
        insert(pos: number, value: Value): void;
        push(value: Value): void;
        pushContainer<T extends Container>(container: T): T;
        insertContainer<T extends Container>(pos: number, container: T): T;
    }

    interface LoroMovableList {
        insert(pos: number, value: Value): void;
        push(value: Value): void;
        set(pos: number, value: Value): void;
        insertContainer<T extends Container>(pos: number, container: T): T;
        setContainer<T extends Container>(pos: number, container: T): T;
    }

    interface LoroText {
        mark(from: number, to: number, key: string, value: Value): void;
    }

    interface UndoManager {
        setOnPop(onPop: (
            undoOrRedo: UndoOrRedo,
            span: CounterSpan,
            undoMeta: UndoItemMeta
        ) => void | undefined): void;
        setOnPush(onPush: (
            undoOrRedo: UndoOrRedo,
            span: CounterSpan,
            diffEvent: DiffEvent | undefined
        ) => UndoItemMeta | undefined): void;
    }

}

export type Container = LoroText | LoroCounter | LoroList | LoroMap | LoroTree | LoroMovableList;

ContainerId.Root.prototype.asContainerId = function (_ty: ContainerType): ContainerId {
    return this;
};

ContainerId.Normal.prototype.asContainerId = function (_ty: ContainerType): ContainerId {
    return this;
};


export type ExportMode = {
    mode: "snapshot"
} | {
    mode: "updates",
    from: VersionVector
} | {
    mode: "updatesInRange",
    spans: IdSpan[]
} | {
    mode: "shallowSnapshot",
    frontiers: Frontiers
} | {
    mode: "stateOnly",
    frontiers?: Frontiers
} | {
    mode: "snapshotAt",
    frontiers: Frontiers,
}

LoroDoc.prototype.export = function (mode: ExportMode): ArrayBuffer {
    switch (mode.mode) {
        case "snapshot":
            return this.exportSnapshot();
        case "updates":
            return this.exportUpdates(mode.from);
        case "updatesInRange":
            return this.exportUpdatesInRange(mode.spans);
        case "shallowSnapshot":
            return this.exportShallowSnapshot(mode.frontiers);
        case "stateOnly":
            return this.exportStateOnly(mode.frontiers);
        case "snapshotAt":
            return this.exportSnapshotAt(mode.frontiers);
    }
}

const originalGetText = LoroDoc.prototype.getText;
LoroDoc.prototype.getText = function (id: ContainerId | string): LoroText {
    if (typeof id === 'string') {
        id = new ContainerId.Root({
            name: id,
            containerType: new ContainerType.Text(),
        });
    }
    return originalGetText.call(this, id);
}
const originalGetCounter = LoroDoc.prototype.getCounter;
LoroDoc.prototype.getCounter = function (id: ContainerId | string): LoroCounter {
    if (typeof id === 'string') {
        id = new ContainerId.Root({
            name: id,
            containerType: new ContainerType.Counter(),
        });
    }
    return originalGetCounter.call(this, id);
}

const originalGetList = LoroDoc.prototype.getList;
LoroDoc.prototype.getList = function (id: ContainerId | string): LoroList {
    if (typeof id === 'string') {
        id = new ContainerId.Root({
            name: id,
            containerType: new ContainerType.List(),
        });
    }
    return originalGetList.call(this, id);
}

const originalGetMap = LoroDoc.prototype.getMap;
LoroDoc.prototype.getMap = function (id: ContainerId | string): LoroMap {
    if (typeof id === 'string') {
        id = new ContainerId.Root({
            name: id,
            containerType: new ContainerType.Map(),
        });
    }
    return originalGetMap.call(this, id);
}

const originalGetTree = LoroDoc.prototype.getTree;
LoroDoc.prototype.getTree = function (id: ContainerId | string): LoroTree {
    if (typeof id === 'string') {
        id = new ContainerId.Root({
            name: id,
            containerType: new ContainerType.Tree(),
        });
    }
    return originalGetTree.call(this, id);
}

const originalGetMovableList = LoroDoc.prototype.getMovableList;
LoroDoc.prototype.getMovableList = function (id: ContainerId | string): LoroMovableList {
    if (typeof id === 'string') {
        id = new ContainerId.Root({
            name: id,
            containerType: new ContainerType.MovableList(),
        });
    }
    return originalGetMovableList.call(this, id);
}


const originalTravelChangeAncestors = LoroDoc.prototype.travelChangeAncestors;
LoroDoc.prototype.travelChangeAncestors = function (
    this: LoroDoc,
    ids: Id[],
    travel: (change: ChangeMeta) => boolean
): void {
    const traveler: ChangeAncestorsTraveler = {
        travel: travel
    };
    return originalTravelChangeAncestors.call(this, ids, traveler);
} as any;

const originalSubscribeRoot = LoroDoc.prototype.subscribeRoot;
LoroDoc.prototype.subscribeRoot = function (cb: (diff: DiffEvent) => void): SubscriptionInterface {
    return originalSubscribeRoot.call(this, { onDiff: cb })
}

const originalSubscribe = LoroDoc.prototype.subscribe;
LoroDoc.prototype.subscribe = function (containerId: ContainerId, cb: (diff: DiffEvent) => void): SubscriptionInterface {
    return originalSubscribe.call(this, containerId, { onDiff: cb })
}

const originalSubscribeLocalUpdate = LoroDoc.prototype.subscribeLocalUpdate;
LoroDoc.prototype.subscribeLocalUpdate = function (cb: (update: ArrayBuffer) => void): SubscriptionInterface {
    return originalSubscribeLocalUpdate.call(this, { onLocalUpdate: cb })
}

// ############# Container
function addAsLoroValueMethod<T extends { id(): ContainerId }>(prototype: T): void {
    (prototype as any).asLoroValue = function (): LoroValue {
        return new LoroValue.Container({
            value: this.id()
        });
    };
}

addAsLoroValueMethod(LoroText.prototype);
addAsLoroValueMethod(LoroCounter.prototype);
addAsLoroValueMethod(LoroList.prototype);
addAsLoroValueMethod(LoroMap.prototype);
addAsLoroValueMethod(LoroTree.prototype);
addAsLoroValueMethod(LoroMovableList.prototype);

const originalInsert = LoroMap.prototype.insert;
LoroMap.prototype.insert = function (key: string, value: Value): void {
    return originalInsert.call(this, key, jsValueToLoroValue(value));
}


LoroMap.prototype.insertContainer = function <T extends Container>(key: string, container: T): T {
    if (container instanceof LoroText) {
        return this.insertTextContainer(key, container) as LoroText;
    } else if (container instanceof LoroCounter) {
        return this.insertCounterContainer(key, container) as LoroCounter;
    } else if (container instanceof LoroList) {
        return this.insertListContainer(key, container) as LoroList;
    } else if (container instanceof LoroMap) {
        return this.insertMapContainer(key, container) as LoroMap;
    } else if (container instanceof LoroTree) {
        return this.insertTreeContainer(key, container) as LoroTree;
    } else if (container instanceof LoroMovableList) {
        return this.insertMovableListContainer(key, container) as LoroMovableList;
    } else {
        throw new Error('Unsupported container type');
    }
}

LoroMap.prototype.getOrCreateContainer = function <T extends Container>(key: string, container: T): T {
    if (container instanceof LoroText) {
        return this.getOrCreateText(key) as LoroText;
    } else if (container instanceof LoroCounter) {
        return this.getOrCreateCounter(key) as LoroCounter;
    } else if (container instanceof LoroList) {
        return this.getOrCreateList(key) as LoroList;
    } else if (container instanceof LoroMap) {
        return this.getOrCreateMap(key) as LoroMap;
    } else if (container instanceof LoroTree) {
        return this.getOrCreateTree(key) as LoroTree;
    } else if (container instanceof LoroMovableList) {
        return this.getOrCreateMovableList(key) as LoroMovableList;
    } else {
        throw new Error('Unsupported container type');
    }
}

const originalListInsert = LoroList.prototype.insert;
LoroList.prototype.insert = function (pos: number, value: Value): void {
    return originalListInsert.call(this, pos, jsValueToLoroValue(value));
}

LoroList.prototype.push = function (value: Value): void {
    const pos = this.length();
    return this.insert(pos, value);
}

LoroList.prototype.insertContainer = function <T extends Container>(pos: number, container: T): T {
    if (container instanceof LoroText) {
        return this.insertTextContainer(pos, container) as LoroText;
    } else if (container instanceof LoroCounter) {
        return this.insertCounterContainer(pos, container) as LoroCounter;
    } else if (container instanceof LoroList) {
        return this.insertListContainer(pos, container) as LoroList;
    } else if (container instanceof LoroMap) {
        return this.insertMapContainer(pos, container) as LoroMap;
    } else if (container instanceof LoroTree) {
        return this.insertTreeContainer(pos, container) as LoroTree;
    } else if (container instanceof LoroMovableList) {
        return this.insertMovableListContainer(pos, container) as LoroMovableList;
    } else {
        throw new Error('Unsupported container type');
    }
}

LoroList.prototype.pushContainer = function <T extends Container>(container: T): T {
    const length = this.length();
    return this.insertContainer(length, container);
}

const originalMovableListInsert = LoroMovableList.prototype.insert;
LoroMovableList.prototype.insert = function (pos: number, value: Value): void {
    return originalMovableListInsert.call(this, pos, jsValueToLoroValue(value));
}

const originalMovableListSet = LoroMovableList.prototype.set;
LoroMovableList.prototype.set = function (pos: number, value: Value): void {
    return originalMovableListSet.call(this, pos, jsValueToLoroValue(value));
}

LoroMovableList.prototype.push = function (value: Value): void {
    const length = this.length();
    return this.insert(length, value);
}

LoroMovableList.prototype.insertContainer = function <T extends Container>(pos: number, container: T): T {
    if (container instanceof LoroText) {
        return this.insertTextContainer(pos, container) as LoroText;
    } else if (container instanceof LoroCounter) {
        return this.insertCounterContainer(pos, container) as LoroCounter;
    } else if (container instanceof LoroList) {
        return this.insertListContainer(pos, container) as LoroList;
    } else if (container instanceof LoroMap) {
        return this.insertMapContainer(pos, container) as LoroMap;
    } else if (container instanceof LoroTree) {
        return this.insertTreeContainer(pos, container) as LoroTree;
    } else if (container instanceof LoroMovableList) {
        return this.insertMovableListContainer(pos, container) as LoroMovableList;
    } else {
        throw new Error('Unsupported container type');
    }
}

LoroMovableList.prototype.setContainer = function <T extends Container>(pos: number, container: T): T {
    if (container instanceof LoroText) {
        return this.setTextContainer(pos, container) as LoroText;
    } else if (container instanceof LoroCounter) {
        return this.setCounterContainer(pos, container) as LoroCounter;
    } else if (container instanceof LoroList) {
        return this.setListContainer(pos, container) as LoroList;
    } else if (container instanceof LoroMap) {
        return this.setMapContainer(pos, container) as LoroMap;
    } else if (container instanceof LoroTree) {
        return this.setTreeContainer(pos, container) as LoroTree;
    } else if (container instanceof LoroMovableList) {
        return this.setMovableListContainer(pos, container) as LoroMovableList;
    } else {
        throw new Error('Unsupported container type');
    }
}

const originalTextMark = LoroText.prototype.mark;
LoroText.prototype.mark = function (from: number, to: number, key: string, value: Value): void {
    return originalTextMark.call(this, from, to, key, jsValueToLoroValue(value));
}

// ############# UndoManager

const originalSetOnPush = UndoManager.prototype.setOnPush;
UndoManager.prototype.setOnPush = function (onPush: (
    undoOrRedo: UndoOrRedo,
    span: CounterSpan,
    diffEvent: DiffEvent | undefined
) => UndoItemMeta | undefined): void {
    return originalSetOnPush.call(this, { onPush })
}
const originalSetOnPop = UndoManager.prototype.setOnPop;
UndoManager.prototype.setOnPop = function (onPop: (
    undoOrRedo: UndoOrRedo,
    span: CounterSpan,
    undoMeta: UndoItemMeta
) => void | undefined): void {
    return originalSetOnPop.call(this, { onPop })
}

// Add asLoroValue method to all LoroValue variants
function addAsLoroValueMethodForLoroValue(prototype: any) {
    prototype.asLoroValue = function (): LoroValue {
        return this;
    }
}

addAsLoroValueMethodForLoroValue(LoroValue.Bool.prototype);
addAsLoroValueMethodForLoroValue(LoroValue.I64.prototype);
addAsLoroValueMethodForLoroValue(LoroValue.Double.prototype);
addAsLoroValueMethodForLoroValue(LoroValue.String.prototype);
addAsLoroValueMethodForLoroValue(LoroValue.Binary.prototype);
addAsLoroValueMethodForLoroValue(LoroValue.List.prototype);
addAsLoroValueMethodForLoroValue(LoroValue.Map.prototype);
addAsLoroValueMethodForLoroValue(LoroValue.Container.prototype);
addAsLoroValueMethodForLoroValue(LoroValue.Null.prototype);


const jsValueToLoroValue = (value?: Value): LoroValue => {
    if (!value) {
        return new LoroValue.Null();
    }
    if (value instanceof ContainerId.Root || value instanceof ContainerId.Normal) {
        return new LoroValue.Container({
            value: value
        });
    }

    if (typeof value === 'string') {
        return new LoroValue.String({ value: value });
    }
    if (typeof value === 'number') {
        if (Number.isInteger(value)) {
            return new LoroValue.I64({ value: BigInt(value) });
        }
        return new LoroValue.Double({ value: value as unknown as number });
    }
    if (typeof value === 'boolean') {
        return new LoroValue.Bool({ value: value });
    }
    if (value instanceof Uint8Array) {
        return new LoroValue.Binary({ value: value as unknown as ArrayBuffer });
    }
    if (Array.isArray(value)) {
        return new LoroValue.List({ value: value.map(jsValueToLoroValue) as LoroValue[] });
    }
    if (value instanceof Object) {
        return new LoroValue.Map({ value: new Map(Object.entries(value).map(([key, value]) => [key, jsValueToLoroValue(value)])) });
    }
    throw new Error('Unsupported value type');
}

export const loroValueToJsValue = (value: LoroValue): Value => {
    if (value instanceof LoroValue.Null) {
        return null;
    }
    if (value instanceof LoroValue.I64) {
        return Number(value.inner.value);
    }
    if (value instanceof LoroValue.List) {
        return value.inner.value.map(loroValueToJsValue);
    }
    if (value instanceof LoroValue.Map) {
        const map = new Map<string, Value>();
        for (const key of Object.keys(value.inner.value)) {
            map.set(key, loroValueToJsValue(value.inner.value[key]));
        }
        return map;
    }
    return value.inner.value;
}