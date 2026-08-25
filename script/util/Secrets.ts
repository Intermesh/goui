/**
 * Genererate secrets
 */
class Secrets {

	public static BASE32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'; // RFC 4648 Base32 alphabet;

	public static PASSWORD = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz0123456789!@#$%^&*';

	/**
	 * @param length
	 * @param charset
	 */
	private generate(length:number, charset:string) {

		const charsetLength = charset.length;
		const randomValues = new Uint8Array(length);
		window.crypto.getRandomValues(randomValues);

		return Array.from(randomValues, (b) => charset[b % charsetLength]).join('');
	}


	password() {
		return this.generate(16, Secrets.PASSWORD);
	}

	otp() {
		return this.generate(32, Secrets.BASE32);
	}

	appPassword() {
		return this.generate(16, Secrets.PASSWORD).match(new RegExp(`.{1,4}`, 'g'))!.join('-');
	}
}

export const secrets = new Secrets();