#!/bin/bash

# Function to generate random data
generate_random_data() {
    echo "Starting new data generation..."
    
    # Clear existing data file if it exists
    echo -n "" > ./temp/data

    # Generate random number of lines (between 10-100)
    num_lines=$(( (RANDOM % 91) + 10 ))
    echo "Generating $num_lines lines of random data"

    # Generate the random data
    for ((i=1; i<=num_lines; i++)); do
        # Generate random line length (between 10-100)
        line_length=$(( (RANDOM % 91) + 10 ))
        
        # Generate random string and append to file
        LC_ALL=C tr -dc 'A-Za-z0-9!"#$%&'\''()*+,-./:;<=>?@[\]^_`{|}~' < /dev/urandom | \
        head -c $line_length >> ./temp/data
        
        # Add newline
        echo >> ./temp/data
    done
}

# Function to commit and push to git
git_commit_push() {
    local message="$1"
    local file="$2"
    
    echo "Committing and pushing changes..."
    
    # Check if file exists
    if [[ ! -f "$file" ]]; then
        echo "Error: File $file not found"
        return 1
    fi
    
    # Add and commit the file
    git add "$file"
    git commit -m "$message"
    
    # Push changes
    if ! git push; then
        echo "Error: Failed to push changes"
        return 1
    fi
    
    echo "Git operations completed"
    return 0
}

# Main script
main() {
    # Change to project directory
    cd "$HOME/CS 362/project/Group17-Project" || {
        echo "Error: Could not change to project directory"
        exit 1
    }

    # Pull changes
    git pull

    # Generate random number of iterations between 10 and 15
    iterations=$(( (RANDOM % 5) + 10 ))
    echo "Will run $iterations iterations"

    # Create temp directory and file
    mkdir -p ./temp
    touch ./temp/data

    # Run the iterations
    for ((j=1; j<=iterations; j++)); do
        echo "Running iteration $j of $iterations"
        echo "------------------------"
        generate_random_data
        git_commit_push "Update data" "./temp/data"
        echo "------------------------"
    done

    # After all iterations are complete, then cleanup
    echo "All iterations complete, cleaning up..."
    rm -f ./temp/data
    git commit -am "clean data files"
    git push
}

# Run the main function
main