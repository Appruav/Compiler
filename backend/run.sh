#!/bin/bash

# Simple version of run.sh
LANGUAGE=$1    # First argument: language (cpp or java)
CODE_FILE=$2   # Second argument: path to the code file
INPUT_FILE=$3  # Third argument: path to the input file

case "$LANGUAGE" in
    "cpp")
        # Compile and run C++ code
        g++ -o program "$CODE_FILE"
        if [ -f "$INPUT_FILE" ]; then
            ./program < "$INPUT_FILE"
        else
            ./program
        fi
        ;;
    "java")
        # Compile and run Java code
        javac "$CODE_FILE"
        class_name=$(basename "$CODE_FILE" .java)
        if [ -f "$INPUT_FILE" ]; then
            java "$class_name" < "$INPUT_FILE"
        else
            java "$class_name"
        fi
        ;;
esac