from celery import Celery
from app.core.config import settings

app = Celery("quanta-ops-worker")
app.config_from_object({
    "broker_url": "sqs://",
    "broker_transport_options": {
        "region": settings.AWS_REGION,
        "visibility_timeout": 3600,
        "polling_interval": 1,
    },
    "task_serializer": "json",
    "result_serializer": "json",
    "accept_content": ["json"],
    "timezone": "UTC",
})
app.autodiscover_tasks(["app.tasks"])
