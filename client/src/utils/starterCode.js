// Java specifically requires a `public class Main` (javac/java need the
// public class name to match the filename the execution engine writes,
// Main.java) - the other two languages have no such constraint but get a
// minimal template for consistency.
export const STARTER_CODE = {
  cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    \n    return 0;\n}\n',
  java: 'import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        \n    }\n}\n',
  python: '# Write your solution below\n',
};

export const MONACO_LANGUAGE = { cpp: 'cpp', java: 'java', python: 'python' };

export const DIFFICULTY_TONE = { Easy: 'success', Medium: 'warning', Hard: 'error' };
