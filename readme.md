# run-container

run a docker container in nodejs

runs a container using [dockerode](https://www.npmjs.com/package/dockerode), bootstrapping the pull & start processes, whilst also exposing a compact function to simplify docker's and dockerode's otherwise complex APIs

[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com) [![TypeScript package](https://img.shields.io/badge/typings-included-blue.svg)](https://www.typescriptlang.org) [![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release) [![Greenkeeper badge](https://badges.greenkeeper.io/cdaringe/run-container.svg)](https://greenkeeper.io/) [![CircleCI](https://circleci.com/gh/cdaringe/run-container.svg?style=svg)](https://circleci.com/gh/cdaringe/run-container)

## usage

```ts
import { run, runSimple } from 'run-container'

// runSimple, minimal example
const container = await runSimple({ image: 'postgres' }) // => Dockerode.Container instance
await container.remove({ force: true })

// runSimple, rich example
await runSimple({
  autoRemove: true,
  bindMounts: { '/path/to/host/file.sh': '/path/to/container/file.sh' },
  cmd: ['bash', '/path/to/container/file.sh'],
  env: { 'KEY': 'VALUE' },
  image: 'bash',
  name: 'script-fun',
  ports: { '4000': '4000' } // tcp ports only. otherwise, use `run`
})
await container.wait()
await container.remove()

// run
// exposes Dockerodes.ContainerCreateOptions full API,
// which directly reflects the docker engine API!
// https://docs.docker.com/engine/api/latest/
const container = await run({
  Image: 'postgres',
  ExposedPorts: {
    '5432/tcp': {}
  },
  HostConfig: {
    AutoRemove: true,
    PortBindings: { '5432/tcp': [{ HostPort: '40000' }] }
  }
})
// ... do work
await container.remove({ force: true })
```

see the [exported typescript typings in the docs folder](https://github.com/cdaringe/run-container/tree/master/docs), or check out the tiny source.
