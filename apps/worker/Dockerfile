FROM python:3.12-slim
WORKDIR /app
COPY packages/ /packages/
COPY apps/worker/ .
RUN pip install --no-cache-dir -e .
CMD ["celery", "-A", "app.worker", "worker", "--loglevel=info", "--concurrency=4"]
