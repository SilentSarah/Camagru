#!/bin/bash
while true; do
    php -S localhost:8000 -t ./src/backend &
    PHP_PID=$!
    inotifywait -q -r -e modify,delete,move --exclude 'static/' ./src/backend
    kill $PHP_PID
    wait $PHP_PID 2>/dev/null
done
