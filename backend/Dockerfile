# Use the specified Python version
FROM python:3.11.1-slim

# Set environment variables
ENV PYTHONUNBUFFERED 1
ENV PYTHONDONTWRITEBYTECODE 1


# Set the working directory
WORKDIR /app

# Install pipenv
RUN pip install pipenv

# Copy Pipfile and Pipfile.lock
COPY Pipfile Pipfile.lock /app/

# Install packages using Pipfile
RUN pipenv install --system --deploy

# Copy the entire project
COPY . /app/

# Copy entrypoint script
COPY entrypoint.sh /app/entrypoint.sh

# Change permission of the entrypoint script to be executable
RUN chmod +x /app/entrypoint.sh

# Set the entrypoint
ENTRYPOINT ["sh", "/app/entrypoint.sh"]

# Change to the Django project directory
WORKDIR /app/src


# Run the server using the command from Procfile
CMD ["gunicorn", "--timeout", "1200", "--worker-tmp-dir", "/dev/shm", "--workers", "1", "--threads", "3", "--capture-output", "--reload", "flight_rewards.wsgi:application", "--bind", "0.0.0.0:8000"]
