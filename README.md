# TestDoubles - Light Weight Service Virtualization for iPaaS and Microservices #

[![Semaphore Build Status](https://semaphoreci.com/api/v1/projects/d1ad526b-97bc-444f-bb36-e208b3e94006/534914/badge.svg)](https://semaphoreci.com/rraheja/testdoubles)
[![Shippable Build Status](https://img.shields.io/shippable/55ca3b65edd7f2c0529fcfe3.svg)](https://app.shippable.com/projects/55ca3b65edd7f2c0529fcfe3)
[![Codacy Badge](https://www.codacy.com/project/badge/b8c86c3745724a5a9e0ff07bab6a3fcc)](https://www.codacy.com)
[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/DevTestSolutions/TestDoubles?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

## Introduction ##

TestDoubles is a "Test Double" framework that mimics a service by acting as an intermediate agent between a client and the actual service. It can also act as a proxy and record the interactions between the client and the service. Once these interactions are recorded, they can be replayed to mimic the behavior of the actual service. Each service that is made by the tester or client is considered to be a test double. TestDoubles is intended to treat the middleware integration platforms such as MuleSoft, Oracle, Boomi, Informatica, JitterBit, SnapLogic and others as the "System Under Test", bringing the concept of Continuous Testing to the EAI world. The high level approach is described below.

![Test Double Architecture.png](/documentation/images/0-testdoubles.png)

Please refer to the [documentation](/documentation/index.md) for more details
