FROM python:3.12-slim
WORKDIR /app
COPY packages/ /packages/
COPY apps/builder-api/ .
RUN pip install --no-cache-dir -e .
EXPOSE 8001
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]
