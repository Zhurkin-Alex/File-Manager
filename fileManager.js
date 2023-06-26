import fs from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';
import zlib from 'zlib';

const rootDirectory = path.parse(process.cwd()).root;
let currentDirectory = process.cwd();
const args = process.argv.slice(2);
const usernameArg = args.find((arg) => arg.startsWith('--username='));
const username = usernameArg ? usernameArg.split('=')[1] : null;


function printCurrentDirectory() {
  console.log(`You are currently in ${currentDirectory}`);
}

function handleCommand(command) {
  const [operation, ...args] = command.trim().split(' ');
  const argument = args.join(' ');

  switch (operation) {
    case 'up':
      goUpper();
      break;
    case 'cd':
      changeDirectory(argument);
      break;
    case 'ls':
      listFiles();
      break;
    case 'touch':
      createFile(argument);
      break;
    case 'rm':
      deleteFile(argument);
      break;
    case 'cat':
      readFile(argument);
      break;
    case 'add':
      createEmptyFile(argument);
      break;
    case 'rn':
      renameFile(argument);
      break;
    case 'cp':
      copyFile(argument);
      break;
    case 'mv':
      moveFile(argument);
      break;
    case 'os':
      versionOS(argument);
      break;
    case 'hash':
      calculateFileHash(argument);
      break;
    case 'compress':
      compressFile(argument);
      break;
    case 'decompress':
      decompressFile(argument);
      break;
    case 'decompress':
      decompressFile(argument);
      break;
    case '.exit':
      exit(username);
    break;
    default:
      console.log('Invalid input');
      printCurrentDirectory();
      break;
  }
}

function compressFile(filePaths) {
    const [sourcePath, destinationPath] = filePaths.split(' ');

    const sourceFilePath = path.resolve(currentDirectory, sourcePath);
    const destinationFilePath = path.resolve(currentDirectory, destinationPath);
    
    const readStream = fs.createReadStream(sourceFilePath);
    const writeStream = fs.createWriteStream(destinationFilePath);
    const compressStream = zlib.createBrotliCompress();
    
    readStream.pipe(compressStream).pipe(writeStream);
    
    writeStream.on('finish', () => {
        console.log(`File compressed successfully: ${destinationPath}`);
        printCurrentDirectory();
    });
    
    writeStream.on('error', () => {
        console.log('Compression failed');
        printCurrentDirectory();
    });
}

function decompressFile(filePaths) {
    const [sourcePath, destinationPath] = filePaths.split(' ');
  
    const sourceFilePath = path.resolve(currentDirectory, sourcePath);
    const destinationFilePath = path.resolve(currentDirectory, destinationPath);
  
    const readStream = fs.createReadStream(sourceFilePath);
    const writeStream = fs.createWriteStream(destinationFilePath);
    const decompressStream = zlib.createBrotliDecompress();
  
    readStream.pipe(decompressStream).pipe(writeStream);
  
    writeStream.on('finish', () => {
      console.log(`File decompressed successfully: ${destinationPath}`);
      printCurrentDirectory();
    });
  
    writeStream.on('error', () => {
      console.log('Decompression failed');
      printCurrentDirectory();
    });
}

function versionOS(command) {
    switch (command) {
      case '--EOL':
        const eol = JSON.stringify(os.EOL);
        console.log(`End-Of-Line (EOL): ${eol}`);
        break;
      case '--cpus':
        const cpus = os.cpus();
        console.log(`Number of CPUs: ${cpus.length}`);
        cpus.forEach((cpu, index) => {
          console.log(`CPU ${index + 1}: Model - ${cpu.model}, Clock Rate - ${cpu.speed} MHz`);
        });
        break;
      case '--homedir':
        const homedir = os.homedir();
        console.log(`Home Directory: ${homedir}`);
        break;
      case '--username':
        const username = os.userInfo().username;
        console.log(`Current System User Name: ${username}`);
        break;
      case '--architecture':
        const architecture = process.arch;
        console.log(`Node.js Binary Architecture: ${architecture}`);
        break;
      default:
        console.log('Invalid input');
        break;
    }
}

function calculateFileHash(filePath) {
    const absolutePath = path.resolve(currentDirectory, filePath);
  
    fs.readFile(absolutePath, (err, data) => {
      if (err) {
        console.log('Operation failed');
      } else {
        const hash = crypto.createHash('sha256').update(data).digest('hex');
        console.log(`Hash for ${filePath}: ${hash}`);
      }
      printCurrentDirectory();
    });
}

function goUpper() {
  if (currentDirectory === rootDirectory) {
    console.log('Invalid input');
  } else {
    const parentDirectory = path.dirname(currentDirectory);
    if (path.basename(parentDirectory) === 'File-Manager') {
      currentDirectory = parentDirectory;
      printCurrentDirectory();
    } else {
      console.log('Invalid input');
    }
  }
}

function changeDirectory(pathToDirectory) {
  const absolutePath = path.resolve(currentDirectory, pathToDirectory);

  fs.stat(absolutePath, (err, stats) => {
    if (err) {
      console.log('Operation failed');
    } else if (!stats.isDirectory()) {
      console.log('Invalid input');
    } else {
      currentDirectory = absolutePath;
      printCurrentDirectory();
    }
  });
}

function listFiles() {
  fs.readdir(currentDirectory, { withFileTypes: true }, (err, entries) => {
    if (err) {
      console.log('Operation failed');
    } else {
      const directories = [];
      const files = [];

      entries.forEach((entry) => {
        if (entry.isDirectory()) {
          directories.push(entry.name);
        } else if (entry.isFile()) {
          files.push(entry.name);
        }
      });

      directories.sort();
      files.sort();

      const sortedEntries = [...directories, ...files];

      const tableData = sortedEntries.map((entry, index) => ({
        Index: index + 1,
        Name: entry,
        Type: directories.includes(entry) ? 'Directory' : 'File',
      }));

      console.table(tableData);
    }

    printCurrentDirectory();
  });
}

function createFile(filename) {
  const filePath = path.resolve(currentDirectory, filename);

  fs.writeFile(filePath, '', (err) => {
    if (err) {
      console.log('Operation failed');
    } else {
      console.log(`${filename} created`);
    }
    printCurrentDirectory();
  });
}

function deleteFile(filename) {
  const filePath = path.resolve(currentDirectory, filename);

  fs.unlink(filePath, (err) => {
    if (err) {
      console.log('Operation failed');
    } else {
      console.log(`${filename} deleted`);
    }
    printCurrentDirectory();
  });
}

function readFile(filename) {
  const filePath = path.resolve(currentDirectory, filename);

  const readable = fs.createReadStream(filePath);

  readable.on('data', (chunk) => {
    console.log(chunk.toString());
  });

  readable.on('end', () => {
    printCurrentDirectory();
  });

  readable.on('error', () => {
    console.log('Operation failed');
    printCurrentDirectory();
  });
}

function createEmptyFile(filename) {
  const filePath = path.resolve(currentDirectory, filename);

  fs.writeFile(filePath, '', (err) => {
    if (err) {
      console.log('Operation failed');
    } else {
      console.log(`${filename} created`);
    }
    printCurrentDirectory();
  });
}

function renameFile(arg) {
  const [oldPath, newPath] = arg.split(' ');

  const oldFilePath = path.resolve(currentDirectory, oldPath);
  const newFilePath = path.resolve(currentDirectory, newPath);

  fs.rename(oldFilePath, newFilePath, (err) => {
    if (err) {
      console.log('Operation failed');
    } else {
      console.log(`${oldPath} renamed to ${newPath}`);
    }
    printCurrentDirectory();
  });
}

function copyFile(arg) {
  const [sourcePath, destinationPath] = arg.split(' ');

  const sourceFilePath = path.resolve(currentDirectory, sourcePath);
  const destinationFilePath = path.resolve(currentDirectory, destinationPath);

  const readable = fs.createReadStream(sourceFilePath);
  const writable = fs.createWriteStream(destinationFilePath);

  readable.pipe(writable);

  readable.on('end', () => {
    console.log(`${sourcePath} copied to ${destinationPath}`);
    printCurrentDirectory();
  });

  readable.on('error', () => {
    console.log('Operation failed');
    printCurrentDirectory();
  });
}

function moveFile(arg) {
  const [sourcePath, destinationPath] = arg.split(' ');

  const sourceFilePath = path.resolve(currentDirectory, sourcePath);
  const destinationFilePath = path.resolve(currentDirectory, destinationPath);

  const readable = fs.createReadStream(sourceFilePath);
  const writable = fs.createWriteStream(destinationFilePath);

  readable.pipe(writable);

  readable.on('end', () => {
    fs.unlink(sourceFilePath, (err) => {
      if (err) {
        console.log('Operation failed');
      } else {
        console.log(`${sourcePath} moved to ${destinationPath}`);
      }
      printCurrentDirectory();
    });
  });

  readable.on('error', () => {
    console.log('Operation failed');
    printCurrentDirectory();
  });
}

function start(username) {
  printCurrentDirectory();
  process.stdin.resume();
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (data) => {
    const command = data.trim();
    handleCommand(command);
  });
}

function exit(username) {
  console.log(`Thank you for using File Manager, ${username}, goodbye!`);
  process.exit(0);
}

export { start, exit };
