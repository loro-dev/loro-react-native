import { ContainerId, ContainerType, Frontiers, IdSpan, LoroDoc, VersionVector, UndoManager } from './generated/loro';
import { ContainerId } from '../lib/typescript/src/generated/loro';

// Extend the LoroDoc interface
declare module "./generated/loro" {
    interface LoroDoc {
        export(mode: ExportMode): Uint8Array;
        travelChangeAncestors(ids: Array<Id>, travel: (change: ChangeMeta) => boolean): void;
        subscribeRoot(cb: (diff: DiffEvent) => void): SubscriptionInterface;
        subscribe(containerId: ContainerId, cb: (diff: DiffEvent) => void): SubscriptionInterface;
        subscribeLocalUpdate(cb: (update: ArrayBuffer) => void): SubscriptionInterface;
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
    }
}

String.prototype.asContainerId = function (ty: ContainerType): ContainerId {
    return new ContainerId.Root({
        name: this as string,
        containerType: ty,
    });
};

ContainerId.prototype.asContainerId = function (_ty: ContainerType): ContainerId {
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