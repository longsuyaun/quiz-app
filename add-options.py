#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
为 question-bank.json 中的题目添加 options 字段
"""

import json
import re
from pathlib import Path

# 配置
BASE_DIR = Path(__file__).parent.parent
QUIZ_APP_DIR = BASE_DIR / "quiz-app"

def extract_options_from_question(question_text):
    """从题目文本中提取选项"""
    # 匹配 A. B. C. D. 格式的选项
    pattern = r'[A-D]\.[^\n]+'
    matches = re.findall(pattern, question_text)
    
    if matches:
        # 清理选项文本
        options = []
        for match in matches:
            # 移除开头的 "A. "、"B. " 等
            option_text = re.sub(r'^[A-D]\.\s*', '', match.strip())
            # 移除末尾的标点
            option_text = re.sub(r'[\s，。！？；：]*$', '', option_text)
            if option_text:
                options.append(option_text)
        
        if len(options) >= 2:
            return options
    
    return None

def add_options_to_questions():
    """为题目添加 options 字段"""
    question_bank_path = QUIZ_APP_DIR / "question-bank.json"
    
    # 读取题库
    with open(question_bank_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # 统计
    added_count = 0
    skipped_count = 0
    
    for student in ['zuozuo', 'youyou']:
        for subject, questions in data[student].items():
            for q in questions:
                # 检查是否已有 options
                if 'options' in q and q['options']:
                    continue
                
                # 尝试从题目文本中提取选项
                options = extract_options_from_question(q.get('question', ''))
                
                if options:
                    q['options'] = options
                    added_count += 1
                    print(f"✅ 为 {student}/{subject} 题目 {q.get('id')} 添加选项")
                else:
                    # 如果没有选项，跳过
                    skipped_count += 1
    
    # 保存
    with open(question_bank_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ 完成!")
    print(f"   添加了 {added_count} 个题目的选项")
    print(f"   跳过了 {skipped_count} 个题目（无法提取选项）")

if __name__ == "__main__":
    add_options_to_questions()
