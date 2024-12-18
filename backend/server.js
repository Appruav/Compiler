const express = require('express');
const { exec, execSync } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');
const util = require('util');

const app = express();
app.use(express.json());
app.use(cors());

// Force immediate logging
const log = (...args) => {
    console.log('[' + new Date().toISOString() + ']', ...args);
    process.stdout.write('');
};

const error = (...args) => {
    console.error('[' + new Date().toISOString() + ']', ...args);
    process.stderr.write('');
};

const TEMP_DIR = path.join(__dirname, 'temp');
const execPromise = util.promisify(exec);

(async () => {
    try {
        log('Starting server initialization...');
        await fs.mkdir(TEMP_DIR, { recursive: true });
        log(`Created/verified temp directory at: ${TEMP_DIR}`);
        
        log('Checking Docker image...');
        const dockerResult = execSync('docker image inspect code-execution-env || docker build -t code-execution-env .', { encoding: 'utf8' });
        log('Docker image is ready');
    } catch (err) {
        error('Initialization error:', err);
    }
})();

async function cleanupFiles(filenames) {
    for (const filename of filenames) {
        try {
            await fs.unlink(filename);
            log(`Cleaned up file: ${filename}`);
        } catch (err) {
            error(`Error cleaning up ${filename}:`, err);
        }
    }
}
function executeInDocker(language, code, input = '') {
    return new Promise(async (resolve, reject) => {
        const timestamp = Date.now();
        const className = 'Main';
        const codeFile = path.join(TEMP_DIR, `${className}.${language === 'java' ? 'java' : 'cpp'}`);
        const inputFile = path.join(TEMP_DIR, `input_${timestamp}.txt`);
        
        try {
            log(`Starting execution for ${language}`);
            log('Writing files...');
            await fs.writeFile(codeFile, code);
            await fs.writeFile(inputFile, input);
            log('Files written successfully');

            const dockerCmd = `docker run --rm \
                -v "${TEMP_DIR}:/app/code" \
                --network none \
                --memory=512m \
                --cpus=1 \
                code-execution-env \
                ${language} "/app/code/${path.basename(codeFile)}" "/app/code/${path.basename(inputFile)}"`;
            
            log('Executing Docker command:', dockerCmd);

            const { stdout, stderr } = await execPromise(dockerCmd, { timeout: 15000 });
            log('Docker execution completed');
            if (stdout) log('stdout:', stdout);
            if (stderr) log('stderr:', stderr);

            // Only cleanup after ensuring we have the output
            await cleanupFiles([codeFile, inputFile]);
            
            // If we have stdout, consider it a success even if there's stderr
            if (stdout || !stderr) {
                resolve({
                    status: 'success',
                    output: stdout.trim(),
                    error: stderr
                });
            } else {
                resolve({ 
                    status: 'error', 
                    message: stderr,
                    details: { stdout, stderr }
                });
            }

        } catch (err) {
            error('Error in executeInDocker:', err);
            await cleanupFiles([codeFile, inputFile]);
            
            if (err.killed) {
                resolve({ status: 'error', message: 'Execution timed out' });
            } else {
                resolve({ 
                    status: 'error', 
                    message: err.stderr || err.message,
                    details: { stdout: err.stdout, stderr: err.stderr, error: err.message }
                });
            }
        }
    });
}
app.post('/api/compile', async (req, res) => {
    const { language, code, input = '' } = req.body;
    
    log('\n=== New Compilation Request ===');
    log('Language:', language);
    log('Code:', code);
    log('Input:', input);

    if (!language || !code) {
        error('Missing required fields');
        return res.status(400).json({ 
            status: 'error', 
            message: 'Language and code are required' 
        });
    }

    if (!['java', 'cpp'].includes(language)) {
        error('Unsupported language:', language);
        return res.status(400).json({ 
            status: 'error', 
            message: 'Unsupported language' 
        });
    }

    try {
        const result = await executeInDocker(language, code, input);
        log('Execution result:', result);
        res.json(result);
    } catch (err) {
        error('Error in /api/compile:', err);
        res.status(500).json({ 
            status: 'error', 
            message: err.message || 'Internal server error',
            details: err
        });
    }
});

const PORT = 9000;
app.listen(PORT, () => {
    log(`Server running on port ${PORT}`);
    log(`Temp directory: ${TEMP_DIR}`);
    log('Ready to accept requests');
});

app.get('/health', (req, res) => {
    log('Health check request received');
    res.json({ status: 'healthy' });
});