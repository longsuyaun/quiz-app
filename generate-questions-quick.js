#!/usr/bin/env node
/**
 * 🦐 学习虾 - 快速题库生成器
 * 扫描所有 Markdown 文件并生成 quiz-app 题库 JSON
 */

const fs = require('fs');
const path = require('path');

const OUTPUT_FILE = '/Users/bao/.openclaw/workspace/finance-docs/zuozuo-youyou-学习资料完整版/apps/quiz-app/question-bank.json';

const DATA_SOURCES = {
    'zuozuo': [
        '/Users/bao/.openclaw/workspace/finance-docs/zuozuo-youyou-学习资料完整版/data/错题本/左左',
        '/Users/bao/.openclaw/workspace/finance-docs/zuozuo-youyou-学习资料完整版/students/zuozuo/错题本'
    ],
    'youyou': [
        '/Users/bao/.openclaw/workspace/finance-docs/zuozuo-youyou-学习资料完整版/data/错题本/右右'
    ]
};

const SUBJECT_MAP = {
    '数学': 'math', '物理': 'physics', '化学': 'chemistry',
    '生物': 'biology', '英语': 'english', '语文': 'chinese'
};

function scanAllMarkdownFiles(dir, userCode, questions) {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
        const itemPath = path.join(dir, item);
        const itemStat = fs.statSync(itemPath);
        
        if (itemStat.isDirectory()) {
            // 递归扫描子目录
            scanAllMarkdownFiles(itemPath, userCode, questions);
        } else if (item.endsWith('.md')) {
            // 读取并解析 Markdown 文件
            const content = fs.readFileSync(itemPath, 'utf-8');
            const fileQuestions = parseMarkdownFile(content, itemPath);
            
            if (fileQuestions.length > 0) {
                console.log(`  ✅ ${path.relative(dir, itemPath)}: ${fileQuestions.length} 题`);
                
                // 根据文件路径推断学科
                let subject = 'physics'; // 默认物理
                const relativePath = path.relative(DATA_SOURCES[userCode][0], itemPath);
                
                // 从路径中推断学科
                for (const [cnName, code] of Object.entries(SUBJECT_MAP)) {
                    if (relativePath.includes(cnName)) {
                        subject = code;
                        break;
                    }
                }
                
                if (!questions[userCode][subject]) {
                    questions[userCode][subject] = [];
                }
                questions[userCode][subject].push(...fileQuestions);
            }
        }
    }
}

function parseMarkdownFile(content, filePath) {
    const questions = [];
    
    // 尝试格式 1: ### 第 X 题（带/不带✅）
    const blocks = content.split(/(?=###\s+第\s*[0-9]+\s*[题✅])/);
    for (const block of blocks) {
        if (!block.trim()) continue;
        const titleMatch = block.match(/###\s+第\s*([0-9]+)\s*[题✅]/);
        if (!titleMatch) continue;
        const q = parseQuestionBlock(block, parseInt(titleMatch[1]));
        if (q) questions.push(q);
    }
    
    // 尝试格式 4: ### 题 X/XXX：或 ### 题 X：
    if (questions.length === 0) {
        const format4Blocks = content.split(/(?=###\s+题\s+[0-9]+(?:\/[0-9]+)?：)/);
        for (const block of format4Blocks) {
            if (!block.trim()) continue;
            const titleMatch = block.match(/###\s+题\s*([0-9]+)(?:\/[0-9]+)?：/);
            if (!titleMatch) continue;
            const q = parseQuestionBlock(block, parseInt(titleMatch[1]));
            if (q) questions.push(q);
        }
    }
    
    return questions;
}

function parseQuestionBlock(block, id) {
    const q = { id, question: '', options: [], answer: '', analysis: '' };
    
    // 提取题目
    const questionMatch = block.match(/\*\*题目\*\*:\s*(.+?)(?=\n\n\*\*|\n\n- [A-D]\.|$)/s);
    if (questionMatch) {
        q.question = questionMatch[1].trim();
    }
    
    // 提取选项
    const optionsMatch = block.match(/\*\*选项\*\*:\s*\n((?:- [A-D]\.[^*]+\n)+)/s);
    if (optionsMatch) {
        const optionsText = optionsMatch[1];
        const optionLines = optionsText.split('\n').filter(line => line.trim() && !line.trim().startsWith('**'));
        q.options = optionLines.map(line => {
            // 移除 "- A. "、"- B. " 等
            return line.replace(/^- [A-D]\.\s*/, '').trim();
        });
    }
    
    // 提取答案
    let answerMatch = block.match(/\*\*正确答案\*\*:\s*([A-D]+)/);
    if (!answerMatch) {
        // 尝试 "你的答案" 格式
        answerMatch = block.match(/\*\*你的答案\*\*:\s*\*\*([A-D])\*\*/);
    }
    if (answerMatch) {
        q.answer = answerMatch[1];
    }
    
    // 提取解析
    const analysisMatch = block.match(/\*\*解析\*\*:\s*(.+?)(?=\n\n\*\*|\n\n---|$)/s);
    if (analysisMatch) {
        q.analysis = analysisMatch[1].trim();
    }
    
    if (q.question && q.answer) {
        if (q.options.length === 0) { q.options = ['填空题']; q.isFill = true; }
        return q;
    }
    return null;
}

// 主程序
console.log('🦐 学习虾快速题库生成器启动...\n');

const questionBank = { zuozuo: {}, youyou: {} };

for (const [userCode, sourceDirs] of Object.entries(DATA_SOURCES)) {
    const userName = userCode === 'zuozuo' ? '左左' : '右右';
    console.log(`📚 扫描 ${userName} 的错题本...`);
    
    for (const sourceDir of sourceDirs) {
        if (!fs.existsSync(sourceDir)) continue;
        console.log(`  📁 ${sourceDir}`);
        
        scanAllMarkdownFiles(sourceDir, userCode, questionBank);
    }
}

// 统计
console.log('\n📊 题库统计：');
for (const [userCode, subjects] of Object.entries(questionBank)) {
    const userName = userCode === 'zuozuo' ? '左左' : '右右';
    console.log(`  ${userName}:`);
    
    let total = 0;
    for (const [subject, questions] of Object.entries(subjects)) {
        console.log(`    ${subject}: ${questions.length} 题`);
        total += questions.length;
    }
    console.log(`    总计：${total} 题`);
}

// 保存
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(questionBank, null, 2), 'utf-8');
console.log(`\n✅ 题库已保存：${OUTPUT_FILE}`);
