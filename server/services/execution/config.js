// One config object per supported language. Adding a new language later
// (per the project brief) means: build a Dockerfile under docker/images/,
// add one entry here, and register it in the validator's language list -
// nothing else in the execution pipeline changes.
export const LANGUAGES = {
  cpp: {
    image: 'codearena-cpp',
    fileName: 'main.cpp',
    compileCommand: 'g++ -O2 -o main main.cpp',
    runCommand: './main',
    memoryMb: 256,
  },
  java: {
    image: 'codearena-java',
    // The submitted source must declare `public class Main` - javac
    // requires the public class name to match the filename.
    fileName: 'Main.java',
    compileCommand: 'javac Main.java',
    runCommand: 'java Main',
    memoryMb: 512, // JVM overhead needs more headroom than the raw limit
  },
  python: {
    image: 'codearena-python',
    fileName: 'main.py',
    compileCommand: null,
    runCommand: 'python3 main.py',
    memoryMb: 256,
  },
};

export const DEFAULT_TIME_LIMIT_MS = 5000;
export const COMPILE_TIME_LIMIT_MS = 10000;
