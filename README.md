[![Stories in Ready](https://badge.waffle.io/DevTestSolutions/TestDoubles.png?label=ready&title=Ready)](https://waffle.io/DevTestSolutions/TestDoubles)
# TestDoubles - Light Weight Service Virtualization for iPaaS and Microservices #

[![Shippable Build Status](https://api.shippable.com/projects/564627481895ca447423774e/badge/master)](https://app.shippable.com/projects/564627481895ca447423774e)
[![Codacy Badge](https://api.codacy.com/project/badge/grade/b8005f8b29e446878229288e12710bc7)](https://www.codacy.com)
[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/DevTestSolutions/TestDoubles?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)
[![Stack Share](http://img.shields.io/badge/tech-stack-0690fa.svg?style=flat)](http://stackshare.io/ianakelly/testdoubles)

## Introduction ##

TestDoubles is a ["Test Double"](https://en.wikipedia.org/wiki/Test_double) framework that mimics a service by acting as an intermediate agent between a client and the actual service. It can also act as a proxy and record the interactions between the client and the service. Once these interactions are recorded, they can be replayed to mimic the behavior of the actual service. Each service that is made by the tester or client is considered to be a test double. TestDoubles is intended to treat the middleware integration platforms such as MuleSoft, Oracle, Boomi, Informatica, JitterBit, SnapLogic and others as the "System Under Test", bringing the concept of Continuous Testing to the EAI world. The high level approach is described below.

![Test Double Architecture.png](documentation/images/0-testdoubles.png)

Please refer to the [documentation](documentation/index.md) for more details
