# TestDoubles - Light Weight Service Virtualization for iPaaS and Microservices #

## Introduction ##

TestDoubles is a "Test Double" framework that mimics a service by acting as an intermediate agent between a client and the actual service. It can also act as a proxy and record the interactions between the client and the service. Once these interactions are recorded, they can be replayed to mimic the behavior of the actual service. Each service that is made by the tester or client is considered to be a test double. TestDoubles is intended to treat the middleware integration platforms such as MuleSoft, Oracle, Boomi, Informatica, JitterBit, SnapLogic and others as the "System Under Test", bringing the concept of Continuous Testing to the EAI world. The high level approach is described below.

The offering extends the popular Mountebank project to add cluster support, named REST APIs, persisted request/response pairs, command line interface (CLI), packaging mechanisms including Node.js, Docker, Vagrant, PM2 etc.

![Test Double Architecture.png](images/0-testdoubles.png)

## Getting Started ##

TestDoubles is available for both single server and cluster mode. For single server mode, there are three installation options: npm, docker, and vagrant each of which is described in futher detail below. Each installation option is independent of the others, and it is not necessary proceed through the installation process in sequence. 

For more information on how to install TestDoubles for cluster mode, click on the link below.

[Cluster Mode Installation](cluster_mode.md)

### NPM Installation

```
$ npm install testdoubles 
```
After installing TestDoubles, you can choose to export the following environment variables.

```
export TD_HOST="http://localhost:5050"
export TD_PORT=5050
export MB_PORT=2525
export MB_HOST="localhost"
export NODE_ENV="development"
```

Ensure that you set the tdctl script to have execute permissions, and then run the command below.

```
./bin/tdctl start
```

### Docker Installation

Download TestDoubles from Dockerhub and run the container. It is preferable to run this from a dedicated terminal window.
```
$ docker pull devopshub/testdoubles
```
To check the hostname on which TestDoubles is running

* If you are on Linux, the hostname is "localhost"
  
* If you are on Darwin(Mac), run the command below and note down the IP address, which is the hostname for Mac
```
$ docker-machine ip default
```

The port will be defaulted to 5050, remember to substitute that in the curl command in the usage section below.

The TestDoubles container can be started either in the background and foreground.

To start in the foreground use the following command:
```
$ docker run -i -t --name testdoubles --net=host devopshub/testdoubles
```

To start the testdoubles in background use the following command:
```
$ docker run -d --name testdoubles --net=host devopshub/testdoubles
```

To view logs run the following command

```
$ docker logs -f testdoubles
```

After running TestDoubles as a Docker container, proceed to the usage section below for more information on how to run TestDoubles.

### Vagrant Installation

To run TestDoubles in Vagrant VM first install it using using npm install.

After installing TestDoubles, start TestDoubles with the following command (you must be in the directory where TestDoubles is installed) 

```
$ vagrant up
```

## Usage

Run the curl command below with the hostname and port number noted down earlier. It describes the TestDoubles project and provide instructions for TestDoubles CLI installation. The hostname and port will differ depending on the way TestDoubles is installed. 

If TestDoubles is installed as a Docker container, the hostname will be either "localhost" or the value of the '$ docker-machine ip default' command. 

If TestDoubles is installed using NPM, the value of the hostname and port will be in the environment variables.


```
$ curl -s http://<hostname>:<Port>
```
Copy and run the curl command to execute install script with passing the TD_HOST(hostname and port number) for initial setup
```
curl -s http://<hostname>:<Port>/install.sh | TD_HOST="http://<hostname>:<Port>" sh

Example
curl -s http://localhost:5050/install.sh | TD_HOST="http://localhost:5050" sh
```

## TestDouble Life Cycle 
Using test doubles is done as follows by the tester of the System Under Test (SUT):

1. Create the test double
2. Set the test double in recording mode
3. Update the middleware system (SUT) to point the service to the test double instead of the real service
4. Set the test double to stop the recording mode and get into playback mode
5. Save the data and modify (optional) for future use
6. Run the tests, which should bypass the real service and return responses from the test double
7. After testing is complete, delete the test double, and update the SUT to point back to the real service

## Next Steps

* [API Specification](API.md)
* [CLI Command Reference](CLI.md)

