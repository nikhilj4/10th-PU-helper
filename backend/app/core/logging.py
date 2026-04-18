import logging
import os
from logging.handlers import RotatingFileHandler


def configure_logging() -> None:
    log_dir = os.path.join(os.path.dirname(__file__), "..", "..", "logs")
    log_dir = os.path.abspath(log_dir)
    os.makedirs(log_dir, exist_ok=True)
    log_file = os.path.join(log_dir, "app.log")

    formatter = logging.Formatter("%(asctime)s %(levelname)s [%(name)s] %(message)s")
    root = logging.getLogger()
    root.setLevel(logging.INFO)
    root.handlers.clear()

    console = logging.StreamHandler()
    console.setFormatter(formatter)
    root.addHandler(console)

    file_handler = RotatingFileHandler(log_file, maxBytes=2_000_000, backupCount=5)
    file_handler.setFormatter(formatter)
    root.addHandler(file_handler)
