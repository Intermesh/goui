import {Form} from "../component/form/Form.js";
import {Button} from "../component/Button.js";
import {TextField} from "../component/form/TextField.js";
import {Component} from "../component/Component.js";
import {Toolbar} from "../component/Toolbar.js";
import {Window, WindowEventMap} from "../component/Window.js";
import {Fieldset} from "../component/form/Fieldset.js";
import {client, RegisterData} from "./Client.js";
import {Alert} from "../Alert.js";
import {t} from "../Translate.js";
import {CardContainer} from "../component/CardContainer.js";
import {Observable} from "../component/Observable.js";


export interface LoginEventMap<T extends Observable> extends WindowEventMap<T> {
	cancel?: () => void
	login?: () => void
}

export interface Login {
	on<K extends keyof LoginEventMap<Login>>(eventName: K, listener: LoginEventMap<Login>[K]): void;

	fire<K extends keyof LoginEventMap<Login>>(eventName: K, ...args: Parameters<NonNullable<LoginEventMap<Login>[K]>>): boolean;
}


export class Login extends Window {

	protected width = 480;

	private loginForm!: Form;

	protected cls = "login";

	private otpForm!: Form;

	private loginToken = "";

	protected title = t("Login")

	protected modal = true
	private cardContainer!: CardContainer;
	private registerForm!: Form;

	protected init() {
		super.init();

		this.loginForm = Form.create({
			flex: "1 2 auto",
			cls: "vbox",
			handler: (form: Form) => {
				this.login(form);
			},
			items: [
				Fieldset.create({
					flex: "1 2 auto",
					style: {
						overflow: "auto"
					},
					items: [
						Component.create({
							tagName: "p",
							html: t("Please enter your username and password")
						}),
						TextField.create({
							label: t("Username"),
							name: "username",
							autocomplete: "username",
							required: true
						}),
						TextField.create({
							label: t("Password"),
							type: "password",
							name: "password",
							autocomplete: "password",
							required: true
						}),
						Button.create({
							style: {
								width: "100%"
							},
							type: "submit",
							text: t("Login")
						}),

						Component.create({
							tagName:"hr"
						}),

						Button.create({
							style: {
								width: "100%"
							},
							cls: "raised",
							type: "button",
							text: t("Register"),
							handler: () => {
								this.showRegisterForm();
							}
						}),
					]
				}),


				// Toolbar.create({
				// 	items: [
				//
				// 		Button.create({
				// 			type: "button",
				// 			text: t("Cancel"),
				// 			handler: () => {
				// 				this.close();
				// 				this.fire("cancel");
				// 			}
				// 		}),
				//
				// 		Component.create({
				// 			flex: 1
				// 		}),
				//
				// 		Button.create({
				// 			type: "submit",
				// 			text: "Login"
				// 		})
				// 	]
				// })

			]
		});

		//this.addItem(this.loginForm);

		this.otpForm = Form.create({
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
							Alert.error(response.statusText);
					}
				})
			},

			items: [

				Fieldset.create({
					items: [
						Component.create({
							tagName: "p",
							html: t("Please provide the one time code from your device")
						}),

						TextField.create({
							label: "Code",
							name: "googleauthenticator_code",
							required: true,
							autocomplete: "one-time-code"
						})
					]
				}),

				Toolbar.create({
					items: [
						Button.create({
							type: "button",
							text: t("Cancel"),
							handler: () => {
								this.close();
								this.fire("cancel");
							}
						}),
						Component.create({
							flex: 1
						}),

						Button.create({
							type: "submit",
							text: t("Login")
						}),

					]
				})
			]
		});

		this.cardContainer = CardContainer.create({
			items: [this.loginForm, this.otpForm]
		})

		this.getItems().add(this.cardContainer);
	}

	private showRegisterForm () {

		this.registerForm = Form.create({
			cls: "vbox",
			handler: async (form: Form) => {
				const data = {action: "register" as RegisterData['action'], user:  form.getValues()};
				data.user.mail_reminders = true;

				const response = await client.auth(data);

				switch (response.status) {
					case 201:
						client.session = await response.json()
						this.close();
						Alert.success(t("Registration and successful"));
						this.fire("login");
						break;

					default:

						Alert.error(response.statusText);
				}

			},

			items: [
				Fieldset.create({
					items: [
						Component.create({
							tagName: "p",
							html: t("Please enter your e-mail address to register")
						}),

						TextField.create({
							label: t("Name"),
							name: "displayName",
							required: true
						}),

						TextField.create({
							type: "email",
							label: t("E-mail"),
							name: "email",
							required: true,
							listeners: {
								change: (field) => {
									if(!field.isValid()) {
										return;
									}
									const username = this.registerForm.findField("username")!;
									if(username.isEmpty()) {
										username.setValue(field.getValue());
									}

								}
							}
						}),

						TextField.create({
							type: "text",
							label: t("Username"),
							name: "username",
							required: true
						}),

						TextField.create({
							required: true,
							type: "password",
							label: t("Password"),
							name: "password"
							
						}),

						TextField.create({
							itemId: "confirm",//item ID used instead of name so this field won't be submitted
							type: "password",
							label: t("Confirm password"),
							required: true,
							listeners: {
								validate: (field) => {
									const form = field.findAncestorByInstanceType(Form)!;
									if(field.getValue() != form.findField("password")!.getValue()) {
										field.setInvalid("The passwords don't match");
									}
								}
							},
						}),

						Button.create({
							style: {
								width: "100%"
							},
							type: "submit",
							text: t("Register")
						})
					]
				})

			]
		});

		this.cardContainer.getItems().add(this.registerForm);
		this.cardContainer.setActiveItem(this.cardContainer.getItems().count() - 1);

		this.registerForm.findField("displayName")!.focus();

	
	}

	focus(o?: FocusOptions) {
		this.loginForm.focus(o);
	}

	login(form: Form) {

		client.auth(form.getValues()).then((response) => {
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

					Alert.error(response.statusText);
			}
		});

	}

	onLoginSuccess(response: any) {
		response.json().then((session: any) => {
			client.session = session;
		}).then(() => {
			Alert.success(t("Logged in successfully"));
			this.close();

			this.fire("login");
		})
	}
}
