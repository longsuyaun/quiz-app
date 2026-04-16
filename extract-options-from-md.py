#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
从 Markdown 文件中提取选项并更新 question-bank.json
"""

import json
import re
from pathlib import Path

# 配置
BASE_DIR = Path(__file__).parent.parent
QUIZ_APP_DIR = BASE_DIR / "quiz-app"
DATA_DIR = BASE_DIR / "data" / "错题本"

def extract_options_from_markdown(markdown_text):
    """从 Markdown 文本中提取选项"""
    # 匹配 - A. xxx 格式的选项
    pattern = r'-\s*([A-D])\.\s*(.+?)(?=\n-|\n\n|$)'
    matches = re.findall(pattern, markdown_text, re.DOTALL)
    
    if matches:
        options = []
        for letter, text in matches:
            # 清理选项文本
            option_text = text.strip()
            # 移除末尾的 ✓ 等标记
            option_text = re.sub(r'\s*✓\s*$', '', option_text)
            option_text = re.sub(r'\s*✓$', '', option_text)
            if option_text:
                options.append(option_text)
        
        if len(options) >= 2:
            return options
    
    return None

def update_question_bank():
    """从 Markdown 文件更新 question-bank.json"""
    question_bank_path = QUIZ_APP_DIR / "question-bank.json"
    
    # 读取题库
    with open(question_bank_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # 统计
    updated_count = 0
    
    # 遍历每个学生的 Markdown 文件
    for student in ['zuozuo', 'youyou']:
        student_dir = DATA_DIR / student
        
        if not student_dir.exists():
            print(f"⚠️  {student} 目录不存在")
            continue
        
        # 遍历每个 Markdown 文件
        for md_file in student_dir.glob("*.md"):
            print(f"📄 处理 {md_file.name}...")
            
            with open(md_file, 'r', encoding='utf-8') as f:
                md_content = f.read()
            
            # 提取所有题目
            # 匹配 **题目**: 格式
            question_pattern = r'\*\*题目\*\*:\s*(.+?)(?=\n\n\*\*选项\*\*:\s*\n|- [A-D]\.)'
            questions = re.findall(question_pattern, md_content, re.DOTALL)
            
            # 提取所有选项块
            options_pattern = r'\*\*选项\*\*:\s*\n((?:- [A-D]\..+\n)+)'
            options_blocks = re.findall(options_pattern, md_content, re.DOTALL)
            
            # 提取所有正确答案
            answer_pattern = r'\*\*正确答案\*\*:\s*([A-D]+)'
            answers = re.findall(answer_pattern, md_content)
            
            # 提取所有解析
            analysis_pattern = r'\*\*解析\*\*:\s*(.+?)(?=\n\n\*\*|\n\n---|$)'
            analyses = re.findall(analysis_pattern, md_content, re.DOTALL)
            
            print(f"   找到 {len(questions)} 个题目")
            
            # 这里需要更复杂的逻辑来匹配题目和选项
            # 简化处理：暂时跳过
    
    # 保存
    with open(question_bank_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ 完成!")
    print(f"   更新了 {updated_count} 个题目")

if __name__ == "__main__":
    update_question_bank()
