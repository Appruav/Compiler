// server.js
const express = require('express');
const { exec ,execSync} = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());
// Create temporary directories for code execution
const TEMP_DIR = path.join(__dirname, 'temp');
fs.mkdir(TEMP_DIR, { recursive: true });

try {
    execSync('docker image inspect code-execution-env || docker build -t code-execution-env .');
    console.log('Docker image is ready.');
} catch (err) {
    console.error('Error preparing Docker image:', err.message);
}

// Function to clean up temporary files
async function cleanupFiles(filenames) {
    for (const filename of filenames) {
        try {
            await fs.unlink(filename);
        } catch (error) {
            console.error(`Error cleaning up ${filename}:`, error);
        }
    }
}


function executeInDocker(language, code, input = '') {
    return new Promise(async (resolve, reject) => {
        try {
            const timestamp = Date.now();
            const codeFile = path.join(TEMP_DIR, `code_${timestamp}.${language === 'java' ? 'java' : 'cpp'}`);
            const inputFile = path.join(TEMP_DIR, `input_${timestamp}.txt`);
            
         
            await fs.writeFile(codeFile, code);
            await fs.writeFile(inputFile, input);

           // we used ternary so that we can run java too becoz there name starts with java always
            const dockerCmd = language === 'java'
            ? `docker run --rm -v "${TEMP_DIR}:/app/code" \
                --network none \
                --memory=512m \
                --cpus=1 \
                code-execution-env java Main "/app/code/${path.basename(inputFile)}"`
            : `docker run --rm -v "${TEMP_DIR}:/app/code" \
                --network none \
                --memory=512m \
                --cpus=1 \
                code-execution-env cpp "/app/code/${path.basename(codeFile)}" "/app/code/${path.basename(inputFile)}"`;


            exec(dockerCmd, { timeout: 15000 }, (error, stdout, stderr) => {
                cleanupFiles([codeFile, inputFile]);

                if (error) {
                    if (error.killed) {
                        resolve({ status: 'error', message: 'Execution timed out' });
                    } else {
                        resolve({ 
                            status: 'error', 
                            message: stderr || error.message 
                        });
                    }
                } else {
                    resolve({
                        status: 'success',
                        output: stdout,
                        error: stderr
                    });
                }
            });
        } catch (error) {
            reject({ status: 'error', message: error.message });
        }
    });
}

app.post('/api/compile', async (req, res) => {
    const { language, code, input = '' } = req.body;

    if (!language || !code) {
        return res.status(400).json({ 
            status: 'error', 
            message: 'Language and code are required' 
        });
    }

    if (!['java', 'cpp'].includes(language)) {
        return res.status(400).json({ 
            status: 'error', 
            message: 'Unsupported language' 
        });
    }

    try {
        const result = await executeInDocker(language, code, input);
        res.json(result);
    } catch (error) {
        res.status(500).json({ 
            status: 'error', 
            message: 'Internal server error' 
        });
    }
});

const PORT = process.env.PORT || 9000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

app.get('/health', (req, res) => {
    res.json({ status: 'healthy' });
});