from typing import Any, List, Optional, Dict
from google.cloud import bigquery
from google.auth import default



def retrieve_file_processed() -> list: 
    """
    Retrieve the list of processed refuge data files from the BigQuery table.
    :return: List of processed file names.
    """
    client = bigquery.Client()

    project = client.project

    print(f"Using GCP project: {project}")

    query = f"""
        SELECT DISTINCT source_file
        FROM `{project}.SPA.bronze_refuges`
    """

    query_job = client.query(query)
    results = query_job.result()

    processed_files = [row.source_file for row in results]
    print(f"Processed files: {processed_files}")

    return processed_files


retrieve_file_processed()


def retrieve_file_from_lake() -> list:
    """
    Retrieve the list of refuge data files from the GCS bucket.
    :return: List of file names in the GCS bucket.
    """
    import gcsfs
    import os

    fs = gcsfs.GCSFileSystem()

    GCP_BUCKET_NAME = os.environ.get("GCP_BUCKET_NAME")
    if not GCP_BUCKET_NAME:
        raise ValueError("Environment variable 'GCP_BUCKET_NAME' is not set.")

    prefix = f"gs://{GCP_BUCKET_NAME}/raw/refuges/"
    all_files = fs.ls(prefix)

    file_names = [file.split('/')[-1] for file in all_files]
    print(f"Files in GCS bucket: {file_names}")

    return file_names


retrieve_file_from_lake()