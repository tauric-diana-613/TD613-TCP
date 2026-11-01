FROM node@sha256:3ab1d8a775153425c45ac8c6434c8717fae5866d9dc3e494dc7eb8550d71c75f
COPY --chmod=0555 codex /usr/local/bin/codex
USER 65534:65534
ENV HOME=/scratch
WORKDIR /scratch
ENTRYPOINT ["/usr/local/bin/codex"]
