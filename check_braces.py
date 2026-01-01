
def find_mismatch(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    stack = []
    for i, line in enumerate(lines):
        for j, char in enumerate(line):
            if char == '{':
                stack.append((i + 1, j + 1))
            elif char == '}':
                if not stack:
                    print(f"Extra closing brace at line {i + 1}, col {j + 1}")
                    return
                stack.pop()
                if not stack:
                    print(f"Main function closed at line {i + 1}, col {j + 1}")
    
    if stack:
        print(f"Unclosed brace at line {stack[-1][0]}, col {stack[-1][1]}")
    else:
        print("Braces are balanced")

find_mismatch(r'c:\Users\Faizan\Desktop\Monopoly\src\App.jsx')
