import {Component, ComponentConfig} from "../component/Component.js";
import {client} from "./Client.js";
import {Observable} from "../component/Observable.js";

interface ImageConfig<T extends Observable> extends ComponentConfig<T> {
	blobId:string
}

/**
 * Image component
 *
 * Uses the fetch API to fetch the image with an Authorization header and creates an objectURL using URL.createObjectURL()
 */
export class Image extends Component {
	public static create<T extends typeof Observable>(this: T, config?: ImageConfig<InstanceType<T>>) {
		return <InstanceType<T>> super.create(<any> config);
	}

	protected blobId = "";

	protected tagName = "img" as keyof HTMLElementTagNameMap;

	private static cache: Record<string, Promise<any>> = {};

	private static defaultSrc = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';

	protected internalRender(): HTMLElement {
		const el = super.internalRender() as HTMLImageElement;

		el.src = Image.defaultSrc;

		if(this.blobId) {
			this.setBlobId(this.blobId);
		}

		return el;
	}

	public setBlobId(blobId:string) {
		this.blobId = blobId;
		client.getBlobURL(this.blobId).then( src => {
			(<HTMLImageElement> this.getEl()).src = src
		} )
			.catch( console.error );
	}


	/**
	 * Replaces all img tags with a blob ID source from group-office with an objectURL
	 *
	 * @param el
	 * @return Promise that resolves when all images are fully loaded
	 */
	public static replaceImages(el:HTMLElement) {

		const promises:Promise<any>[] = [];
		el.querySelectorAll("img").forEach((img:HTMLImageElement) => {

			let blobId = img.dataset.blobId;
			if(!blobId) {
				const regex = new RegExp('blob=([^">\'&\?].*)');
				const matches = regex.exec(img.src);
				if(matches && matches[1]) {
					blobId = matches[1];
				}
			}

			if(blobId) {

				img.src = Image.defaultSrc;

				promises.push(client.getBlobURL(blobId).then(src => {

					img.src = src;
				}).then(() => {
					//wait till image is fully loaded
					return new Promise(resolve => { img.onload = img.onerror = resolve; })
				}));
			}
		});

		return Promise.all(promises);
	}

}