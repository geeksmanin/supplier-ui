FROM eclipse-temurin:21-jdk-jammy

ENV ANDROID_HOME=/opt/android-sdk
ENV ANDROID_SDK_ROOT=/opt/android-sdk
ENV PATH=${PATH}:${ANDROID_HOME}/cmdline-tools/latest/bin:${ANDROID_HOME}/platform-tools:${ANDROID_HOME}/build-tools/34.0.0
ENV DEBIAN_FRONTEND=noninteractive

WORKDIR /app

# 1. Install system utilities and Node.js 20 LTS
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    wget \
    unzip \
    git \
    ca-certificates \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# 2. Download and configure Android SDK Command-line Tools
RUN mkdir -p ${ANDROID_HOME}/cmdline-tools \
    && wget -q https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip -O /tmp/cmdline-tools.zip \
    && unzip -q /tmp/cmdline-tools.zip -d /tmp/cmdline-tools-extracted \
    && mv /tmp/cmdline-tools-extracted/cmdline-tools ${ANDROID_HOME}/cmdline-tools/latest \
    && rm -rf /tmp/cmdline-tools.zip /tmp/cmdline-tools-extracted

# 3. Accept SDK licenses & install platforms and build-tools
RUN yes | sdkmanager --licenses \
    && sdkmanager "platforms;android-34" "platforms;android-36" "build-tools;34.0.0" "platform-tools"

# 4. Install Capacitor dependencies
COPY package*.json /app/
RUN npm install

# 5. Copy app files and template
COPY . /app

# 6. Set executable permissions
RUN chmod +x /app/convert.sh /app/template/android/gradlew

# 7. Default command runs conversion CLI
ENTRYPOINT ["node", "/app/scripts/convert.mjs"]
CMD ["--help"]
