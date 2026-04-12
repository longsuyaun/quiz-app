#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
自动更新题库脚本
将错题本 Markdown 文件转换为练习系统题库格式
"""

import json
import re
import sys
import os
from datetime import datetime

def parse_markdown(filepath):
    """解析 Markdown 错题文件"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 提取题目（支持多种格式）
    question = ""
    patterns = [
        r'\*\*题目\*\*:\s*(.+?)(?=\n\*\*|\n\n|$)',
        r'### 📝 题目\s*\n+(.+?)(?=\n##|\n---|$)',
        r'## 题目\s*\n+(.+?)(?=\n##|\n---|$)',
    ]
    for pattern in patterns:
        match = re.search(pattern, content, re.DOTALL)
        if match:
            question = match.group(1).strip()
            break
    
    # 提取选项
    options = []
    for opt in ['A', 'B', 'C', 'D']:
        opt_pattern = rf'(?:\*\*)?{opt}(?:\*\*)?[.:]\s*(.+?)(?=\n(?:\*\*)?[A-D](?:\*\*)?[.:]|\n\*\*答案|\n---|\Z)'
        opt_match = re.search(opt_pattern, content, re.DOTALL | re.IGNORECASE)
        if opt_match:
            options.append(f"{opt}. {opt_match.group(1).strip()}")
    
    # 提取答案
    answer = ""
    answer_patterns = [
        r'\*\*答案\*\*:\s*(\w+)',
        r'### ✅ 答案\s*\n+(?:\*\*)?(\w+)(?:\*\*)?',
    ]
    for pattern in answer_patterns:
        match = re.search(pattern, content, re.DOTALL | re.IGNORECASE)
        if match:
            answer = match.group(1).strip().upper()
            break
    
    # 提取解析
    analysis = ""
    analysis_patterns = [
        r'\*\*解析\*\*:\s*(.+?)(?=\n---|\n##|\Z)',
        r'### 🔍 解析\s*\n+(.+?)(?=\n##|\n---|\Z)',
    ]
    for pattern in analysis_patterns:
        match = re.search(pattern, content, re.DOTALL)
        if match:
            analysis = match.group(1).strip()
            break
    
    # 转换为 HTML
    analysis_html = analysis.replace('\n', '<br>')
    analysis_html = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', analysis_html)
    
    # 判断是否填空题
    is_fill = "填空" in question or len(options) == 1 and options[0] == "A. 填空题"
    
    return {
        'question': question,
        'options': options if not is_fill else ["填空题"],
        'answer': answer,
        'analysis': f"<p>{analysis_html}</p>",
        'isFill': is_fill
    }

def get_next_id(user, subject, index_path):
    """获取下一个题目 ID"""
    with open(index_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 找到对应用户和科目的题目
    pattern = rf'{user}:.*?{subject}:\\s*\\[([^]]*?)\\]'
    match = re.search(pattern, content, re.DOTALL)
    
    if match:
        questions_text = match.group(1)
        ids = re.findall(r'id:\s*(\d+)', questions_text)
        if ids:
            return max(int(id) for id in ids) + 1
    
    # 默认从 1000 开始
    return 1000

def update_question_bank(user, subject, question_data, index_path):
    """更新题库文件"""
    with open(index_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 获取下一个 ID
    new_id = get_next_id(user, subject, index_path)
    
    # 生成新题目 JSON
    is_fill = question_data.get('isFill', False)
    is_fill_str = ', isFill: true' if is_fill else ''
    
    # 转义引号
    question_escaped = question_data['question'].replace('"', '\\"').replace('\n', ' ')
    analysis_escaped = question_data['analysis'].replace('"', '\\"').replace('\n', '')
    options_json = json.dumps(question_data['options'], ensure_ascii=False)
    
    new_question = f"""
                    {{ id: {new_id}, question: "{question_escaped}", options: {options_json}, answer: "{question_data['answer']}", analysis: "{analysis_escaped}"{is_fill_str} }}"""
    
    # 找到对应科目的数组末尾
    # 匹配模式：user: { ... subject: [ ... ] }
    user_pattern = rf'({user}:\\s*{{)'
    user_match = re.search(user_pattern, content)
    
    if not user_match:
        print(f"❌ 未找到用户 {user}")
        return False
    
    user_start = user_match.end()
    
    # 找到该用户的结束位置
    brace_count = 1
    pos = user_start
    while pos < len(content) and brace_count > 0:
        if content[pos] == '{':
            brace_count += 1
        elif content[pos] == '}':
            brace_count -= 1
        pos += 1
    
    user_section = content[user_start:pos-1]
    
    # 在该用户部分找到科目
    subject_pattern = rf'({subject}:\\s*\\[)([^]]*?)(\\n\\s*\\])'
    subject_match = re.search(subject_pattern, user_section, re.DOTALL)
    
    if not subject_match:
        print(f"❌ 未找到科目 {subject}")
        return False
    
    # 计算在原文中的位置
    subject_start_in_user = subject_match.start(3)
    subject_start = user_start + subject_start_in_user
    
    # 插入新题目
    content = content[:subject_start] + ',' + new_question + content[subject_start:]
    
    with open(index_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✅ 已添加题目到 {user}/{subject} (ID: {new_id})")
    return True

def validate_javascript(index_path):
    """验证 JavaScript 语法"""
    import subprocess
    
    with open(index_path, 'r', encoding='utf-8') as f:
        html = f.read()
    
    # 提取 script 内容
    match = re.search(r'<script>([\\s\\S]*?)</script>', html)
    if not match:
        print("❌ 未找到 script 标签")
        return False
    
    js_code = match.group(1)
    
    # 用 node 验证
    try:
        result = subprocess.run(
            ['node', '-e', f'new Function(`{js_code}`)'],
            capture_output=True,
            text=True,
            timeout=5
        )
        if result.returncode == 0:
            print("✅ JavaScript 语法正确")
            return True
        else:
            print(f"❌ JavaScript 错误：{result.stderr}")
            return False
    except Exception as e:
        print(f"❌ 验证失败：{e}")
        return False

def main():
    if len(sys.argv) < 4:
        print("用法：python3 update-quiz.py <用户> <科目> <错题文件路径>")
        print("用户：zuozuo 或 youyou")
        print("科目：physics, chemistry, biology, math")
        sys.exit(1)
    
    user = sys.argv[1]
    subject = sys.argv[2]
    filepath = sys.argv[3]
    index_path = '/root/.openclaw/workspace/quiz-app/index.html'
    
    if not os.path.exists(filepath):
        print(f"❌ 文件不存在：{filepath}")
        sys.exit(1)
    
    print(f"📝 解析错题文件：{filepath}")
    question_data = parse_markdown(filepath)
    
    if not question_data['question']:
        print("❌ 未找到题目内容")
        sys.exit(1)
    
    print(f"✅ 解析成功：{question_data['question'][:50]}...")
    
    print(f"🔧 更新题库...")
    if not update_question_bank(user, subject, question_data, index_path):
        sys.exit(1)
    
    print(f"🔍 验证 JavaScript 语法...")
    if not validate_javascript(index_path):
        print("⚠️  语法验证失败，请手动检查")
        sys.exit(1)
    
    print(f"✅ 完成！")

if __name__ == '__main__':
    main()
