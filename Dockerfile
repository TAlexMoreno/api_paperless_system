# Start from the true, up-to-date, modern n8n image
FROM docker.io/n8nio/n8n:latest

USER root

# 0. Re-bootstrap apk-tools (since n8n distroless strips it)
RUN ARCH=$(uname -m) && \
    if [ "$ARCH" = "x86_64" ]; then ARCH="x86_64"; else ARCH="aarch64"; fi && \
    wget -qO- "http://dl-cdn.alpinelinux.org/alpine/latest-stable/main/${ARCH}/" | \
    grep -o 'href="apk-tools-static-[^"]*\.apk"' | head -1 | cut -d'"' -f2 | \
    xargs -I {} wget -q "http://dl-cdn.alpinelinux.org/alpine/latest-stable/main/${ARCH}/{}" && \
    tar -xzf apk-tools-static-*.apk && \
    ./sbin/apk.static -X http://dl-cdn.alpinelinux.org/alpine/latest-stable/main -U --allow-untrusted add apk-tools && \
    rm -rf sbin apk-tools-static-*.apk

# 1. Install Chromium and dependencies using CORRECT Alpine v3.22+ package names
RUN apk add --no-cache \
    chromium \
    nss \
    nspr \
    at-spi2-core \
    cups-libs \
    libdrm \
    libxkbcommon \
    libxcomposite \
    libxdamage \
    libxext \
    libxfixes \
    libxrandr \
    mesa-gbm \
    pango \
    alsa-lib \
    udev \
    ttf-freefont \
    freetype \
    harfbuzz \
    ca-certificates

# 2. Point Puppeteer to the native Alpine Chromium binary location
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# 3. Set up your automated script directory
WORKDIR /data/scripts

# 4. Copy package parameters
COPY ./n8n/scripts/package*.json ./
COPY ./n8n/scripts/tsconfig.json ./

# 5. Tell Puppeteer to skip downloading its own browser during npm install
ENV PUPPETEER_SKIP_DOWNLOAD=true
RUN npm ci --omit=dev
RUN npm install -g tsx

# 6. Copy your TypeScript source files and set ownership to the node user
COPY --chown=node:node ./n8n/scripts/ .

# Drop privileges back down to the default secure node user
USER node