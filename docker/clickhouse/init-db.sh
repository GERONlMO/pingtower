#!/bin/bash
set -e

echo "Waiting for database '${CLICKHOUSE_DB}' to be ready..."
for i in {1..10}; do
    if clickhouse-client -n --query="SELECT 1" --database="${CLICKHOUSE_DB}"; then
        echo "Database is ready."
        break
    fi
    echo "Attempt $i: Database not ready, waiting 1 second..."
    sleep 1
done

echo "Creating table 'measurements' if it does not exist..."
clickhouse-client -n --database="${CLICKHOUSE_DB}" <<-EOSQL
    CREATE TABLE IF NOT EXISTS measurements (
      checkId UUID,
      serviceId String,
      timestamp DateTime,
      success Boolean,
      latencyMs UInt32,
      responseCode UInt16,
      errorMessage Nullable(String)
    ) ENGINE = MergeTree()
    PARTITION BY toYYYYMM(timestamp)
    ORDER BY (serviceId, checkId, timestamp);
EOSQL

echo "Initialization script finished."
