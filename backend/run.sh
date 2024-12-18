#!/bin/bash

# Get arguments
LANGUAGE=$1    # First argument: language (cpp or java)
CODE_FILE=$2   # Second argument: path to the code file
INPUT_FILE=$3  # Third argument: path to the input file

# Function to handle errors
handle_error() {
    echo "Error: $1" >&2
    exit 1
}

case "$LANGUAGE" in
    "cpp")
        # Compile and run C++ code
        g++ -o /app/program "$CODE_FILE" || handle_error "Compilation failed"
        if [ -f "$INPUT_FILE" ]; then
            /app/program < "$INPUT_FILE"
        else
            /app/program
        fi
        ;;
    "java")
        # Get the directory containing the source file
        DIR=$(dirname "$CODE_FILE")
        CLASS_NAME=$(basename "$CODE_FILE" .java)
        
        # Compile Java code
        cd "$DIR" || handle_error "Failed to change to source directory"
        javac "$CLASS_NAME.java" || handle_error "Compilation failed"
        
        # Run Java code
        if [ -f "$INPUT_FILE" ]; then
            java "$CLASS_NAME" < "$INPUT_FILE"
        else
            java "$CLASS_NAME"
        fi
        ;;
    *)
        handle_error "Unsupported language: $LANGUAGE"
        ;;
esac