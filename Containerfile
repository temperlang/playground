# docker build -t ghcr.io/temperlang/playground -f Containerfile
# docker run --rm -e TEMPER_PLAY_GITHUB -p 3001:3001 ghcr.io/temperlang/playground
# OR docker run -e TEMPER_PLAY_GITHUB -p 3001:3001 -d --restart=unless-stopped --name temper-playground-server ghcr.io/temperlang/playground
# OR docker run --rm -it -e TEMPER_PLAY_GITHUB ghcr.io/temperlang/playground bash

FROM ghcr.io/temperlang/temper:cli-dev

USER temper

COPY --chown=temper:temper . /home/temper/work

RUN bash <<'END'
    . $HOME/.asdf/asdf.sh && \
    npm install -g pnpm && \
    pnpm install
END

LABEL org.opencontainers.image.source=https://github.com/temperlang/playground

EXPOSE 3001
WORKDIR /home/temper/work/server
# Could also build above then run built below, but meh. We don't tsx watch.
CMD ["pnpm", "dev"]
