import { run, runSimple } from '../run-container'
import * as path from 'path'
import ava, { TestInterface } from 'ava'

const test = ava as TestInterface<{}>

const testBashScriptFilename = path.resolve(__dirname, 'slow-exit.sh')

test('boots container', async t => {
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
  const containerData = await container.inspect()
  t.truthy(containerData.Image, 'has docker image')
  t.is(containerData.State.Status, 'running', 'db is running')
  t.is(
    Object.keys(containerData.HostConfig.PortBindings).length,
    1,
    'has host port exposed'
  )
  await container.remove({ force: true })
})

test('boots a simple container', async t => {
  const container = await runSimple({
    autoRemove: false,
    bindMounts: {
      [testBashScriptFilename]: '/test/test.sh'
    },
    cmd: ['bash', '/test/test.sh'],
    image: 'bash',
    env: {
      DB_URL: 'fake-path-to-db'
    },
    name: 'bashlyfe',
    ports: {
      '4000': '4000'
    }
  })
  const containerData = await container.inspect()
  t.is(containerData.State.Status, 'running', 'db is running')
  t.is(containerData.Name, '/bashlyfe')
  await container.wait()
  const stream = (await container.logs({ stdout: true })) as any
  t.truthy((stream as string).match(/TESTING/))
  await container.remove({ force: true })
})
