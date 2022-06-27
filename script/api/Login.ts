import {form, Form} from "../component/form/Form.js";
import {btn} from "../component/Button.js";
import {textfield} from "../component/form/TextField.js";
import {comp} from "../component/Component.js";
import {tbar} from "../component/Toolbar.js";
import {Window, WindowEventMap} from "../component/Window.js";
import {fieldset} from "../component/form/Fieldset.js";
import {client, RegisterData} from "./Client.js";
import {Notifier} from "../Notifier.js";
import {t} from "../Translate.js";
import {CardContainer, cards} from "../component/CardContainer.js";
import {Observable} from "../component/Observable.js";


export interface LoginEventMap<T extends Observable> extends WindowEventMap<T> {
	cancel: () => void
	login: () => void
}

export interface Login {
	on<K extends keyof LoginEventMap<Login>>(eventName: K, listener: Partial<LoginEventMap<Login>>[K]): void;

	fire<K extends keyof LoginEventMap<Login>>(eventName: K, ...args: Parameters<LoginEventMap<Login>[K]>): boolean;
}


export class Login extends Window {

	private loginForm!: Form;

	private otpForm!: Form;

	private loginToken = "";

	private cardContainer!: CardContainer;
	private registerForm!: Form;

	constructor() {
		super();

		this.width = 480;
		this.title = t("Login");
		this.cls = "login";
		this.modal = true;


		this.on("close", async window => {
			if (!await client.isLoggedIn()) {
				// closed without successful login
				await Window.alert(t("Login required"), t("Login is required for this page. You will return to the previous page."));

				history.back();
			}
		})

		this.loginForm = form({
				flex: "1 2 auto",
				cls: "vbox",
				handler: (form: Form) => {
					this.login(form);
				}
			},
			fieldset({
					flex: "1 2 auto",
					style: {
						overflow: "auto"
					}
				},
				comp({
					tagName: "p",
					html: t("Please enter your username and password")
				}),
				textfield({
					label: t("Username"),
					name: "username",
					autocomplete: "username",
					required: true
				}),
				textfield({
					label: t("Password"),
					type: "password",
					name: "password",
					autocomplete: "password",
					required: true
				}),
				btn({
					style: {
						width: "100%"
					},
					type: "submit",
					text: t("Login")
				}),

				comp({
					tagName: "hr"
				}),

				btn({
					style: {
						width: "100%"
					},
					cls: "raised",
					type: "button",
					text: t("Register"),
					handler: () => {
						this.showRegisterForm();
					}
				})
			)
		);

		this.otpForm = form({
				flex: 1,
				hidden: true,
				handler: (form: Form) => {
					client.auth({
						loginToken: this.loginToken,
						authenticators: {
							googleauthenticator: <{ code: string }>form.getValues()
						}
					}).then(response => {
						console.log(response);

						switch (response.status) {
							case 201:
								return this.onLoginSuccess(response);

							default:
								Notifier.error(response.statusText);
						}
					})
				}
			},
			fieldset({},
				comp({
					tagName: "p",
					html: t("Please provide the one time code from your device")
				}),

				textfield({
					label: "Code",
					name: "googleauthenticator_code",
					required: true,
					autocomplete: "one-time-code"
				})
			),

			tbar({},
				btn({
					type: "button",
					text: t("Cancel"),
					handler: () => {
						this.close();
						this.fire("cancel");
					}
				}),
				comp({
					flex: 1
				}),

				btn({
					type: "submit",
					text: t("Login")
				})
			)
		);

		this.cardContainer = cards({}, this.loginForm, this.otpForm);

		this.items.add(this.cardContainer);
	}

	private showRegisterForm() {

		this.registerForm = form({
				cls: "vbox",
				handler: async (form: Form) => {
					const data = {action: "register" as RegisterData['action'], user: form.getValues()};
					data.user.mail_reminders = true;

					const response = await client.auth(data);

					switch (response.status) {
						case 201:
							client.session = await response.json()
							this.close();
							Notifier.success(t("Registration and successful"));
							this.fire("login");
							break;

						default:

							Notifier.error(response.statusText);
					}

				}
			},
			fieldset({},
				comp({
					tagName: "p",
					html: t("Please enter your e-mail address to register")
				}),

				textfield({
					label: t("Name"),
					name: "displayName",
					required: true
				}),

				textfield({
					type: "email",
					label: t("E-mail"),
					name: "email",
					required: true,
					listeners: {
						change: (field) => {
							if (!field.isValid()) {
								return;
							}
							const username = this.registerForm.findField("username")!;
							if (username.isEmpty()) {
								username.value = field.value;
							}

						}
					}
				}),

				textfield({
					type: "text",
					label: t("Username"),
					name: "username",
					required: true
				}),

				textfield({
					required: true,
					type: "password",
					label: t("Password"),
					name: "password"

				}),

				textfield({
					itemId: "confirm",//item ID used instead of name so this field won't be submitted
					type: "password",
					label: t("Confirm password"),
					required: true,
					listeners: {
						validate: (field) => {
							const form = field.findAncestorByType(Form)!;
							if (field.value != form.findField("password")!.value) {
								field.setInvalid("The passwords don't match");
							}
						}
					},
				}),

				btn({
					style: {
						width: "100%"
					},
					type: "submit",
					text: t("Register")
				})
			)
		);

		this.cardContainer.items.add(this.registerForm);
		this.cardContainer.activeItem = this.cardContainer.items.count() - 1;

		this.registerForm.findField("displayName")!.focus();
	}

	focus(o?: FocusOptions) {
		this.loginForm.focus(o);
	}

	async login(form: Form) {

		try {
			const response = await client.auth(form.getValues());

			switch (response.status) {
				case 200:
					response.json().then((responseData: any) => {

						this.loginToken = responseData.loginToken;
						//this.loginForm.hide();
						this.otpForm.show();
						this.otpForm.focus();
					});
					break;

				case 201:
					return this.onLoginSuccess(response);

				default:
					this.loginForm.findField("username")!.setInvalid(response.statusText);

					Notifier.error(response.statusText);
			}
		} catch (e) {
			Notifier.error("Sorry, an unexpected error occurred: " + e);
		}
	}

	private async onLoginSuccess(response: any) {
		client.session = await response.json();
		Notifier.success(t("Logged in successfully"));
		this.close();
		this.fire("login");

	}
}
