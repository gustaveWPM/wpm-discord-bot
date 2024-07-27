#!/bin/bash
set -e

echo "0 2 * * * root find /bot-app/traces -type f -mtime +30 -exec rm -f {} \; >> /var/log/cron.log 2>&1" > /etc/cron.d/daily-traces-cleanup
chmod 0644 /etc/cron.d/daily-traces-cleanup
crontab /etc/cron.d/daily-traces-cleanup

service cron start

# Calls CMD
exec "$@"
