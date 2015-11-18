# Maintainer: Rajesh Raheja
# November 9, 2015

ifeq ($(shell uname), Linux)
DOCKER=sudo docker
else ifeq ($(shell uname), Darwin)
DOCKER=docker
endif

#Add all targets to this
.PHONY: clean build test tag release docker-run docker-run-bash doc npm-test npm-release npm-build npm-clean docker-release docker-test docker-build docker-clean setup lint 

#when make called without target it will run "all", which inturn execute all these targets.
all: npm-validate docker-validate docker-login npm-test npm-release docker-test docker-release vagrant-release

#run this if you have not any dependencies installed(has binary inastallation commands for ubuntu and mac which is automatically handled)
setup:	
	@echo "************ Setup mode: Installing necessary packages ************ \n"

ifeq ($(shell uname), Linux)
	@echo "Requires sudo access !"
	sudo apt-get update && sudo apt-get install -y nodejs npm && sudo ln -s /usr/bin/nodejs /usr/bin/node && \
	sudo apt-get install -y python-pip && sudo pip install mkdocs
else ifeq ($(shell uname), Darwin)
	ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)" && \
	brew update && brew install node && brew install python && pip install mkdocs
endif
	
#dependency for npm-build; it will printout the binaries if installed for the Testdoubles to run. If anything not installed, run "setup"
npm-validate:
	@echo "*********** NPM Setup ************ "
	@echo "The following package versions were found:\n""Node: $$(node -v)\n""NPM: $$(npm -v)  \n" 
	@echo "If any packages required, please run 'make setup'"
	@echo "*********************************** \n"

#mkdocs create site directory with all md files converted to html. Please refer mkdocs.yml file in root directory for configuration details
doc: 
	mkdocs build --clean

# npm test module
npm-clean: npm-validate
	@echo "+++++++++++++++ Running npm-clean ++++++++++++++++ \n"
	rm -f *.log
	rm -f *.pid
	rm -f logs/*.log
	rm -f testdoubles/*.json
	rm -rf node_modules/*
	rm -rf site/*

npm-build: npm-clean doc 
	@echo "++++++++++++++++ Running npm-build +++++++++++++++++" 
	npm install

npm-lint: npm-build 
	@echo "+++++++++++++++++++Running jshint+++++++++++++++++"
	npm run lint

npm-test: npm-lint
	@echo "++++++++++++++++ Running npm-test ++++++++++++++++++++++++++ "
	npm test

#requires the following environment variable to be set: NPM_TOKEN
npm-login:
ifeq ($(NPM_TOKEN), )
	$(error NPM_TOKEN env variable is empty!)
endif

npm-release: npm-login
	./bin/publish.sh
	
#Docker release module: Run docker release which will build docker container and push into whichever dockerhub  account you're logged into.
#printout if docker installed. If not please install docker before running docker-build
docker-validate:
	@echo "*********** Docker Setup ************"
	@echo "Docker: $$(docker --version | awk '{print $$3}') installed"	
	@echo "************************************* \n"


docker-clean: docker-validate
	@echo "****************Running docker-clean ********************* "
	-$(DOCKER) rm -f $$($(DOCKER) ps -a -q -f "status=exited")
	-$(DOCKER) rmi $$($(DOCKER) images -f "dangling=true" -q)	

docker-build: docker-clean 
	@echo "***************Building testdoubles docker image ***************** "
	$(DOCKER) build --rm=true --pull=true --force-rm=true --no-cache=true -t testdoubles:latest .

docker-test: docker-build 	
	@echo "************Running test inside docker container **************** "
	$(DOCKER) run -it --name testdoubles --net=host testdoubles npm test
	$(DOCKER) stop testdoubles 
	$(DOCKER) rm testdoubles

#If docker hub account id cadevopsci, it will push to devopshub repository
#If anyother login other than cadevopsci please provide DOCKER_REPO variable to push into that respective repository

docker-release: 
	@echo "*****************Releasing docker image to DOCKER HUB*************** "
ifeq ($(DOCKER_REPO), )
	$(DOCKER) tag -f testdoubles devopshub/testdoubles
	$(DOCKER) push devopshub/testdoubles
else
	$(DOCKER) tag -f testdoubles $(DOCKER_REPO)/testdoubles
	$(DOCKER) push $(DOCKER_REPO)/testdoubles
endif

#Use it to login to docker hub account. Takes 3 parameters DOCKER_EMAIL, DOCKER_PASSWORD, DOCKER_USERNAME
docker-login: 
ifeq ($(DOCKER_EMAIL), )
	$(warning DOCKER_EMAIL env variable is empty!)
endif
ifeq ($(DOCKER_PASSWORD), )
	$(warning DOCKER_PASSWORD env variable is empty!)
endif
ifeq ($(DOCKER_USERNAME), )
	$(error DOCKER_USERNAME env variable is empty!)
endif
	@$(DOCKER) login -e=$(DOCKER_EMAIL) -u=$(DOCKER_USERNAME) -p=$(DOCKER_PASSWORD)

#Overall deployment module which will build npm-build, docker container build, push to docker hub
release: npm-validate npm-login docker-validate docker-login npm-test npm-release docker-test docker-release

test: npm-test docker-test

build: npm-build docker-build

clean: npm-clean docker-clean

#Utilities
tag:
	@echo "Git Version: " `git describe --long --first-parent`
	@echo "Number of commits: " `git log --oneline | wc -l`

master-release: 
	npm version $(version)
	make release
	git push origin master
	var=$(git remote -v | grep bitbucket |awk '{print $1}' | head -1)
	git push $var master

docker-run-hostmode:
	docker run -it --name testdoubles --net=host $(DOCKER_REPO)/testdoubles

docker-run-port:
	docker run -it -p 2525:2525 -p 5050:5050 -p 5051:5051 --name testdoubles $(DOCKER_REPO)/testdoubles

docker-run-bash:
	docker run -it $(DOCKER_REPO)/testdoubles bash
