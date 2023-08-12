# Use Node.js 18.16.0 as the base image
FROM node:18.16.0-alpine

# Set the working directory to /app
WORKDIR /ui

# Copy the package.json and package-lock.json files to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files to the working directory
COPY . .

# Expose port 3000 for the app to run on
EXPOSE 3000

# Start the app
CMD ["npm", "start"]