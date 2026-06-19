FROM python:3.12-slim
WORKDIR /app
COPY packages/ /packages/
COPY services/auth-service/ .
RUN pip install --no-cache-dir -e .
EXPOSE 8003
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8003"]
