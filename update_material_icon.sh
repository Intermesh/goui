LIST=`curl -s https://raw.githubusercontent.com/google/material-design-icons/master/variablefont/MaterialSymbolsOutlined%5BFILL%2CGRAD%2Copsz%2Cwght%5D.codepoints`

TS="export type MaterialIcon = \n";

while IFS= read -r line; do
  word="${line%% *}"
  TS="$TS \"$word\" |\n";
done <<< "$LIST"

#remove 4 chars to remove " |\n" of the last line
echo "${TS%????};";