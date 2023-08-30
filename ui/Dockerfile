# Use the official Node image.
FROM node:18.16.0-alpine

# Set the working directory
WORKDIR /app

# Add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

# Copy package.json and yarn.lock
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn


# Copy local code to the container
COPY . .

# Run the application
CMD ["yarn", "start"]