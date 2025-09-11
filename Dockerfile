# Dev image for Expo with Node 20.19.x (Expo/RN required)
FROM node:20.19.4-bullseye

# Install build tools for native modules (safe for RN/Expo deps)
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        git \
        python3 \
        make \
        g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy only package manifests (kept for potential future use)
COPY package*.json ./

# Copy the rest of the app (not strictly required for bind mount dev, but handy)
COPY . .

ENV NODE_ENV=development \
    EXPO_NO_TELEMETRY=1 \
    CHOKIDAR_USEPOLLING=true \
    WATCHPACK_POLLING=true

# Common Expo/Metro ports
EXPOSE 8081 19000 19001 19002 19006

# Default command (overridden by compose to ensure fresh install on mount)
CMD ["npm", "run", "dev"]
