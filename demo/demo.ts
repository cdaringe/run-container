import { runSimple } from "../";
import Docker from "dockerode";
const docker = new Docker({ socketPath: "/var/run/docker.sock" });
const demoContainerName = "run-container-demo-pg";

async function go() {
  await maybePruneContainer({ name: demoContainerName });
  const container = await runSimple({
    name: demoContainerName,
    autoRemove: true,
    verbose: true,
    image: "postgres",
    ports: {
      "5432": "4000",
    },
    env: {
      POSTGRES_PASSWORD: `demo`,
    },
  });
  await new Promise((res) => setTimeout(res, 1000));
  const stats = await container.inspect();
  console.log(stats);
  await container.remove({ force: true });
}

async function maybePruneContainer({ name }: { name: string }) {
  const containers = await docker.listContainers({ all: true });
  const existingContainerMeta = containers.find((container) =>
    container.Names.some((containerName) => containerName.match(name)),
  );
  if (existingContainerMeta) {
    const existingContainer = await docker.getContainer(
      existingContainerMeta.Id,
    );
    await existingContainer.remove({ force: true });
  }
}

go();
