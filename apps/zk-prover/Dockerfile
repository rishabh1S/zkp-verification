# Use a Node.js base image
FROM node:18-slim

# Set the working directory inside the container
WORKDIR /app

# Install system dependencies, including git, rust, and cargo, for building circom from source
RUN apt-get update && \
    apt-get install -y build-essential git rustc cargo ca-certificates --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

# Install snarkjs globally from npm
RUN npm install -g snarkjs@latest

# Install circom from source
RUN git clone https://github.com/iden3/circom.git && \
    cd circom && \
    cargo build --release && \
    mv target/release/circom /usr/local/bin 

# Copy package.json and install dependencies
COPY package.json package-lock.json* ./
RUN npm install && npm cache clean --force

# Copy all the prover files into the container
COPY . .

# Copy the build directory into the container
COPY build ./build

# Set environment variables
ENV PORT=3001
EXPOSE 3001

# Run the Express server
CMD ["node", "index.js"]