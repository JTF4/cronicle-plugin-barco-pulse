echo "Installing cronicle-plugin-barco-pulse"

mkdir -p /opt/cronicle/plugins/cronicle-plugin-barco-pulse

mv ./dist/index.js /opt/cronicle/plugins/cronicle-plugin-barco-pulse
mv ./node_modules /opt/cronicle/plugins/cronicle-plugin-barco-pulse/node_modules

echo "Plugin Path: /opt/cronicle/plugins/cronicle-plugin-barco-pulse/index.js"