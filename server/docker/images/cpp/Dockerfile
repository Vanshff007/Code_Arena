# Prebuilt image so every submission just compiles/runs - no per-run
# apt-get install cost. Runs as a non-root, unprivileged user so even a
# container escape bug would land as `sandbox`, not root.
FROM gcc:13-bookworm
RUN useradd -m -u 1000 sandbox
USER sandbox
WORKDIR /box
