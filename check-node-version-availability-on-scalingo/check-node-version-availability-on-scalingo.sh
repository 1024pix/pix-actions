package_json_directory="$1"
echo "Checking node version availability on Scalingo for package.json in $package_json_directory"

scalingo_available_node_versions=$(curl -s https://raw.githubusercontent.com/Scalingo/nodejs-buildpack/master/inventory/node.toml | grep -E -o 'node-v[0-9.]+' | grep -E -o '[0-9.]+')
package_json_node_version=$(jq -r '.engines.node' "$package_json_directory"/package.json | sed 's/\^//g')

if [[ -z $package_json_node_version ]]; then
  echo 'No node version specified in package.json, exiting'
  exit 0
fi;

if [[ $scalingo_available_node_versions =~ $package_json_node_version ]]; then
  exit 0
else
  echo "Node version $package_json_node_version is not available on Scalingo"
  exit 1
fi