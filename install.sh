#!/bin/bash

echo Installing from and configuring TD CLI to connect to $TD_HOST 
echo Downloading TD script...
curl -O -s $TD_HOST/bin/td 
echo Set TD Path and Permissions - please provide password for sudo access...
sudo chmod +x td
sudo ln -sf `pwd`/td /usr/local/bin/td
sed -ie "s@TD_HOST=.*@TD_HOST=\"${TD_HOST}\"@" td && rm tde
echo TD CLI Installed. You can test this using "td help".
echo In case system path is incorrectly setup, you can manually add it to the path by executing "export PATH=$PATH:<path to td script>"
exit 0
