# Online C++/Java Compiler

An online compiler supporting C++ and Java code execution with input capabilities. This project leverages Docker for isolated code execution environments and Supabase for PostgreSQL server management.

---

## Features

- **Multi-language Support**: Supports C++ and Java code execution.
- **User Input**: Provides a way for users to input data for their programs.
- **Docker-based Isolation**: Ensures a secure and isolated environment for code execution using Docker.
- **Supabase Integration**: Utilizes Supabase to manage a PostgreSQL server for backend operations.

---

## Technologies Used

- **Frontend**: Next.js for a responsive and modern user interface.
- **Backend**: Express.js for managing API requests.
- **Database**: PostgreSQL (via Supabase) for data persistence.
- **Code Execution Environment**:
  - Docker for creating isolated environments.
  - Custom `run.sh` script for executing code inside Docker containers.

---

## Project Architecture

1. **Frontend**:
   - Built using Next.js.
   - Features a Monaco Editor integration for a rich code editing experience.

2. **Backend**:
   - Express.js handles API requests for compiling and executing code.
   - APIs interact with Docker to manage isolated containers for each code execution request.

3. **Database**:
   - Supabase provides a PostgreSQL server for storing user data, program metadata, and execution logs.

4. **Code Execution**:
   - Docker creates isolated environments for running user-submitted code.
   - A `run.sh` script is used to execute the code inside the container and capture the output.

---

## Setup Instructions

### Prerequisites

- **Node.js**: Version 14 or later.
- **Docker**: Installed and running.
- **Supabase**: An active project with PostgreSQL enabled.

### Steps

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/Appurav/Compiler
   cd Compiler
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Set Up Supabase**:
   - Create a `.env` file and add your Supabase credentials:
     ```env
     SUPABASE_URL=your_supabase_url
     SUPABASE_KEY=your_supabase_key
     ```

4. **Build Docker Image**:
   ```bash
   docker build -t code-execution.env .
   ```

5. **Run the Application**:
   ```bash
   npm run dev
   ```

---

## Usage

1. Open the application in your browser (default: `http://localhost:3000`).
2. Select the programming language (C++ or Java).
3. Write or paste your code in the Monaco Editor.
4. Provide input data (if needed).
5. Click **Run** to execute the code.
6. View the output in the console section.

---

## File Structure

```
Compiler/
├── frontend/
│   ├── components/
│   └── pages/
├── backend/
│   ├── Dockerfile
│   └── run.sh
└── README.md
```

---

## Contributing

1. Fork the repository.
2. Create a new branch for your feature or bug fix:
   ```bash
   git checkout -b feature-name
   ```
3. Commit your changes and push them to your fork:
   ```bash
   git commit -m "Add feature-name"
   git push origin feature-name
   ```
4. Submit a pull request.

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

Special thanks to the contributors and the open-source community for their support and inspiration.
