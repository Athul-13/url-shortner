FROM node:latest

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy project files
COPY . .

# Expose port
EXPOSE 5174

# Start development server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

