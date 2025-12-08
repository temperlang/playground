# Temper Playground

## Update the server image, including Temper itself

If you want to update Temper, do that first.

```bash
# Or wherever the temper main project dir is.
cd ../temper
# This pushes ghcr.io/temperlang/intermediate:cli-dev if authenticated.
./gradlew docker:cliImageMultiplatformCreate
```

Then back to playground.

```bash
# Or however you get back.
cd ../playground
docker build -t ghcr.io/temperlang/playground -f Containerfile .
docker push ghcr.io/temperlang/playground
```

## Test locally

Run server.

```bash
docker run --rm -e TEMPER_PLAY_GITHUB -p 3001:3001 ghcr.io/temperlang/playground
```

Also run client.

```bash
cd ./client # under playground
pnpm start
```

## Update deployed server

Connect. Note that the playground_deployer user has all the permissions needed
to manage docker. No need to switch to root.

```bash
ssh playground_deployer@...
# Then enter password.
```

Update image.

```bash
# Maybe back up current first?
# docker tag docker tag ghcr.io/temperlang/playground:latest ghcr.io/temperlang/playground:...
docker pull ghcr.io/temperlang/playground
```

Apply environment and restart server container.

```bash
. ~/web/playground.temper.systems/private/playground-env.sh
docker stop temper-playground-server
docker container rm temper-playground-server
docker run -e TEMPER_PLAY_GITHUB -p 3001:3001 -d --restart=unless-stopped \
    --name temper-playground-server ghcr.io/temperlang/playground
```
