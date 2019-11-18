#!/bin/bash

#######################################################################
# Config file path and name
#######################################################################

filepath=$(echo "$0" | grep -o -P '(?<=).*(?=/transaction.sh)')
file="$filepath/config.js"

#######################################################################
# Check if transaction string empty
#######################################################################

if [[ -z "$1" ]]; then
    echo "Error: txid not defined."
    exit 0
fi

#######################################################################
# Read line by line to grab database connection info
#######################################################################

while IFS= read -r line
do
    if [[ $line == *"dbHost"* ]]; then
        dbhost="$line"
    fi
    if [[ $line == *"dbName"* ]]; then
        dbName="$line"
    fi
    if [[ $line == *"dbUser"* ]]; then
        dbUser="$line"
    fi
    if [[ $line == *"dbPassword"* ]]; then
        dbPassword="$line"
    fi
    if [[ $line == *"dbPort"* ]]; then
        dbPort="$line"
    fi
done <"$file"

#######################################################################
# Check if any result is empty and exit
#######################################################################

if [[ -z "$dbhost" ]]; then
    echo "Error: dbhost not defined."
    exit 0
fi
if [[ -z "$dbName" ]]; then
    echo "Error: dbName not defined."
    exit 0
fi
if [[ -z "$dbUser" ]]; then
    echo "Error: dbUser not defined."
    exit 0
fi
if [[ -z "$dbPassword" ]]; then
    echo "Error: dbPassword not defined."
    exit 0
fi
if [[ -z "$dbPort" ]]; then
    echo "Error: dbPort not defined."
    exit 0
fi

#######################################################################
# Parse strings
#######################################################################

dbhost=$(echo $dbhost | sed 's/^.*dbHost"//' | grep -o -P '(?<=").*(?=")')
dbName=$(echo $dbName | sed 's/^.*dbName"//' | grep -o -P '(?<=").*(?=")')
dbUser=$(echo $dbUser | sed 's/^.*dbUser"//' | grep -o -P '(?<=").*(?=")')
dbPassword=$(echo $dbPassword | sed 's/^.*dbPassword"//' | grep -o -P '(?<=").*(?=")')
dbPort=$(echo "${dbPort//[!0-9]/}")

#######################################################################
# Check if any result is empty and exit
#######################################################################

if [[ -z "$dbhost" ]]; then
    echo "Error: dbhost not defined."
    exit 0
fi
if [[ -z "$dbName" ]]; then
    echo "Error: dbName not defined."
    exit 0
fi
if [[ -z "$dbUser" ]]; then
    echo "Error: dbUser not defined."
    exit 0
fi
if [[ -z "$dbPassword" ]]; then
    echo "Error: dbPassword not defined."
    exit 0
fi
if [[ -z "$dbPort" ]]; then
    echo "Error: dbPort not defined."
    exit 0
fi

#######################################################################
# Write transaction to db
#######################################################################

mysql --user=$dbUser --password=$dbPassword --host=$dbhost --port=$dbPort $dbName 2>/dev/null << EOF
INSERT INTO transactions (txid) VALUES ("$1");
EOF

#######################################################################
# Success
#######################################################################

echo "Transaction received and saved: $1"