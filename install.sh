#!/bin/bash

echo $TD_HOST
#td setup
echo "Downloading TD file from" $TD_HOST
curl -O -s $TD_HOST/bin/td 
sudo chmod +x td
echo "set TD Path"
sudo ln -sf /home/vagrant/td /usr/local/bin/td
#export PATH=$PATH:.
sed -ie "1s@TD_HOST=.*@TD_HOST=\"${TD_HOST}\"@" td
rm tde






