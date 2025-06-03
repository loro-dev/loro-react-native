import { LoroCounter, LoroList, LoroMap, LoroText, LoroTree, LoroMovableList, ContainerId, ContainerType, Frontiers, IdSpan, LoroDoc, VersionVector, UndoManager, LoroValue } from './generated/loro';
import Object from './generated/loro';

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
        export(mode: ExportMode): Uint8Array;
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

    interface ContainerId {
        asContainerId(ty: ContainerType): ContainerId;
    }
}

declare global {
    interface String {
        asContainerId(ty: ContainerType): ContainerId;
        asLoroValue(): LoroValue;
    }

    interface Number {
        asLoroValue(): LoroValue;
    }

    interface Boolean {
        asLoroValue(): LoroValue;
    }

    interface Uint8Array {
        asLoroValue(): LoroValue;
    }

    interface Array<T extends Value> {
        asLoroValue(): LoroValue;
    }

    interface Object<T extends Record<string, Value>> {
        asLoroValue(): LoroValue;
    }
}

export interface Container {
    id: () => ContainerId,
    asLoroValue: () => LoroValue
}

String.prototype.asContainerId = function (ty: ContainerType): ContainerId {
    return new ContainerId.Root({
        name: this as string,
        containerType: ty,
    });
};

String.prototype.asLoroValue = function (): LoroValue {
    return new LoroValue.String({
        value: this as string,
    })
};

Number.prototype.asLoroValue = function (): LoroValue {
    if (Number.isInteger(this as number)) {
        return new LoroValue.I64({ value: this as number });
    }
    return new LoroValue.Double({ value: this as number });
};

Boolean.prototype.asLoroValue = function (): LoroValue {
    return new LoroValue.Bool({ value: this as boolean });
};

Uint8Array.prototype.asLoroValue = function (): LoroValue {
    return new LoroValue.Binary({ value: this as Uint8Array });
};

Array.prototype.asLoroValue = function (): LoroValue {
    return new LoroValue.List({ value: this as LoroValue[] });
};

Map.prototype.asLoroValue = function (): LoroValue {
    return new LoroValue.Map({ value: this as Map<string, LoroValue> });
};

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

LoroDoc.prototype.export = function (mode: ExportMode): Uint8Array {
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

const originalTravelChangeAncestors = LoroDoc.prototype.travelChangeAncestors;

LoroDoc.prototype.travelChangeAncestors = function (
    ids: Array<Id>,
    travel: (change: ChangeMeta) => boolean
): void {
    return originalTravelChangeAncestors.call(this, ids, {
        travel
    });
};

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

const originalInsertContainer = LoroMap.prototype.insertContainer;
LoroMap.prototype.insertContainer = function <T extends Container>(key: string, container: T): T {
    return originalInsertContainer.call(this, key, container.asLoroValue());
}

const originalGetOrCreateContainer = LoroMap.prototype.getOrCreateContainer;
LoroMap.prototype.getOrCreateContainer = function <T extends Container>(key: string, container: T): T {
    return originalGetOrCreateContainer.call(this, key, container.asLoroValue());
}

const originalPush = LoroList.prototype.push;
LoroList.prototype.push = function (value: Value): void {
    return originalPush.call(this, jsValueToLoroValue(value));
}

const originalListInsert = LoroList.prototype.insert;
LoroList.prototype.insert = function (pos: number, value: Value): void {
    return originalListInsert.call(this, pos, jsValueToLoroValue(value));
}

const originalListInsertContainer = LoroList.prototype.insertContainer;
LoroList.prototype.insertContainer = function <T extends Container>(pos: number, container: T): T {
    return originalListInsertContainer.call(this, pos, container.asLoroValue());
}

const originalPushContainer = LoroList.prototype.pushContainer;
LoroList.prototype.pushContainer = function <T extends Container>(container: T): T {
    return originalPushContainer.call(this, container.asLoroValue());
}

const originalMovableListInsert = LoroMovableList.prototype.insert;
LoroMovableList.prototype.insert = function (pos: number, value: Value): void {
    return originalMovableListInsert.call(this, pos, jsValueToLoroValue(value));
}

const originalMovableListSet = LoroMovableList.prototype.set;
LoroMovableList.prototype.set = function (pos: number, value: Value): void {
    return originalMovableListSet.call(this, pos, jsValueToLoroValue(value));
}

const originalMovableListPush = LoroMovableList.prototype.push;
LoroMovableList.prototype.push = function (value: Value): void {
    return originalMovableListPush.call(this, jsValueToLoroValue(value));
}

const originalMovableListInsertContainer = LoroMovableList.prototype.insertContainer;
LoroMovableList.prototype.insertContainer = function <T extends Container>(pos: number, container: T): T {
    return originalMovableListInsertContainer.call(this, pos, container.asLoroValue());
}

const originalMovableListSetContainer = LoroMovableList.prototype.setContainer;
LoroMovableList.prototype.setContainer = function <T extends Container>(pos: number, container: T): T {
    return originalMovableListSetContainer.call(this, pos, container.asLoroValue());
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

const jsValueToLoroValue = (value?: Value): LoroValue => {
    if (!value) {
        return new LoroValue.Null({});
    }
    if (typeof value === 'string') {
        return value.asLoroValue();
    }
    if (typeof value === 'number') {
        return value.asLoroValue();
    }
    if (typeof value === 'boolean') {
        return value.asLoroValue();
    }
    if (value instanceof Uint8Array) {
        return value.asLoroValue();
    }
    if (Array.isArray(value)) {
        return value.asLoroValue();
    }
    if (value instanceof Object) {
        return value.asLoroValue();
    }
    throw new Error('Unsupported value type');
}