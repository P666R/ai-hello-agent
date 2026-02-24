import { selectAndHello } from './provider';

async function main() {
  try {
    const result = await selectAndHello();

    process.stdout.write(JSON.stringify(result, null, 2) + '\n');
  } catch (error) {
    // 1. Handle the collection of errors from auto-discovery
    if (error instanceof AggregateError) {
      console.error(`${error.message}:`);
      error.errors.forEach((error, index) => {
        console.error(` ${index + 1}: ${error.message}`);
      });
    }
    // 2. Handle standard single errors eg unsupported provider
    else if (error instanceof Error) {
      console.error(`Error: ${error.message}`);
    }
    // 3. Fallback for unknown types
    else {
      console.error('An unknown error occurred:', error);
    }

    process.exit(1);
  }
}

await main();
