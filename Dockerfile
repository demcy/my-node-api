# Use the official Node.js image.
FROM node:20

# Create and change to the app directory.
WORKDIR /usr/src/app

# Copy package.json and package-lock.json.
COPY package*.json ./

# Install dependencies.
RUN npm install

# Copy the rest of the application code.
COPY . .

# Install nodemon globally
RUN npm install -g nodemon

# Expose port 3000.
EXPOSE 3000

# Start the application with Nodemon
CMD ["npm", "run", "dev"]
