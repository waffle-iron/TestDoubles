# -*- mode: ruby -*-
# vi: set ft=ruby :
# Maintainer: Rajesh Raheja
# November 2015

Vagrant.configure(2) do |config|
  config.vm.box = "ubuntu/trusty64"

  config.vm.synced_folder ".", "/vagrant"

  config.vm.provider "virtualbox" do |v|
    host = RbConfig::CONFIG['host_os']
    v.gui = false

    # Optimization credits to https://stefanwrobel.com/how-to-make-vagrant-performance-not-suck
    # Give VM 1/4 system memory & access to half of the cpu cores on the host
    if host =~ /darwin/
      cpus = `sysctl -n hw.ncpu`.to_i / 2
      # sysctl returns Bytes and we need to convert to MB
      mem = `sysctl -n hw.memsize`.to_i / 1024 / 1024 / 4
    elsif host =~ /linux/
      cpus = `nproc`.to_i / 2
      # meminfo shows KB and we need to convert to MB
      mem = `grep 'MemTotal' /proc/meminfo | sed -e 's/MemTotal://' -e 's/ kB//'`.to_i / 1024 / 4
    else # doesn't work on Windows
      cpus = 2
      mem = 1024
    end

    v.customize ["modifyvm", :id, "--memory", mem]
    v.customize ["modifyvm", :id, "--cpus", cpus]
    v.customize ["modifyvm", :id, "--vram", 16]
  end

  config.push.define "atlas" do |push|
    push.app = "rraheja/vagrant-testdoubles"
  end

  config.vm.provision "shell", inline: <<-SHELL
    sudo apt-get update
    sudo apt-get install -y nodejs wget curl
    sudo rm -rf /var/lib/apt/lists/*
    ln -s /usr/bin/nodejs /usr/bin/node
    export TD_USER=td
    export TD_HOME=/opt/testdoubles
    export TD_HOST=http://localhost:5050
    export TD_PORT=5050
    export PATH=${TD_HOME}/bin:$PATH
    mkdir ${TD_HOME}
    cp -R /vagrant/* ${TD_HOME}
    sudo groupadd -r ${TD_USER}
    sudo useradd -r -m -g ${TD_USER} ${TD_USER}
    sudo chown -R ${TD_USER} ${TD_HOME}
    chgrp -R ${TD_USER} ${TD_HOME}
    chmod 777 ${TD_HOME}/testdoubles
    chmod 777 ${TD_HOME}/logs
    cd ${TD_HOME}
    npm install --production && npm prune --production
    tdctl start
  SHELL
end
