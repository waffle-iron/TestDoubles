# Cluster Mode Installation Options

There are three options for installating TestDoubles in cluster mode: pm2, docker, and vagrant.
PM2 is for running multiple instances of the application directly on the machine (not inside any container or VM).
Docker is for running TestDoubles in cluster mode, inside docker.
Vagrant is for running TestDoubles in cluster mode, inside Vagrant.

## PM2

To run TestDoubles in a cluster mode using PM2, first ensure that PM2 is installed.

```
npm install pm2 -g
```

Next, start PM2 with the pm2_td.json file. This starts TestDoubles on its own, and does not start Mountebank.

```
pm2 start pm2_td.json
```

Now, start Mountebank.

```
./node_modules/mountebank/bin/mb
```

The pm2_td.json configuration file contains the commands for environment variables and other options. The current configuration 
starts three instances of TestDoubles, but this can be changed.
