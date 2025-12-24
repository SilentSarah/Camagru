#!/bin/bash
while true; do
    php -S localhost:3000 -t ./src/frontend &
    PHP_PID=$!
    inotifywait -q -r -e modify,create,delete,move ./src/frontend
    kill $PHP_PID
    wait $PHP_PID 2>/dev/null
done

