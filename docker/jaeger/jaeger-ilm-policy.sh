#!/bin/sh

# https://www.jaegertracing.io/docs/1.23/deployment/#elasticsearch-ilm-support

curl -X PUT http://elasticsearch:9200/_ilm/policy/jaeger-ilm-policy \
-H 'Content-Type: application/json; charset=utf-8' \
--data-binary @- << EOF
{
  "policy": {
    "phases": {
      "hot": {
        "min_age": "0ms",
        "actions": {
          "rollover": {
            "max_age": "10s"
          },
          "set_priority": {
            "priority": 100
          }
        }
      },
      "delete": {
        "min_age": "20s",
        "actions": {
          "delete": {}
        }
      }
    }
  }
}
EOF
