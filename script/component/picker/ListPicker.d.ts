import { Component, ComponentEventMap } from "../Component.js";
import { List } from "../List.js";
import { Config } from "../Observable.js";
export interface ListPickerEventMap extends ComponentEventMap {
    select: {
        record: any;
    };
}
export declare class ListPicker<ListType extends List = List> extends Component<ListPickerEventMap> {
    readonly list: ListType;
    constructor(list: ListType);
    focus(o?: FocusOptions): void;
    onSelect(): void;
}
export type ListPickerConfig<ListType extends List> = Config<ListPicker<ListType>, "list">;
/**
 * Shorthand function to create {@link ListPicker}
 *
 * @param config
 */
export declare const listpicker: <ListType extends List = List>(config: ListPickerConfig<ListType>) => ListPicker<ListType>;
