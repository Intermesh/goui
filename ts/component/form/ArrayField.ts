import {Container, ContainerConfig, ContainerEventMap} from "../Container.js";
import {Fieldify, FieldifyConfig, FieldifyEventMap} from "./Fieldify.js";
import {Observable, ObservableListener, ObservableListenerOpts} from "../Observable.js";
import {FieldInterface} from "./Field.js";

const FieldifiedContainer = Fieldify(Container);

/**
 * @inheritDoc
 */
export interface ArrayFieldEventMap<T extends Observable> extends ContainerEventMap<T>,FieldifyEventMap<T> {

}

/**
 * @inheritDoc
 */
interface ArrayFieldConfig<T extends Observable> extends ContainerConfig<T>, FieldifyConfig<T> {
	/**
	 * Function that returns a new form field for an array item
	 */
	itemComponent: ItemComponent
	/**
	 * @inheritDoc
	 */
	listeners?: ObservableListener<ArrayFieldEventMap<T>>
}

type ItemComponent = (value?:Record<string, any>) => FieldInterface;
type ArrayFieldValue = Record<string, any>[];

export interface ArrayField {
	items: FieldInterface[];
	on<K extends keyof ArrayFieldEventMap<ArrayField>>(eventName: K, listener: ArrayFieldEventMap<ArrayField>[K], options?: ObservableListenerOpts): void
	fire<K extends keyof ArrayFieldEventMap<ArrayField>>(eventName: K, ...args: Parameters<NonNullable<ArrayFieldEventMap<ArrayField>[K]>>): boolean
}

/**
 * Field to return an array with objects
 *
 * @see Form
 */
export class ArrayField extends FieldifiedContainer {

	protected tagName = "div" as keyof HTMLElementTagNameMap

	protected itemComponent!: ItemComponent;

	protected value = []

	public static create<T extends typeof Observable>(this: T, config?: ArrayFieldConfig<InstanceType<T>>) {
		return <InstanceType<T>> super.create(<any> config);
	}

	setValue(v: ArrayFieldValue, useForReset = true) {
		super.setValue(v, useForReset);

		this.removeAll();

		v.forEach((item) => {
			const field = this.itemComponent(item);
			field.setValue(item);
			this.addItem(field);
		});
	}

	getValue(): ArrayFieldValue {

		const v:ArrayFieldValue = [];

		this.items.forEach((item) => {
			v.push(item.getValue());
		});

		return v;
	}


}