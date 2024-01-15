const response = await fetch("https://raw.githubusercontent.com/google/material-design-icons/master/variablefont/MaterialSymbolsOutlined%5BFILL%2CGRAD%2Copsz%2Cwght%5D.codepoints");

process.stdout.write("export type MaterialIcon = \n");

const fonts = await response.text();

const lines = fonts.split("\n");

lines.forEach(line => {
	const parts = line.split(" ");

	process.stdout.write(`"${parts[0]}" |\n`);
})

process.stdout.write(";\n");