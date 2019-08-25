import Docker from 'dockerode'
import execa from 'execa'
import * as path from 'path'

export async function imageExists (imageName: string) {
  try {
    await execa('docker', ['image', 'inspect', imageName], { stdio: 'ignore' })
    return true
  } catch (err) {
    // @TODO improve robustness of this sloppy catch
    return false
  }
}

export interface RunContainerOptions extends Docker.ContainerCreateOptions {
  Image: string
}

export const run = async (
  opts: RunContainerOptions
): Promise<Docker.Container> => {
  const docker = new Docker({ socketPath: '/var/run/docker.sock' })
  const { Image: image } = opts
  if (!(await imageExists(image))) await execa('docker', ['pull', image])
  const container = await docker.createContainer(opts)
  await container.start()
  return container
}

export type RunSimpleOptions = {
  autoRemove?: boolean
  bindMounts?: {
    [hostPath: string]: string
  }
  cmd?: Docker.ContainerCreateOptions['Cmd']
  env?: { [key: string]: string }
  image: string
  name?: string
  ports?: {
    [containerTcpPort: string]: string
  }
}
export const runSimple = async (opts: RunSimpleOptions) => {
  if (!opts) {
    throw new Error('expected runSimple RunSimpleOptions configuration object')
  }
  const {
    autoRemove,
    cmd,
    env = {},
    image: Image,
    name,
    ports = {},
    bindMounts = {}
  } = opts
  const dockerodeConfig: Partial<Docker.ContainerCreateOptions> = {
    Env: [],
    Image,
    HostConfig: {
      Binds: [],
      PortBindings: {}
    }
  }
  if (autoRemove !== undefined) {
    dockerodeConfig.HostConfig!.AutoRemove = !!autoRemove
  }
  if (cmd !== undefined) {
    dockerodeConfig.Cmd = cmd
  }
  if (name !== undefined) dockerodeConfig.name = name
  for (const containerPort in ports) {
    const hostPort = ports[containerPort]
    const tcpContainerPort = containerPort.match(/tcp/)
      ? containerPort
      : `${containerPort}/tcp`
    const tcpHostPort = hostPort.match(/tcp/) ? hostPort : `${hostPort}/tcp`
    dockerodeConfig.HostConfig!.PortBindings![tcpContainerPort] = [
      { HostPort: tcpHostPort }
    ]
  }
  for (const hostVolume in bindMounts) {
    const containerVolume = bindMounts[hostVolume]
    dockerodeConfig.HostConfig!.Binds!.push(
      `${path.resolve(hostVolume)}:${containerVolume}`
    )
  }
  for (const key in env) {
    dockerodeConfig.Env!.push(`${key}=${env[key]}`)
  }
  return run(dockerodeConfig as RunContainerOptions)
}
