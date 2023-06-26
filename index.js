import { start, exit } from './fileManager.js';

const args = process.argv.slice(2);
const usernameArg = args.find((arg) => arg.startsWith('--username='));
const username = usernameArg ? usernameArg.split('=')[1] : null;

if (!username) {
  console.log('Error: Please provide a username using the --username flag.');
  process.exit(1);
}

console.log(`Welcome to the File Manager, ${username}!`);

start(username);

process.on('SIGINT', () => {
  exit(username);
});

process.on('SIGTERM', () => {
  exit(username);
});
