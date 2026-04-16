#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
修复 index.html，使其从 question-bank.json 动态加载题目
"""

import json
from pathlib import Path

# 配置
BASE_DIR = Path(__file__).parent.parent
QUIZ_APP_DIR = BASE_DIR / "quiz-app"

def fix_index_html():
    """修复 index.html"""
    index_html_path = QUIZ_APP_DIR / "index.html"
    question_bank_path = QUIZ_APP_DIR / "question-bank.json"
    
    # 读取 question-bank.json
    with open(question_bank_path, 'r', encoding='utf-8') as f:
        question_bank = json.load(f)
    
    # 读取 index.html
    with open(index_html_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    # 找到需要修改的位置
    new_lines = []
    i = 0
    modified = False
    
    while i < len(lines):
        line = lines[i]
        
        # 1. 在 <script> 标签后插入 loadQuestionBank 函数
        if '<script>' in line and not modified:
            new_lines.append(line)
            new_lines.append('\n')
            new_lines.append('// 从 question-bank.json 动态加载题目\n')
            new_lines.append('let questionBank = null;\n')
            new_lines.append('\n')
            new_lines.append('async function loadQuestionBank() {\n')
            new_lines.append("    const response = await fetch('question-bank.json');\n")
            new_lines.append('    questionBank = await response.json();\n')
            new_lines.append('    initApp();\n')
            new_lines.append('}\n')
            new_lines.append('\n')
            new_lines.append('// 初始化函数\n')
            new_lines.append('function initApp() {\n')
            new_lines.append('    // 设置默认用户\n')
            new_lines.append("    const userButtons = document.querySelectorAll('.user-btn');\n")
            new_lines.append('    userButtons.forEach((btn, index) => {\n')
            new_lines.append('        if (index === 0) {\n')
            new_lines.append("            btn.classList.add('active');\n")
            new_lines.append('        } else {\n')
            new_lines.append("            btn.classList.remove('active');\n")
            new_lines.append('        }\n')
            new_lines.append('    });\n')
            new_lines.append('\n')
            new_lines.append('    // 加载题库\n')
            new_lines.append('    updateQuestionBank();\n')
            new_lines.append('}\n')
            new_lines.append('\n')
            modified = True
            i += 1
            continue
        
        # 2. 修改 getMergedQuestions 函数
        if 'const merged = JSON.parse(JSON.stringify(originalQuestions));' in line:
            new_lines.append('            const merged = JSON.parse(JSON.stringify(questionBank));\n')
            i += 1
            continue
        
        # 3. 修改最后的调用
        if 'updateQuestionBank();' in line and i == len(lines) - 3:
            new_lines.append('        // 页面加载时调用 loadQuestionBank\n')
            new_lines.append('        loadQuestionBank();\n')
            i += 1
            continue
        
        # 其他行保持不变
        new_lines.append(line)
        i += 1
    
    # 保存
    with open(index_html_path, 'w', encoding='utf-8') as f:
        f.writelines(new_lines)
    
    print("✅ index.html 已修复")
    print(f"   - 现在从 question-bank.json 动态加载题目")
    print(f"   - 题目数量：{sum(len(v) for v in question_bank['zuozuo'].values()) + sum(len(v) for v in question_bank['youyou'].values())} 题")

if __name__ == "__main__":
    fix_index_html()
